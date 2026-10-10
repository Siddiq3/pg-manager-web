import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authPost, createApiClient } from './lib/api';
import LoginScreen from './screens/LoginScreen';
import Marketing from './screens/Marketing';
import BillingScreen from './screens/BillingScreen';
import DeleteAccountScreen from './screens/DeleteAccountScreen';
import BillingStatusErrorScreen from './screens/BillingStatusErrorScreen';

// For now the website covers sign-up, sign-in and billing; managing a PG is app-only.
// The dashboard is kept for later: set VITE_WEB_DASHBOARD=true to turn it back on.
const WEB_DASHBOARD = import.meta.env.VITE_WEB_DASHBOARD === 'true';
const Dashboard = lazy(() => import('./screens/Dashboard'));

function AppExperience({ deletionMode = false, onExitDeletion, authMode = 'login', onHome }) {
  // The access token lives in a ref so the API client stays stable: rebuilding
  // it on every refresh would remount the dashboard and refetch everything.
  const accessToken = useRef('');
  const restoreStarted = useRef(false);
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [entitlement, setEntitlement] = useState(null);
  const [entitlementState, setEntitlementState] = useState('idle');
  const [entitlementError, setEntitlementError] = useState('');
  const [localDeletion, setLocalDeletion] = useState(false);
  const [showPlans, setShowPlans] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('billing') === 'return');

  const applySession = useCallback((data) => {
    accessToken.current = data.accessToken;
    if (data.user) setUser(data.user);
    setSignedIn(true);
  }, []);

  const endSession = useCallback(() => {
    accessToken.current = '';
    setUser(null);
    setSignedIn(false);
  }, []);

  const client = useMemo(
    () =>
      createApiClient({
        getAccessToken: () => accessToken.current,
        onRefreshed: (data) => {
          accessToken.current = data.accessToken;
          if (data.user) setUser(data.user);
        },
        onSessionLost: endSession,
      }),
    [endSession]
  );

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;
    authPost('/auth/refresh', {})
      .then(({ data }) => applySession(data))
      .catch(() => {})
      .finally(() => setRestoring(false));
  }, [applySession]);

  const loadEntitlement = useCallback(async () => {
    if (!signedIn) { setEntitlement(null); setEntitlementState('idle'); setEntitlementError(''); return; }
    setEntitlementState('loading'); setEntitlementError('');
    try { const { data } = await client.get('/billing/status'); setEntitlement(data.entitlement); setEntitlementState('ready'); }
    catch (error) { setEntitlement(null); setEntitlementState('error'); setEntitlementError(error?.response?.data?.message || 'Unable to verify your subscription right now.'); }
  }, [signedIn, client]);
  useEffect(() => { loadEntitlement(); }, [loadEntitlement]);

  async function signOut() {
    await authPost('/auth/logout', {}).catch(() => null);
    endSession();
  }

  if (restoring) {
    return (
      <main className="auth-shell">
        <span className="spinner spinner-lg" aria-label="Loading" />
      </main>
    );
  }

  if (!signedIn) return <LoginScreen onSignedIn={applySession} initialMode={authMode} onHome={onHome} />;
  if (deletionMode || localDeletion) return <DeleteAccountScreen client={client} onDeleted={() => { endSession(); onExitDeletion?.(); }} onBack={() => localDeletion ? setLocalDeletion(false) : onExitDeletion?.()} />;
  if (entitlementState === 'idle' || entitlementState === 'loading') return <main className="auth-shell"><span className="spinner spinner-lg" aria-label="Loading subscription" /></main>;
  if (entitlementState === 'error') return <BillingStatusErrorScreen message={entitlementError} onRetry={loadEntitlement} onSignOut={signOut} onDelete={() => setLocalDeletion(true)} />;
  // Plans open when access has ended, when a trial user chooses to upgrade, or on the
  // return from Cashfree checkout (so the new subscription is synced and confirmed).
  if (!WEB_DASHBOARD || !entitlement.hasAccess || showPlans) {
    return (
      <BillingScreen
        client={client}
        user={user}
        entitlement={entitlement}
        onActive={(next) => { setEntitlement(next); setEntitlementState('ready'); setShowPlans(false); }}
        onBack={WEB_DASHBOARD && entitlement.hasAccess ? () => setShowPlans(false) : undefined}
        onSignOut={signOut}
      />
    );
  }

  return (
    <Suspense fallback={<main className="auth-shell"><span className="spinner spinner-lg" aria-label="Loading" /></main>}>
      <Dashboard client={client} user={user} entitlement={entitlement} onPlans={() => setShowPlans(true)} onSignOut={signOut} />
    </Suspense>
  );
}

export default function App() {
  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'marketing';
    return window.location.hash === '#delete-account' ? 'delete' : window.location.hash === '#app' ? 'app' : 'marketing';
  });

  useEffect(() => {
    if (view === 'app') {
      window.location.hash = '#app';
      return;
    }
    if (view === 'delete') {
      window.location.hash = '#delete-account';
      return;
    }

    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [view]);

  const [authMode, setAuthMode] = useState('login');
  const openApp = (mode) => { setAuthMode(mode); setView('app'); window.scrollTo(0, 0); };

  if (view === 'app') return <AppExperience authMode={authMode} onHome={() => setView('marketing')} />;
  if (view === 'delete') return <AppExperience deletionMode onExitDeletion={() => setView('marketing')} onHome={() => setView('marketing')} />;
  return <Marketing onStart={() => openApp('register')} onSignIn={() => openApp('login')} onDeleteAccount={() => setView('delete')} />;
}

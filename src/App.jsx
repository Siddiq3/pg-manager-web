import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authPost, createApiClient } from './lib/api';
import Dashboard from './screens/Dashboard';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  // The access token lives in a ref so the API client stays stable: rebuilding
  // it on every refresh would remount the dashboard and refetch everything.
  const accessToken = useRef('');
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [restoring, setRestoring] = useState(true);

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

  // The refresh cookie outlives the page, so a reload resumes the session
  // instead of dropping the owner back on the sign-in screen.
  useEffect(() => {
    authPost('/auth/refresh', {})
      .then(({ data }) => applySession(data))
      .catch(() => {})
      .finally(() => setRestoring(false));
  }, [applySession]);

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

  if (!signedIn) return <LoginScreen onSignedIn={applySession} />;

  return <Dashboard client={client} user={user} onSignOut={signOut} />;
}

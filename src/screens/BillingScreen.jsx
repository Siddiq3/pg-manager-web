import React, { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Check, ShieldCheck } from 'lucide-react';
import { Banner, Button } from '../components/ui';
import { errorMessage } from '../lib/api';

// Same catalog the backend enforces (src/config/subscriptionPlans.js there).
const PLANS = [
  { id: 'STARTER', name: 'Starter', price: 299, lines: ['1 property', '150 beds', 'No co-owners', 'Standard support'] },
  { id: 'PRO', name: 'Pro', price: 699, lines: ['Up to 3 properties', '450 beds', 'Up to 2 co-owners', 'Standard support'] },
  { id: 'GROWTH', name: 'Growth', price: 999, lines: ['Up to 10 properties', '1,000 beds', 'Up to 4 co-owners', 'Priority support'] },
];

let sdkPromise;
function loadCashfree() {
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      s.async = true;
      s.onload = () => resolve(window.Cashfree);
      s.onerror = () => reject(new Error('Unable to load secure checkout.'));
      document.head.appendChild(s);
    });
  }
  return sdkPromise;
}

export default function BillingScreen({ client, entitlement, onActive, onBack, onSignOut }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(entitlement);
  const [plan, setPlan] = useState('PRO');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('billing') !== 'return') return;
    setBusy(true);
    client.post('/billing/sync')
      .then((r) => { setStatus(r.data.entitlement); if (r.data.entitlement.status === 'ACTIVE') onActive(r.data.entitlement); })
      .catch((e) => setError(errorMessage(e, 'We could not confirm the subscription yet. Try again.')))
      .finally(() => { setBusy(false); window.history.replaceState(null, '', window.location.pathname + window.location.hash); });
  }, []);

  async function subscribe() {
    try {
      setBusy(true);
      setError('');
      const { data } = await client.post('/billing/checkout', { plan });
      const Cashfree = await loadCashfree();
      const cashfree = Cashfree({ mode: data.mode === 'production' ? 'production' : 'sandbox' });
      await cashfree.subscriptionsCheckout({ subsSessionId: data.subscriptionSessionId, redirectTarget: '_self' });
    } catch (e) {
      setError(errorMessage(e, 'Unable to start secure checkout.'));
    } finally {
      setBusy(false);
    }
  }

  const onTrial = status?.status === 'TRIAL';
  const chosen = PLANS.find((p) => p.id === plan);

  return (
    <main className="auth-shell">
      <section className="auth-card billing-card plans-card">
        <div className="auth-brand">
          <span className="brand-mark"><Building2 size={20} /></span>
          <div><strong>PG Manager</strong><p>Plan & billing</p></div>
        </div>
        <h1>{onTrial ? 'Choose a plan' : 'Subscription required'}</h1>
        <p className="auth-subtitle">
          {onTrial
            ? `${status.daysRemaining} day${status.daysRemaining === 1 ? '' : 's'} left in your 30-day free trial. The trial has Starter limits; choose a plan for more, or keep using the trial until it ends.`
            : 'Your free trial has ended. Choose a plan to keep using PG Manager. Your data is safe.'}
        </p>

        <div className="plan-grid" role="radiogroup" aria-label="Plan">
          {PLANS.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={plan === p.id} className={`plan-option${plan === p.id ? ' is-selected' : ''}`} onClick={() => setPlan(p.id)}>
              <span className="plan-name">{p.name}{onTrial && p.id === 'STARTER' && <em className="plan-tag">Your trial</em>}</span>
              <span className="plan-price">₹{p.price}<small>/month</small></span>
              <ul>{p.lines.map((line) => <li key={line}><Check size={14} />{line}</li>)}</ul>
            </button>
          ))}
        </div>

        <Banner>{error}</Banner>
        <div className="billing-security">
          <ShieldCheck size={20} />
          <span>Checkout is handled by Cashfree with UPI or card. PG Manager never receives or stores your card, UPI PIN or bank credentials.</span>
        </div>
        <Button onClick={subscribe} loading={busy}>Subscribe to {chosen.name} · ₹{chosen.price}/month</Button>
        {onBack
          ? <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} />Back to my PG</Button>
          : <Button variant="ghost" onClick={onSignOut}>Sign out</Button>}
      </section>
    </main>
  );
}

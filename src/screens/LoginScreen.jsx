import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { authPost, errorMessage } from '../lib/api';
import { Banner, Button, Field, PasswordField } from '../components/ui';
import { BedBoard } from '../components/BedBoard';
import '../auth.css';

const emptyForm = {
  name: '',
  identifier: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  otp: '',
  newPassword: '',
};

/** Counts down the resend cooldown the API reports after sending a code. */
function useCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return [seconds, setSeconds];
}

export default function LoginScreen({ onSignedIn, initialMode = 'login', onHome }) {
  const [mode, setMode] = useState(initialMode); // login | register | forgot
  const [method, setMethod] = useState('password'); // password | otp
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useCooldown();

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setNotice('');
    setForm({ ...emptyForm, email: form.email, identifier: form.identifier });
  }

  // Same call for signing in and resetting: the API always answers the same
  // way, so neither can be used to find out which emails are registered.
  async function requestCode(purpose) {
    const email = (purpose === 'reset' ? form.email : form.email || form.identifier).trim();
    if (!email) {
      setError('Enter your email address first.');
      return;
    }

    setSendingCode(true);
    setError('');
    try {
      const { data } = await authPost(purpose === 'reset' ? '/auth/forgot-password' : '/auth/send-otp', { email });
      setCooldown(data.resendAfterSeconds || 60);
      setNotice(data.message || 'If an account exists for this email, a code has been sent.');
    } catch (err) {
      setError(errorMessage(err, 'Could not send the code. Please try again.'));
    } finally {
      setSendingCode(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'register') {
        const { data } = await authPost('/auth/register', {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        onSignedIn(data);
        return;
      }

      if (mode === 'forgot') {
        await authPost('/auth/reset-password', {
          email: form.email.trim(),
          otp: form.otp.trim(),
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        });
        setMode('login');
        setMethod('password');
        setForm({ ...emptyForm, identifier: form.email.trim() });
        setNotice('Password updated. Sign in with your new password.');
        return;
      }

      const { data } =
        method === 'password'
          ? await authPost('/auth/login', { identifier: form.identifier.trim(), password: form.password })
          : await authPost('/auth/login-otp', { email: form.email.trim(), otp: form.otp.trim() });
      onSignedIn(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const codeLabel = cooldown > 0 ? `Resend in ${cooldown}s` : 'Email me a code';
  const submitLabel = { login: 'Sign in', register: 'Create account', forgot: 'Set new password' }[mode];

  const heading = {
    login: ['Welcome back', 'Sign in to manage your plan and billing.'],
    register: ['Start your free trial', '30 days free with Starter limits. No card needed.'],
    forgot: ['Reset your password', 'We’ll email you a 6-digit code to set a new one.'],
  }[mode];

  return (
    <main className="auth-split">
      <aside className="auth-aside" aria-hidden="true">
        <span className="auth-aside-brand"><span className="auth-mark">PG</span>PG Manager</span>
        <div className="auth-aside-body">
          <p className="auth-aside-title">Every bed in your PG, at a glance.</p>
          <div className="auth-aside-board"><BedBoard compact /></div>
          <p className="auth-aside-note">Occupied, vacant and on-notice beds for an example 21-bed property.</p>
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-top">
          {onHome ? (
            <button type="button" className="auth-back" onClick={onHome}><ArrowLeft size={18} />Home</button>
          ) : <span />}
          <span className="auth-top-brand"><span className="auth-mark">PG</span>PG Manager</span>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <header className="auth-head">
            <h1>{heading[0]}</h1>
            <p>{heading[1]}</p>
          </header>

          {mode !== 'forgot' && (
            <div className="auth-tabs" role="tablist" aria-label="Account">
              <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')}>Create account</button>
            </div>
          )}

          {mode === 'register' && (
            <>
              <Field label="Your name" name="name" value={form.name} onChange={update('name')} autoComplete="name" placeholder="Ravi Kumar" required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@example.com" required />
              <Field label="Mobile number" name="phone" value={form.phone} onChange={update('phone')} autoComplete="tel" inputMode="tel" placeholder="9876543210" required />
              <PasswordField label="Password" name="password" value={form.password} onChange={update('password')} autoComplete="new-password" hint="8+ characters with an uppercase letter, a number and a symbol." required />
              <PasswordField label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" required />
            </>
          )}

          {mode === 'login' && (
            <>
              <div className="auth-method" role="radiogroup" aria-label="Sign-in method">
                <button type="button" role="radio" aria-checked={method === 'password'} onClick={() => { setMethod('password'); setError(''); }}>Password</button>
                <button type="button" role="radio" aria-checked={method === 'otp'} onClick={() => { setMethod('otp'); setError(''); }}>Email code</button>
              </div>

              {method === 'password' ? (
                <>
                  <Field label="Email or mobile number" name="identifier" value={form.identifier} onChange={update('identifier')} autoComplete="username" placeholder="you@example.com" required />
                  <PasswordField label="Password" name="password" value={form.password} onChange={update('password')} autoComplete="current-password" required />
                  <button type="button" className="auth-link auth-link--right" onClick={() => switchMode('forgot')}>Forgot password?</button>
                </>
              ) : (
                <>
                  <div className="auth-inline">
                    <Field label="Email" name="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@example.com" required />
                    <Button type="button" variant="secondary" loading={sendingCode} disabled={cooldown > 0} onClick={() => requestCode('login')}>{codeLabel}</Button>
                  </div>
                  <Field label="6-digit code" name="otp" value={form.otp} onChange={update('otp')} inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="123456" className="auth-otp" required />
                </>
              )}
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="auth-inline">
                <Field label="Email" name="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@example.com" required />
                <Button type="button" variant="secondary" loading={sendingCode} disabled={cooldown > 0} onClick={() => requestCode('reset')}>{codeLabel}</Button>
              </div>
              <Field label="6-digit code" name="otp" value={form.otp} onChange={update('otp')} inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="123456" className="auth-otp" required />
              <PasswordField label="New password" name="newPassword" value={form.newPassword} onChange={update('newPassword')} autoComplete="new-password" hint="8+ characters with an uppercase letter, a number and a symbol." required />
              <PasswordField label="Confirm new password" name="confirmPassword" value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" required />
            </>
          )}

          <Banner tone="success" onDismiss={() => setNotice('')}>{notice}</Banner>
          <Banner tone="error" onDismiss={() => setError('')}>{error}</Banner>

          <Button type="submit" loading={busy} className="auth-submit">{submitLabel}</Button>

          <p className="auth-switch">
            {mode === 'login' && <>New to PG Manager? <button type="button" className="auth-link" onClick={() => switchMode('register')}>Start your free trial</button></>}
            {mode === 'register' && <>Already have an account? <button type="button" className="auth-link" onClick={() => switchMode('login')}>Sign in</button></>}
            {mode === 'forgot' && <button type="button" className="auth-link" onClick={() => switchMode('login')}>Back to sign in</button>}
          </p>
        </form>
      </section>
    </main>
  );
}

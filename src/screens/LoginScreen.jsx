import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { authPost, errorMessage } from '../lib/api';
import { Banner, Button, Field } from '../components/ui';

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

export default function LoginScreen({ onSignedIn }) {
  const [mode, setMode] = useState('login'); // login | register | forgot
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

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <div>
            <h1>PG Manager</h1>
            <p className="muted">Rooms, beds, tenants and rent in one place.</p>
          </div>
        </div>

        {mode !== 'forgot' && (
          <div className="segmented" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>
              Create account
            </button>
          </div>
        )}

        {mode === 'register' && (
          <>
            <Field label="Owner name" name="name" value={form.name} onChange={update('name')} autoComplete="name" required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
            <Field
              label="Mobile number"
              name="phone"
              value={form.phone}
              onChange={update('phone')}
              autoComplete="tel"
              inputMode="tel"
              placeholder="9876543210"
              required
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              hint="8+ characters with an uppercase letter, a number and a symbol."
              required
            />
            <Field
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              autoComplete="new-password"
              required
            />
          </>
        )}

        {mode === 'login' && (
          <>
            <div className="segmented subtle" role="tablist">
              <button type="button" role="tab" aria-selected={method === 'password'} className={method === 'password' ? 'active' : ''} onClick={() => { setMethod('password'); setError(''); }}>
                Password
              </button>
              <button type="button" role="tab" aria-selected={method === 'otp'} className={method === 'otp' ? 'active' : ''} onClick={() => { setMethod('otp'); setError(''); }}>
                Email OTP
              </button>
            </div>

            {method === 'password' ? (
              <>
                <Field
                  label="Email or mobile number"
                  name="identifier"
                  value={form.identifier}
                  onChange={update('identifier')}
                  autoComplete="username"
                  required
                />
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={update('password')}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="text-link" onClick={() => switchMode('forgot')}>
                  Forgot password?
                </button>
              </>
            ) : (
              <>
                <Field label="Email" name="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
                <Button type="button" variant="secondary" loading={sendingCode} disabled={cooldown > 0} onClick={() => requestCode('login')}>
                  {codeLabel}
                </Button>
                <Field
                  label="6-digit code"
                  name="otp"
                  value={form.otp}
                  onChange={update('otp')}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="123456"
                  required
                />
              </>
            )}
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2 className="auth-subtitle">Reset your password</h2>
            <Field label="Email" name="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
            <Button type="button" variant="secondary" loading={sendingCode} disabled={cooldown > 0} onClick={() => requestCode('reset')}>
              {codeLabel}
            </Button>
            <Field label="6-digit code" name="otp" value={form.otp} onChange={update('otp')} inputMode="numeric" maxLength={6} autoComplete="one-time-code" required />
            <Field
              label="New password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={update('newPassword')}
              autoComplete="new-password"
              hint="8+ characters with an uppercase letter, a number and a symbol."
              required
            />
            <Field
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              autoComplete="new-password"
              required
            />
          </>
        )}

        <Banner tone="success" onDismiss={() => setNotice('')}>
          {notice}
        </Banner>
        <Banner tone="error" onDismiss={() => setError('')}>
          {error}
        </Banner>

        <Button type="submit" loading={busy}>
          {submitLabel}
        </Button>

        {mode === 'forgot' && (
          <button type="button" className="text-link center" onClick={() => switchMode('login')}>
            Back to sign in
          </button>
        )}
      </form>
    </main>
  );
}

import React from 'react';
import { AlertTriangle, Building2 } from 'lucide-react';
import { Button } from '../components/ui';

export default function BillingStatusErrorScreen({ message, busy, onRetry, onSignOut, onDelete }) {
  return <main className="auth-shell"><section className="auth-card">
    <div className="auth-brand"><span className="brand-mark"><Building2 size={20}/></span><div><strong>PG Manager</strong><p>Subscription verification</p></div></div>
    <div className="empty-state"><AlertTriangle size={26}/><p className="empty-title">Could not verify your subscription</p><p className="muted">{message || 'The server could not confirm your entitlement. Access remains locked until verification succeeds.'}</p></div>
    <Button onClick={onRetry} loading={busy}>Try again</Button>
    <Button variant="danger" onClick={onDelete}>Delete account</Button>
    <Button variant="ghost" onClick={onSignOut}>Sign out</Button>
  </section></main>;
}

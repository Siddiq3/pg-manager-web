import React from 'react';
import { AlertCircle, CheckCircle2, Inbox } from 'lucide-react';

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || action) && (
        <header className="card-head">
          {title && <h3>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({ icon, label, value, hint, tone = 'default' }) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

const BADGE_TONES = { PAID: 'ok', PARTIAL: 'warn', PENDING: 'danger', ACTIVE: 'ok', VACATED: 'muted', VACANT: 'ok', OCCUPIED: 'muted' };

export function Badge({ children, tone }) {
  return <span className={`badge badge-${tone || BADGE_TONES[children] || 'muted'}`}>{children}</span>;
}

export function EmptyState({ title, hint, icon = <Inbox size={22} /> }) {
  return (
    <div className="empty-state">
      {icon}
      <p className="empty-title">{title}</p>
      {hint && <p className="muted">{hint}</p>}
    </div>
  );
}

/** Grey placeholder rows, so a slow network shows structure instead of a blank panel. */
export function Skeleton({ rows = 3 }) {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <span className="skeleton-row" key={index} />
      ))}
    </div>
  );
}

export function Banner({ tone = 'error', children, onDismiss }) {
  if (!children) return null;
  return (
    <p className={`banner banner-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {tone === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span>{children}</span>
      {onDismiss && (
        <button type="button" className="banner-close" onClick={onDismiss} aria-label="Dismiss">
          &times;
        </button>
      )}
    </p>
  );
}

/**
 * A labelled input. Placeholders alone leave screen readers (and anyone who
 * has started typing) without a label, so every field gets a real one.
 */
export function Field({ label, hint, error, ...inputProps }) {
  const id = inputProps.id || `field-${inputProps.name || label}`.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error ? 'true' : undefined} {...inputProps} />
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function Button({ children, variant = 'primary', loading = false, disabled, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Table({ columns, rows, renderRow, empty, className = '' }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="table-wrap">
      <table className={`table ${className}`.trim()}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={[column.className, column.align === 'right' && 'right'].filter(Boolean).join(' ') || undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

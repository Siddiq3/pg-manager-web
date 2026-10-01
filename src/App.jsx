import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BedDouble,
  Building2,
  CircleDollarSign,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { authPost, createApiClient } from './lib/api';
import Dashboard from './screens/Dashboard';
import LoginScreen from './screens/LoginScreen';
import BillingScreen from './screens/BillingScreen';

const navItems = [
  { label: 'Product', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const featureCards = [
  {
    icon: BedDouble,
    title: 'Rooms and beds',
    text: 'See occupied and vacant beds by room.',
  },
  {
    icon: Users,
    title: 'Tenant records',
    text: 'Keep rent, contact details and key dates together.',
  },
  {
    icon: CircleDollarSign,
    title: 'Rent payments',
    text: 'Check monthly dues and record payments.',
  },
];

const steps = [
  { number: '01', title: 'Add a property', body: 'Create a record for your PG or hostel.' },
  { number: '02', title: 'Set up rooms and tenants', body: 'Add beds, assign tenants and save their rent details.' },
  { number: '03', title: 'Track rent', body: 'Review each rent cycle and record payments.' },
];

const faqs = [
  { question: 'Can I manage more than one PG or property?', answer: 'Yes. The app supports multiple properties, so you can switch between them from the same dashboard.' },
  { question: 'Can I see which beds are vacant?', answer: 'Yes. The dashboard shows occupied and vacant beds for your property.' },
  { question: 'What can I save in a tenant record?', answer: 'Tenant records can include contact details, room and bed, rent amount, joined date and expected vacate date.' },
  { question: 'Can I monitor rent due and pending payments?', answer: 'Yes. The rent-cycle view shows each month, the amount due, what is paid and what is still pending.' },
];

function MarketingPage({ onOpenApp }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="container nav-wrap">
          <a href="#top" className="brand" aria-label="PG Manager home">
            <span className="brand-mark brand-mark--nav">
              <Building2 size={18} />
            </span>
            <span className="brand-name">PG Manager</span>
          </a>

          <nav className="marketing-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button type="button" className="btn btn-ghost btn-nav" onClick={onOpenApp}>
              Sign in
            </button>
            <button type="button" className="btn btn-primary" onClick={onOpenApp}>
              Open the app
            </button>
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <button type="button" className="btn btn-primary w-full" onClick={onOpenApp}>
              Open the app
            </button>
          </div>
        )}
      </header>

      <main id="top" className="marketing-page">
        <section className="section hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow-wrap">
                <span className="eyebrow">For PG and hostel owners</span>
              </div>
              <h1>Keep your PG organized.</h1>
              <p className="hero-text">
                See vacant beds, tenant details and pending rent from one dashboard.
              </p>

              <div className="cta-row">
                <button type="button" className="btn btn-primary btn-xl" onClick={onOpenApp}>
                  Open PG Manager
                  <ArrowRight size={18} />
                </button>
                <a href="#how-it-works" className="btn btn-secondary btn-xl btn-link">
                  How it works
                </a>
              </div>
            </div>

            <div className="hero-visual" aria-label="Illustrative PG Manager dashboard with sample data">
              <div className="dashboard-window">
                <div className="window-topbar">
                  <span className="preview-brand"><Building2 size={16} /> PG Manager</span>
                  <span className="sample-label">Sample data</span>
                </div>

                <div className="window-body">
                  <div className="mini-main">
                    <div className="mini-header">
                      <div>
                        <p className="kicker">Property</p>
                        <h3>Example property</h3>
                      </div>
                      <span className="status-chip">Overview</span>
                    </div>

                    <div className="mini-stats">
                      <div className="mini-stat">
                        <span>Beds occupied</span>
                        <strong>18/24</strong>
                      </div>
                      <div className="mini-stat">
                        <span>Vacant beds</span>
                        <strong>6</strong>
                      </div>
                      <div className="mini-stat">
                        <span>Vacating soon</span>
                        <strong>2</strong>
                      </div>
                      <div className="mini-stat accent">
                        <span>Rent pending</span>
                        <strong>₹17,000</strong>
                      </div>
                    </div>

                    <div className="mini-sections">
                      <div className="mini-panel mini-panel--rent">
                        <div className="panel-head">
                          <span>Rent</span>
                          <span>This month</span>
                        </div>
                        <div className="preview-table-head"><span>Tenant</span><span>Status</span><span>Collected</span></div>
                        <div className="preview-table-row"><span>Tenant record</span><span className="table-status paid">Paid</span><span>₹8,500</span></div>
                        <div className="preview-table-row"><span>Tenant record</span><span className="table-status pending">Pending</span><span>₹0</span></div>
                      </div>

                      <div className="mini-panel mini-panel--rooms">
                        <div className="panel-head">
                          <span>Room occupancy</span>
                          <span>By bed</span>
                        </div>
                        <div className="preview-room"><span>Room 101</span><strong>Bed A · Occupied</strong></div>
                        <div className="preview-room"><span>Room 102</span><strong>Bed B · Available</strong></div>
                        <div className="preview-room"><span>Room 103</span><strong>Bed A · Occupied</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">The day-to-day</p>
              <h2>Know what is occupied, who is staying and what is due.</h2>
            </div>

            <div className="feature-list">
              {featureCards.map(({ icon: Icon, title, text }) => (
                <article key={title} className="feature-row">
                  <span className="feature-row__icon"><Icon size={20} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section alt-section">
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">How it works</p>
              <h2>Start with your property, then keep track.</h2>
            </div>

            <div className="steps-grid">
              {steps.map((step) => (
                <article key={step.number} className="step-card">
                  <span className="step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section faq-section">
          <div className="container faq-layout">
            <div className="faq-heading">
              <p className="eyebrow">Questions owners ask</p>
              <h2>A few common questions.</h2>
            </div>

            <div className="faq-list">
              {faqs.map((item) => (
                <details key={item.question} className="faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section cta-section">
          <div className="container cta-panel">
            <div>
              <p className="eyebrow">PG Manager</p>
              <h2>Keep your rooms, tenants and rent in one place.</h2>
            </div>
            <button type="button" className="btn btn-primary btn-xl" onClick={onOpenApp}>
              Open the app
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="container footer-wrap">
          <div className="footer-brand">
            <span className="brand-mark brand-mark--nav">
              <Building2 size={18} />
            </span>
            <div>
              <strong>PG Manager</strong>
              <span>Property operations, simplified.</span>
            </div>
          </div>

          <div className="footer-links">
            <div>
              <span>Explore</span>
              <a href="#features">What it tracks</a>
              <a href="#how-it-works">How it works</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <span>Account</span>
              <button type="button" className="text-button" onClick={onOpenApp}>Open app</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AppExperience() {
  // The access token lives in a ref so the API client stays stable: rebuilding
  // it on every refresh would remount the dashboard and refetch everything.
  const accessToken = useRef('');
  const [user, setUser] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [entitlement, setEntitlement] = useState(null);

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

  useEffect(() => { if (!signedIn) { setEntitlement(null); return; } client.get('/billing/status').then(r => setEntitlement(r.data.entitlement)).catch(() => setEntitlement(null)); }, [signedIn, client]);

  if (!signedIn) return <LoginScreen onSignedIn={applySession} />;
  if (!entitlement) return <main className="auth-shell"><span className="spinner spinner-lg" aria-label="Loading subscription" /></main>;
  if (!entitlement.hasAccess) return <BillingScreen client={client} entitlement={entitlement} onActive={setEntitlement} onSignOut={signOut} />;

  return <Dashboard client={client} user={user} onSignOut={signOut} />;
}

export default function App() {
  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'marketing';
    return window.location.hash === '#app' ? 'app' : 'marketing';
  });

  useEffect(() => {
    if (view === 'app') {
      window.location.hash = '#app';
      return;
    }

    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [view]);

  if (view === 'app') return <AppExperience />;
  return <MarketingPage onOpenApp={() => setView('app')} />;
}

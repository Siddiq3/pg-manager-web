import React, { useEffect, useRef, useState } from 'react';
import {
  Building2, Check, ChevronDown, LockKeyhole, Menu, MessageCircle, Smartphone, Users, Wallet, X,
} from 'lucide-react';
import PropertyHero from '../components/PropertyHero';
import DemoStory from '../components/DemoStory';
import { demoGroups } from '../data/demoSteps';
import { PLANS, planFeatures } from '../data/plans';
import '../marketing.css';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts up once when `run` turns true (on mount by default), unless the visitor asked for reduced motion. */
function useCountUp(target, duration = 1100, delay = 350, run = true) {
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0));
  useEffect(() => {
    if (reducedMotion() || !run) return undefined;
    let frame;
    const start = performance.now() + delay;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay, run]);
  return value;
}

/** True once the element has scrolled at least `threshold` into view; never turns back off. */
function useInView(threshold = 0.4) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => reducedMotion());
  useEffect(() => {
    if (seen || !ref.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

const TRIAL_DAYS = 30;

/** The pricing card: "0 → 30" counts up and a day-strip fills as it scrolls into view. */
function TrialCard() {
  const [ref, inView] = useInView();
  const days = useCountUp(TRIAL_DAYS, 1400, 150, inView);
  return (
    <div ref={ref} className={`lp-pricing-big${inView ? ' is-visible' : ''}`} role="img" aria-label={`${TRIAL_DAYS} days free, with Starter limits`}>
      <span className="lp-ten-row" aria-hidden="true">
        <span className="lp-ten">{days}</span>
        <span className="lp-ten-unit">days</span>
      </span>
      <span className="lp-days" aria-hidden="true">
        {Array.from({ length: TRIAL_DAYS }, (_, i) => <i key={i} className={i < days ? 'on' : undefined} />)}
      </span>
      <span className="lp-ten-label" aria-hidden="true">free, with Starter limits</span>
    </div>
  );
}

/* ───────────── Page ───────────── */

const EXTRAS = [
  { icon: Building2, title: 'More than one building', body: 'Run up to 3 properties on Pro, or 10 on Growth, and switch between them in the app.' },
  { icon: Users, title: 'Bring in a co-owner', body: 'Give a partner or manager their own sign-in for your property. Included with Pro and Growth.' },
  { icon: Wallet, title: 'Deposits on record', body: 'Note who has paid a deposit and whose deposit you have refunded.' },
  { icon: Smartphone, title: 'Runs on your phone', body: 'Manage rooms, tenants and rent in the Android app. Use this website for your account and subscription. Web property management is planned.' },
  { icon: LockKeyhole, title: 'Secure sign-in', body: 'Sign in with your password. Forgot it? Reset it with a code sent to your email.' },
  { icon: MessageCircle, title: 'Reach tenants fast', body: 'Call or open WhatsApp with a tenant from their rent entry.' },
];

const FAQS = [
  ['Do I need a card to start the free trial?', 'No. The 30-day trial starts when you create your account and has Starter limits: 1 property, up to 150 beds, no co-owners. Subscribe on this website for more, or when the trial ends.'],
  ['How do I pay for a subscription?', 'Checkout runs through Cashfree with UPI or card. PG Manager never sees or stores your card details, UPI PIN or bank login.'],
  ['Can I manage more than one PG?', 'Yes. Add each property separately and switch between them. Each one has its own rooms, tenants and rent.'],
  ['What happens to my data if I leave?', 'You can delete your account from the app or this website at any time. It removes your properties, rooms, tenants and rent records.'],
  ['Does my co-owner need their own account?', 'Yes. In the app, open property settings and create a sign-in for them with their email and a password you share. If that email already has an account, they are invited instead.'],
];

export default function Marketing({ onStart, onSignIn, onDeleteAccount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = [['How it works', '#how-it-works'], ['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']];

  return (
    <div className="lp">
      <a className="lp-skip" href="#main">Skip to content</a>
      <header className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="lp-container lp-nav-row">
          <a href="#top" className="lp-brand" aria-label="PG Manager home"><span className="lp-mark">PG</span>PG Manager</a>
          <nav className="lp-links" aria-label="Main">
            {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="lp-nav-actions">
            <button type="button" className="lp-btn lp-btn--text" onClick={onSignIn}>Sign in</button>
            <button type="button" className="lp-btn lp-btn--primary" onClick={onStart}>Start free</button>
            <button type="button" className="lp-menu-btn" aria-expanded={menuOpen} aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            {nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
            <button type="button" className="lp-btn lp-btn--ghost" onClick={onSignIn}>Sign in</button>
          </div>
        )}
      </header>

      <main id="main">
        <PropertyHero onStart={onStart} />

        <section className="lp-tour" id="how-it-works" aria-labelledby="tour-title">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">A day at your PG</span>
              <h2 id="tour-title" className="lp-h2">Less notebook. More peace of mind.</h2>
              <p className="lp-lede">Real screens from PG Manager, recorded with demo data. Explore each feature card. Choose from three clips in every card.</p>
            </div>
            <div className="lp-tour-groups">{demoGroups.map((group, i) => (
              <div className="lp-tour-group" key={group.key} style={{ '--tour-color': group.color }}>
                <header className="lp-tour-group-head"><span className="lp-eyebrow">0{i + 1} · 3 real app clips</span><h3>{group.title}</h3><p>{group.body}</p></header>
                <DemoStory steps={group.steps} label={group.title} />
              </div>
            ))}</div>
          </div>
        </section>

        <section className="lp-section" id="features" aria-labelledby="extras-title">
          <div className="lp-container lp-extras">
            <div className="lp-extras-head">
              <h2 id="extras-title" className="lp-h2">The rest of the work, handled too.</h2>
              <p className="lp-lede">Small things that save a trip to the notebook.</p>
            </div>
            <ul className="lp-extras-list">
              {EXTRAS.map(({ icon: Icon, title, body }) => (
                <li key={title}>
                  <span className="lp-extra-icon"><Icon size={20} /></span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-section lp-setup" aria-labelledby="setup-title">
          <div className="lp-container">
            <h2 id="setup-title" className="lp-h2">Set up in an afternoon.</h2>
            <ol className="lp-setup-steps">
              <li><span>1</span><h3>Add your property</h3><p>Its name, address and city.</p></li>
              <li><span>2</span><h3>Add rooms and beds</h3><p>Room numbers, sharing type, rent and a label for each bed.</p></li>
              <li><span>3</span><h3>Add your tenants</h3><p>Put each one in their bed. Monthly rent tracking starts from their joining date.</p></li>
            </ol>
          </div>
        </section>

        <section className="lp-section" id="pricing" aria-labelledby="pricing-title">
          <div className="lp-container lp-pricing">
            <TrialCard />
            <div className="lp-pricing-copy">
              <h2 id="pricing-title" className="lp-h2">Try it on your real PG first.</h2>
              <p>Create your account and run one property with up to 150 beds for 30 days. When you need more, or when the trial ends, subscribe here on the website. Payment is by UPI or card through Cashfree.</p>
              <ul className="lp-checks">
                <li><Check size={18} />No card needed to start</li>
                <li><Check size={18} />Rooms, tenants and rent tracking all included</li>
                <li><Check size={18} />Delete your account and data any time</li>
              </ul>
              <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={onStart}>Create your account</button>
            </div>
          </div>
          <div className="lp-container">
            <ul className="lp-plans" aria-label="Plans">
              {PLANS.map((plan) => (
                <li key={plan.name} className={plan.featured ? 'is-featured' : undefined}>
                  <div className="lp-plan-head"><h3>{plan.name}</h3>{plan.featured && <span>For growing PGs</span>}</div>
                  <p className="lp-plan-price">₹{plan.price}<span>/month</span></p>
                  <ul className="lp-plan-features" aria-label={`${plan.name} plan features`}>{planFeatures(plan).map(({ label, value, included }) => <li key={label} className={included ? 'is-included' : 'is-excluded'}>
                    {included ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                    <span className="lp-feature-label">{label}</span><span className="lp-feature-value">{value}</span>
                  </li>)}</ul>
                  <button type="button" className={`lp-btn ${plan.featured ? 'lp-btn--primary' : 'lp-btn--ghost'}`} onClick={onStart}>Start with {plan.name}</button>
                </li>
              ))}
            </ul>
            <p className="lp-plan-note">Limits apply across your subscription. Co-owners are additional to the primary owner. All new accounts start with a 30-day Starter trial; choose a paid plan in billing.</p>
          </div>
        </section>

        <section className="lp-section" id="faq" aria-labelledby="faq-title">
          <div className="lp-container lp-faq">
            <h2 id="faq-title" className="lp-h2">Questions owners ask.</h2>
            <div className="lp-faq-list">
              {FAQS.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}<ChevronDown size={20} /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-container lp-final-row">
            <h2 className="lp-h2">Put the register away this month.</h2>
            <button type="button" className="lp-btn lp-btn--light lp-btn--lg" onClick={onStart}>Start free</button>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-row">
          <div>
            <a href="#top" className="lp-brand"><span className="lp-mark">PG</span>PG Manager</a>
            <p>Rooms, tenants and rent for PG and hostel owners.</p>
          </div>
          <nav aria-label="Footer">
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <button type="button" onClick={onSignIn}>Sign in</button>
            <button type="button" onClick={onDeleteAccount}>Delete account</button>
          </nav>
        </div>
      </footer>
    </div>
  );
}

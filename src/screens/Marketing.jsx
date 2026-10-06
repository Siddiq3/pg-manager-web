import React, { useEffect, useRef, useState } from 'react';
import {
  Building2, Check, ChevronDown, LockKeyhole, Menu, MessageCircle, Phone, Smartphone, Users, Wallet, X,
} from 'lucide-react';
import { BedBoard, countBeds } from '../components/BedBoard';
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

/* ───────────── The month story ───────────── */

const CHAPTERS = [
  {
    date: '1st',
    title: 'A new tenant moves in',
    body: 'Pick a vacant bed, add their name, phone, rent and deposit. The bed fills on your board and their first rent cycle starts by itself.',
  },
  {
    date: '5th',
    title: 'Rent day, without the chasing',
    body: 'See who has paid and who hasn’t. Call or WhatsApp a tenant straight from the list, then record UPI, cash or bank transfer when the money arrives.',
  },
  {
    date: '18th',
    title: 'Someone gives notice',
    body: 'Save the notice date and the day they plan to leave. The bed is flagged, and your dashboard counts everyone vacating in the next 30 days.',
  },
  {
    date: '30th',
    title: 'The bed is ready again',
    body: 'Check the tenant out and the bed goes back to vacant, ready for whoever calls next. Their history and deposit record stay on file.',
  },
];

const STORY_STATE = [
  { overrides: { '102-B': { initials: 'AK' } }, highlight: '102-B' },
  { overrides: { '102-B': { initials: 'AK' } } },
  { overrides: { '102-B': { initials: 'AK' }, '201-A': { state: 'notice' } }, highlight: '201-A' },
  { overrides: { '102-B': { initials: 'AK' }, '201-A': { initials: null } }, highlight: '201-A' },
];

function StoryCard({ chapter }) {
  if (chapter === 0) {
    return (
      <div className="story-card" key="c0">
        <div className="sc-head"><span className="sc-avatar">AK</span><div><strong>Arjun Kumar</strong><span>Room 102, bed B</span></div></div>
        <dl className="sc-facts">
          <div><dt>Monthly rent</dt><dd>₹7,500</dd></div>
          <div><dt>Deposit</dt><dd>₹15,000 <em className="sc-ok">Paid</em></dd></div>
          <div><dt>Joined</dt><dd>1 October</dd></div>
        </dl>
      </div>
    );
  }
  if (chapter === 1) {
    const rows = [['Rahul K.', '₹8,000', true], ['Sneha M.', '₹7,500', true], ['Arjun K.', '₹7,500', false], ['Tara S.', '₹8,500', false]];
    return (
      <div className="story-card" key="c1">
        <div className="sc-ledger-top"><strong>October rent</strong><span>₹15,500 of ₹31,500</span></div>
        <div className="sc-progress"><span style={{ width: '49%' }} /></div>
        <ul className="sc-ledger">
          {rows.map(([name, amount, paid]) => (
            <li key={name}>
              <span className="sc-name">{name}</span>
              <span className="sc-amt">{amount}</span>
              {paid ? <em className="sc-ok">Paid</em> : (
                <span className="sc-actions"><Phone size={14} aria-label="Call" /><MessageCircle size={14} aria-label="WhatsApp" /><em className="sc-due">Due</em></span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (chapter === 2) {
    return (
      <div className="story-card" key="c2">
        <div className="sc-head"><span className="sc-avatar sc-avatar--notice">NS</span><div><strong>Neha Sharma</strong><span>Room 201, bed A</span></div></div>
        <dl className="sc-facts">
          <div><dt>Notice given</dt><dd>18 October</dd></div>
          <div><dt>Moving out</dt><dd>30 October</dd></div>
          <div><dt>Vacating in 30 days</dt><dd>1 tenant</dd></div>
        </dl>
      </div>
    );
  }
  return (
    <div className="story-card" key="c3">
      <div className="sc-head"><span className="sc-avatar sc-avatar--vacant"><Check size={18} /></span><div><strong>Bed 201-A is free</strong><span>Listed under vacant beds</span></div></div>
      <p className="sc-note">Neha was checked out on the 30th. Her deposit refund is marked, and the bed is back on your dashboard for the next enquiry.</p>
    </div>
  );
}

function StoryVisual({ chapter }) {
  const s = STORY_STATE[chapter];
  return (
    <div className="story-visual">
      <BedBoard compact overrides={s.overrides} highlight={s.highlight} />
      <div className="story-card-slot"><StoryCard chapter={chapter} /></div>
    </div>
  );
}

function MonthStory() {
  const [chapter, setChapter] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setChapter(Number(e.target.dataset.index))),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="lp-story" id="how-it-works" aria-labelledby="story-title">
      <div className="lp-container">
        <h2 id="story-title" className="lp-h2 lp-story-title">One month at a 21-bed PG.</h2>
        <p className="lp-lede">What PG Manager does on the days that usually mean a phone call, a notebook and a reminder.</p>
        <div className="story-grid">
          <ol className="story-steps">
            {CHAPTERS.map((c, i) => (
              <li key={c.date} data-index={i} ref={(el) => { refs.current[i] = el; }} className={`story-step${chapter === i ? ' is-active' : ''}`}>
                <span className="story-date">{c.date}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <div className="story-inline"><StoryVisual chapter={i} /></div>
              </li>
            ))}
          </ol>
          <div className="story-sticky" aria-hidden="true">
            <div className="story-calendar">
              {CHAPTERS.map((c, i) => <span key={c.date} className={chapter === i ? 'on' : ''}>{c.date}</span>)}
            </div>
            <StoryVisual chapter={chapter} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Page ───────────── */

const EXTRAS = [
  { icon: Building2, title: 'More than one building', body: 'Run up to 3 properties on Pro, or 10 on Growth, and switch between them in the app.' },
  { icon: Users, title: 'Bring in a co-owner', body: 'Give a partner or manager their own sign-in for your property. Included with Pro and Growth.' },
  { icon: Wallet, title: 'Deposits on record', body: 'Note who has paid a deposit and whose deposit you have refunded.' },
  { icon: Smartphone, title: 'Runs on your phone', body: 'Manage rooms, tenants and rent in the Android app. Use this website for your account and subscription.' },
  { icon: LockKeyhole, title: 'Secure sign-in', body: 'Sign in with your password. Forgot it? Reset it with a code sent to your email.' },
  { icon: MessageCircle, title: 'Reach tenants fast', body: 'Call or open WhatsApp with a tenant from their rent entry.' },
];

const PLANS = [
  { name: 'Starter', price: 299, lines: ['1 property', '150 beds', 'No co-owners', 'Standard support'] },
  { name: 'Pro', price: 699, featured: true, lines: ['Up to 3 properties', '450 beds', 'Up to 2 co-owners', 'Standard support'] },
  { name: 'Growth', price: 999, lines: ['Up to 10 properties', '1,000 beds', 'Up to 4 co-owners', 'Priority support'] },
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
  const { total, filled } = countBeds();
  const shown = useCountUp(filled);

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
        <section className="lp-hero" id="top">
          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy">
              <h1 className="lp-h1">Run your PG without the register.</h1>
              <p className="lp-hero-sub">See which beds are free, who is moving out and whose rent is still due. One place for your rooms, tenants and rent, in the app on your phone.</p>
              <div className="lp-hero-ctas">
                <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={onStart}>Start your 30-day free trial</button>
                <a href="#how-it-works" className="lp-btn lp-btn--ghost lp-btn--lg">See how it works</a>
              </div>
              <p className="lp-hero-note">No card needed to start. Made for PG and hostel owners in India.</p>
            </div>
            <figure className="lp-hero-board">
              <div className="lp-board-frame">
                <div className="lp-board-top">
                  <div>
                    <strong>Sai Residency</strong>
                    <span className="lp-board-sub">Example property</span>
                  </div>
                  <div className="lp-board-count" aria-live="off">
                    <span className="lp-count-num">{shown}</span><span className="lp-count-of">/{total} beds filled</span>
                  </div>
                </div>
                <BedBoard animate />
                <div className="lp-legend">
                  <span><i className="lg lg-occ" />Occupied</span>
                  <span><i className="lg lg-vac" />Vacant</span>
                  <span><i className="lg lg-not" />On notice</span>
                </div>
              </div>
            </figure>
          </div>
        </section>

        <MonthStory />

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
                  <h3>{plan.name}</h3>
                  <p className="lp-plan-price">₹{plan.price}<span>/month</span></p>
                  <ul>{plan.lines.map((line) => <li key={line}><Check size={16} />{line}</li>)}</ul>
                </li>
              ))}
            </ul>
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

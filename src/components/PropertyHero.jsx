import React, { useState } from 'react';
import { BedDouble, Users, Wallet, ClipboardList, Check } from 'lucide-react';

const TYPES = [
  { label: 'Co-Living', heading: 'Co-Living', kind: 'shared' },
  { label: 'Hostel/PG', heading: 'Hostels & PGs', kind: 'hostel' },
  { label: 'Flat', heading: 'Flats', kind: 'flat' },
  { label: 'Studio', heading: 'Studios', kind: 'studio' },
];
const FEATURES = [
  { icon: BedDouble, title: 'Rooms & beds', body: 'Know what is available' },
  { icon: Users, title: 'Tenant records', body: 'Keep details in one place' },
  { icon: Wallet, title: 'Rent & deposits', body: 'See paid and pending amounts' },
  { icon: ClipboardList, title: 'Staff & expenses', body: 'Track your daily costs' },
];

// Original local illustrations. Property selection changes the introduction only.
function PropertyIllustration({ kind }) {
  const tall = kind === 'hostel';
  const shared = kind === 'shared';
  const studio = kind === 'studio';
  return <svg viewBox="0 0 120 80" fill="none" aria-hidden="true">
    <ellipse cx="60" cy="73" rx="47" ry="4" fill="#ddd8ef" />
    {shared && <><path d="M14 36 34 20 54 36v35H14Z" fill="#bcdad1" /><path d="m10 36 24-20 24 20" stroke="#568a7b" strokeWidth="4" strokeLinejoin="round" /><path d="M23 46h10v12H23m15-12h9v12h-9" fill="#fff" /></>}
    <path d={studio ? 'M28 38 60 17 92 38v34H28Z' : tall ? 'M38 10h48v62H38Z' : 'M42 23h50v49H42Z'} fill="#b9a8ed" />
    <path d={studio ? 'm23 38 37-25 37 25' : tall ? 'M34 10h56' : 'M38 23h58'} stroke="#7054de" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    {(studio ? [43] : tall ? [21,37] : [34,49]).map(y => <g key={y}><rect x={studio ? 39 : 49} y={y} width="10" height="10" rx="1" fill="#fff" /><rect x={studio ? 71 : 68} y={y} width="10" height="10" rx="1" fill="#fff" /></g>)}
    <path d={studio ? 'M55 53h12v19H55Z' : 'M58 58h12v14H58Z'} fill="#7054de" />
    <path d="M101 72V53" stroke="#7b9b72" strokeWidth="3" /><circle cx="101" cy="49" r="10" fill="#afcaa4" />
    {kind === 'flat' && <path d="M40 47h54M40 62h54" stroke="#8c75ce" strokeWidth="2" />}
  </svg>;
}

export default function PropertyHero({ onStart }) {
  const [selected, setSelected] = useState('Hostel/PG');
  const type = TYPES.find(t => t.label === selected);
  return <section className="ph-hero" id="top" aria-labelledby="hero-title">
    <div className="lp-container ph-grid">
      <div className="ph-copy">
        <div className="ph-heading">
        <span className="lp-eyebrow">Made for Indian property owners</span>
        <h1 id="hero-title">The easier way to manage your <span>{type.heading}.</span></h1>
        <p className="ph-intro">One app for your rooms, tenants and rent.</p>
        <p className="ph-benefit">Less paperwork. More time for your property.</p>
        </div>
        <div className="ph-selection">
        <fieldset className="ph-types">
          <legend>I manage a</legend>
          <div className="ph-type-grid">{TYPES.map(t => <label key={t.label} className={`ph-type${selected === t.label ? ' is-selected' : ''}`}>
            <input type="radio" name="property-type" value={t.label} checked={selected === t.label} onChange={() => setSelected(t.label)} />
            <PropertyIllustration kind={t.kind} />
            <span>{t.label}</span>
            {selected === t.label && <Check className="ph-type-check" size={14} aria-hidden="true" />}
          </label>)}</div>
        </fieldset>
        <div className="ph-actions">
          <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={onStart}>Start your 30-day free trial</button>
          <a className="lp-btn lp-btn--ghost lp-btn--lg" href="#how-it-works">Watch app demos</a>
        </div>
        <p className="ph-note">No card needed. Manage your property in the Android app.</p>
        </div>
      </div>
      <figure className="ph-visual">
        <div className="ph-orbit" aria-hidden="true" />
        <div className="ph-app-label"><span className="lp-mark">PG</span><span>PG Manager<strong>Your property, at a glance</strong></span></div>
        <div className="ph-phone"><img src="/media/dashboard.webp" width="720" height="1600" fetchpriority="high" alt="PG Manager home screen for Sai Residency PG, showing room occupancy and pending rent using fictional demo data" /></div>
        <div className="ph-highlights"><div className="ph-float ph-float--beds"><BedDouble size={20} aria-hidden="true" /><span>Rooms & beds<strong>See your occupancy</strong></span></div>
        <div className="ph-float ph-float--rent"><Wallet size={20} aria-hidden="true" /><span>Rent records<strong>Paid and pending</strong></span></div>
        </div>
        <figcaption>Sai Residency PG · Real app screen<br />Fictional demo data</figcaption>
      </figure>
    </div>
    <div className="ph-feature-strip"><ul className="lp-container">{FEATURES.map(({ icon: Icon, title, body }) => <li key={title}><Icon size={25} aria-hidden="true" /><div><strong>{title}</strong><span>{body}</span></div></li>)}</ul></div>
  </section>;
}

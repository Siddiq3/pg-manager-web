import React from 'react';
import { BedDouble, Users, Wallet, ClipboardList } from 'lucide-react';

const FEATURES = [
  { icon: BedDouble, title: 'Rooms & beds', body: 'Know what is available' },
  { icon: Users, title: 'Tenant records', body: 'Keep details in one place' },
  { icon: Wallet, title: 'Rent & deposits', body: 'See paid and pending amounts' },
  { icon: ClipboardList, title: 'Staff & expenses', body: 'Track your daily costs' },
];
const HERO_PROPERTY_NAMES = ['PGs', 'Hostels', 'Co-Living', 'Rental Spaces'];

function BuildingBackdrop() {
  const buildings = [
    { x: 20, width: 110, height: 100 }, { x: 150, width: 100, height: 180 },
    { x: 280, width: 130, height: 125 }, { x: 460, width: 90, height: 230 },
    { x: 590, width: 140, height: 160 }, { x: 780, width: 110, height: 290 },
    { x: 930, width: 140, height: 210 }, { x: 1110, width: 110, height: 340 },
    { x: 1270, width: 150, height: 170 },
  ];
  return <svg className="ph-skyline" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    {buildings.map(({ x, width, height }) => <g key={x}>
      <rect x={x} y={400 - height} width={width} height={height} rx="6" fill="#b9a8ed" />
      <path d={`M${x + 12} ${400 - height}v-12h${width - 24}v12`} fill="#d3c7f2" />
      {Array.from({ length: Math.floor((height - 30) / 32) }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => <rect key={`${row}-${col}`} x={x + 15 + col * (width - 30) / 3} y={420 - height + row * 32} width={(width - 45) / 3} height="15" rx="2" fill="#faf9ff" />))}
    </g>)}
    <path d="M0 399h1440" stroke="#a28cd8" strokeWidth="2" />
  </svg>;
}

export default function PropertyHero({ onStart }) {
  return <section className="ph-hero" id="top" aria-labelledby="hero-title">
    <div className="lp-container ph-grid">
      <BuildingBackdrop />
      <div className="ph-copy">
        <h1 id="hero-title" aria-label="The easier way to manage your PGs, Hostels, Co-Living and Rental Spaces.">The easier way to manage your{' '}
          <span className="ph-rotating-word" aria-hidden="true">{HERO_PROPERTY_NAMES.map((name, i) => (
            <span key={name} className="ph-rotating-item" style={{ '--word-delay': `${i === 0 ? 0 : (i - HERO_PROPERTY_NAMES.length) * 3}s` }}>{name}.</span>
          ))}</span>
        </h1>
        <p className="ph-intro">One app for your rooms, tenants and rent.</p>
        <div className="ph-actions">
          <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={onStart}>Start your 30-day free trial</button>
          <a className="lp-btn lp-btn--ghost lp-btn--lg" href="#how-it-works">Watch app demos</a>
        </div>
        <p className="ph-note">No card needed. Manage your property in the Android app.</p>
      </div>
      <figure className="ph-visual">
        <div className="ph-orbit" aria-hidden="true" />
        <div className="ph-phone"><img src="/media/dashboard.webp" width="720" height="1600" fetchpriority="high" alt="PG Manager home screen for Sai Residency PG, showing room occupancy and pending rent using fictional demo data" /></div>
        <figcaption>Real app screen, fictional demo data</figcaption>
      </figure>
    </div>
    <div className="ph-feature-strip"><ul className="lp-container">{FEATURES.map(({ icon: Icon, title, body }) => <li key={title}><Icon size={24} aria-hidden="true" /><div><strong>{title}</strong><span>{body}</span></div></li>)}</ul></div>
  </section>;
}

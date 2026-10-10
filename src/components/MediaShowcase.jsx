import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useMediaVisibility, useReducedMotion } from './mediaHooks';

function Preview({ step, paused }) {
  const { ref, visible, loaded } = useMediaVisibility();
  const video = useRef(null);
  const [fallback, setFallback] = useState(false);
  const shouldPlay = visible && !paused && !fallback;
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (shouldPlay) v.play().catch(() => setFallback(true));
    else v.pause();
  }, [shouldPlay, loaded]);
  // An explicit Play retries previews that the browser previously blocked.
  useEffect(() => { if (!paused) setFallback(false); }, [paused]);
  return <a ref={ref} className="ms-card" href="#how-it-works" aria-label={`Watch demo: ${step.label}`}>
    <span className="ms-label">{step.label}</span>
    <span className="ms-screen">
      {loaded && !fallback ? <video ref={video} src={step.video} poster={step.poster} muted loop playsInline preload="metadata" aria-label={step.alt}
        onLoadedData={e => { if (shouldPlay) e.currentTarget.play().catch(() => setFallback(true)); }} onError={() => setFallback(true)} />
        : <img src={step.poster} alt={step.alt} width="720" height="1600" decoding="async" loading="lazy" />}
    </span>
  </a>;
}
export default function MediaShowcase({ steps }) {
  const reduced = useReducedMotion();
  const [manualPause, setManualPause] = useState(null);
  const paused = manualPause ?? reduced;
  return <div className="ms" aria-label="PG Manager app previews">
    <div className="ms-track">{steps.map(step => <Preview key={step.key} step={step} paused={paused} />)}</div>
    <div className="ms-caption"><p>Sai Residency PG · Real app screens, fictional demo data.</p>
      <button type="button" className="ms-toggle" onClick={() => setManualPause(!paused)} aria-label={paused ? 'Play previews' : 'Pause previews'}>
        {paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Play previews' : 'Pause previews'}
      </button>
    </div><p className="ms-swipe">Swipe to explore. Tap a preview for the tour.</p>
  </div>;
}

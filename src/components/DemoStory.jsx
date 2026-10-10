import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useMediaVisibility, useReducedMotion } from './mediaHooks';

export default function DemoStory({ steps, label = "PG Manager app tour" }) {
  const contentId = useId();
  const reduced = useReducedMotion();
  const { ref, visible, loaded } = useMediaVisibility();
  const video = useRef(null);
  const [index, setIndex] = useState(0);
  const [manualPlay, setManualPlay] = useState(null);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const playing = manualPlay ?? !reduced;
  const shouldPlay = playing && visible && !failed && !blocked;
  const playIntent = useRef(false);
  playIntent.current = shouldPlay;
  const step = steps[index];
  const go = (next) => { setProgress(0); setFailed(false); setBlocked(false); setIndex((next + steps.length) % steps.length); };

  const attemptPlay = (v) => {
    if (!playIntent.current) return;
    v.play().catch(() => {
      if (video.current === v && playIntent.current) { setBlocked(true); setManualPlay(false); }
    });
  };
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (shouldPlay) attemptPlay(v);
    else v.pause();
  }, [shouldPlay, loaded, index]);

  const toggle = () => {
    setFailed(false); setBlocked(false); setManualPlay(!playing);
    // Call during the user gesture too, for browsers that require explicit playback.
    if (!playing && video.current) {
      video.current.play().catch(() => { setBlocked(true); setManualPlay(false); });
    }
  };
  return (
    <section ref={ref} className="ds-showcase" aria-label={label} aria-roledescription="carousel">
      <div className="ds-stage">
        <figure key={step.key} className="ds-phone ds-enter">
          <div className="ds-media">
            {loaded && !failed && <video key={step.key} ref={video} src={step.video} poster={step.poster}
              muted playsInline preload="metadata" aria-label={step.alt}
              onLoadedData={e => attemptPlay(e.currentTarget)}
              onTimeUpdate={e => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
              onEnded={() => { if (playIntent.current) go(index + 1); }}
              onError={() => { setFailed(true); setManualPlay(false); }} />}
            {(!loaded || failed || blocked) && <img src={step.poster} alt={step.alt} width="720" height="1600" loading="lazy" />}
          </div>
        </figure>
      </div>
      <div className="ds-panel">
        <div className="ds-choices" role="group" aria-label={`Choose a clip in ${label}`}>
          {steps.map((s, i) => <button key={s.key} type="button" className={`ds-choice${i === index ? ' is-active' : ''}`} onClick={() => go(i)} aria-pressed={i === index} aria-controls={contentId}>{s.label}</button>)}
        </div>
        <div key={step.key} className="ds-copy ds-enter" id={contentId} aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
          <span className="ds-badge">{step.label}</span>
          <span className="ds-number">0{index + 1} / 0{steps.length}</span>
          <h4>{step.title}</h4><p>{step.body}</p>
          {failed && <p className="ds-status" role="status">The video could not load. The image shows the app screen. Try Play again or choose another clip.</p>}
          {blocked && <p className="ds-status" role="status">Playback is paused by your browser. Press Play to try again.</p>}
        </div>
        <div className="ds-controls">
          <div className="ds-progress-group">
            <div className="ds-dots" role="group" aria-label="Choose a demo">
              {steps.map((s, i) => <button key={s.key} type="button" className={`ds-dot${i === index ? ' is-active' : ''}`}
                onClick={() => go(i)} aria-label={`Show ${s.label}`} aria-current={i === index ? 'step' : undefined} aria-controls={contentId}>
                <span className="ds-dot-track" aria-hidden="true"><span style={{ transform: `scaleX(${i === index ? progress : 0})` }} /></span>
              </button>)}
            </div>
            <button type="button" className="ds-icon" onClick={toggle} aria-label={playing ? 'Pause demo' : 'Play demo'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
          </div>
          <div className="ds-arrows">
            <button type="button" className="ds-icon" onClick={() => go(index - 1)} aria-label="Previous clip"><ChevronLeft size={20} /></button>
            <button type="button" className="ds-icon" onClick={() => go(index + 1)} aria-label="Next clip"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

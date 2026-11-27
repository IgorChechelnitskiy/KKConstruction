import { useEffect, useState, type AnimationEvent } from 'react';
import { BrandMark } from '../components/BrandMark';

const sessionKey = 'kk-brand-intro-seen';
const reducedMotion = '(prefers-reduced-motion: reduce)';
const preview = () => new URLSearchParams(window.location.search).get('intro') === '1';

function shouldPlay() {
  if (window.matchMedia(reducedMotion).matches || (window.location.hash && !preview())) return false;
  try {
    return preview() || sessionStorage.getItem(sessionKey) !== '1';
  } catch {
    return true;
  }
}

export function useBrandIntro() {
  const [phase, setPhase] = useState<'playing' | 'title' | 'idle'>(() => shouldPlay() ? 'playing' : 'idle');

  useEffect(() => {
    if (phase !== 'playing') return;
    try {
      sessionStorage.setItem(sessionKey, '1');
    } catch {
      // Storage may be unavailable in some browsing modes.
    }
    const media = window.matchMedia(reducedMotion);
    const cancel = () => setPhase('idle');
    const onPreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) cancel();
    };
    // Dismiss if CSS animations are unavailable or get interrupted.
    const timeout = window.setTimeout(cancel, 3000);
    media.addEventListener('change', onPreferenceChange);
    window.addEventListener('hashchange', cancel);
    return () => {
      window.clearTimeout(timeout);
      media.removeEventListener('change', onPreferenceChange);
      window.removeEventListener('hashchange', cancel);
    };
  }, [phase]);

  return {
    phase,
    finish: () => setPhase('title'),
    skip: () => setPhase('idle'),
  };
}

export function BrandIntro({ onFinish, onSkip }: { onFinish: () => void; onSkip: () => void }) {
  function finish(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.animationName !== 'intro-out') return;
    const skipButton = event.currentTarget.querySelector('button');
    if (document.activeElement === skipButton) document.getElementById('hero-title')?.focus();
    onFinish();
  }

  function skip() {
    document.getElementById('hero-title')?.focus();
    onSkip();
  }

  return (
    <div className="brand-intro" onAnimationEnd={finish} onKeyDown={event => {
      if (event.key === 'Escape') skip();
    }}>
      <button type="button" className="intro-skip" lang="de" onClick={skip}>Überspringen</button>
      <div className="intro-lockup" aria-hidden="true">
        <BrandMark />
        <span className="intro-name">KK CONSTRUCTION GbR</span>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../lib/useMediaQuery';

type Point = { x: number; y: number };
const SEGMENTS = 72;
const CENTER = { x: 80, y: 108 };

function seededJitter(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (value - Math.floor(value) - 0.5) * 1.4;
}

function earthFlame(seed: number): Point[] {
  return Array.from({ length: SEGMENTS }, (_, index) => {
    const angle = -Math.PI / 2 + (index / SEGMENTS) * Math.PI * 2;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const taper = Math.pow(1 + sin, 0.38);
    const stretch = sin < 0 ? 1.54 : 1;
    return {
      x: CENTER.x + cos * 48 * taper + seededJitter(seed + index),
      y: CENTER.y + sin * 48 * stretch + seededJitter(seed + index + 200),
    };
  });
}

function freeFallSphere(seed: number): Point[] {
  return Array.from({ length: SEGMENTS }, (_, index) => {
    const angle = (index / SEGMENTS) * Math.PI * 2;
    return {
      x: CENTER.x + Math.cos(angle) * 44 + seededJitter(seed + index),
      y: CENTER.y + Math.sin(angle) * 42 + seededJitter(seed + index + 200),
    };
  });
}

const earth = earthFlame(19);
const sphere = freeFallSphere(19);

function pathFor(points: Point[]): string {
  if (points.length === 0) return '';
  return `${points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')} Z`;
}

export function FlameToggle() {
  const [freeFall, setFreeFall] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef<number>(0);
  const progressRef = useRef(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (reducedMotion) {
      const next = freeFall ? 1 : 0;
      progressRef.current = next;
      setProgress(next);
      return;
    }
    const start = performance.now();
    const from = progressRef.current;
    const target = freeFall ? 1 : 0;
    const duration = 620;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const next = from + (target - from) * eased;
      progressRef.current = next;
      setProgress(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [freeFall, reducedMotion]);

  const points = earth.map((point, index) => {
    const target = sphere[index]!;
    return {
      x: point.x + (target.x - point.x) * progress,
      y: point.y + (target.y - point.y) * progress,
    };
  });

  const color = progress < 0.5 ? 'var(--ember)' : 'var(--ghost)';
  const label = progress < 0.5 ? '1 g' : 'free fall';

  return (
    <div className={`flame-panel ${reducedMotion ? 'flame-static' : ''}`}>
      <div className="flame-stage">
        {reducedMotion ? (
          <div className="flame-pair">
            <figure>
              <svg viewBox="0 0 160 220" role="img" aria-label="Earth flame: a teardrop rising in 1 g">
                <path d={pathFor(earth)} fill="var(--ember)" fillOpacity="0.16" stroke="var(--ember)" strokeWidth="1.5" />
              </svg>
              <figcaption>1 g</figcaption>
            </figure>
            <figure>
              <svg viewBox="0 0 160 220" role="img" aria-label="Free-fall flame: a ghost-blue sphere">
                <path d={pathFor(sphere)} fill="var(--ghost)" fillOpacity="0.16" stroke="var(--ghost)" strokeWidth="1.5" />
              </svg>
              <figcaption>free fall</figcaption>
            </figure>
          </div>
        ) : (
          <svg
            viewBox="0 0 160 220"
            role="img"
            aria-label={`Combustion flame in ${label}: ${freeFall ? 'a free-fall sphere where buoyancy is weak' : 'an Earth teardrop where hot gas rises'}`}
          >
            <line x1="80" y1="16" x2="80" y2="204" stroke="var(--hairline)" strokeWidth="1" />
            <line x1="16" y1="108" x2="144" y2="108" stroke="var(--hairline)" strokeWidth="1" />
            <path
              d={pathFor(points)}
              fill={color}
              fillOpacity="0.16"
              stroke={color}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <text x="85" y="204" fill="var(--ash)" className="flame-axis-label">
              {label}
            </text>
          </svg>
        )}
      </div>
      <div className="flame-controls">
        <span className="mono-label" id="flame-label">
          Flame view
        </span>
        <div className="segmented" role="group" aria-labelledby="flame-label">
          <button type="button" aria-pressed={!freeFall} onClick={() => setFreeFall(false)}>
            1 g
          </button>
          <button type="button" aria-pressed={freeFall} onClick={() => setFreeFall(true)}>
            free fall
          </button>
        </div>
        <p className="flame-caption">
          On Earth, hot gas rises and carries fresh oxygen to the flame. In free fall nothing rises,
          so the flame relies on diffusion for its oxygen.
        </p>
        {reducedMotion ? (
          <p className="small-note">Reduced motion is on. Both flame shapes are shown static.</p>
        ) : null}
      </div>
    </div>
  );
}

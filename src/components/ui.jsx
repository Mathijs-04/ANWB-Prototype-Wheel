import { useEffect, useRef, useState } from 'react';
import { colorFor, initials } from '../lib/utils';

export function Avatar({ name, size = 48, color }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: color || colorFor(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** A player's name with a highlighter in their own color. */
export function PlayerName({ player }) {
  return (
    <span className="player-name" style={{ '--pc': player.color }}>
      {player.name}
    </span>
  );
}

/** Renders text with {A} / {B} placeholders replaced by highlighted player names. */
export function WithNames({ text, A, B }) {
  const parts = String(text).split(/(\{A\}|\{B\})/);
  return parts.map((part, i) =>
    part === '{A}' ? <PlayerName key={i} player={A} /> : part === '{B}' ? <PlayerName key={i} player={B} /> : part,
  );
}

export function Btn({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Progress({ current, total }) {
  return (
    <div className="progress" aria-label={`Stap ${current + 1} van ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`progress-dot ${i < current ? 'done' : ''} ${i === current ? 'current' : ''}`} />
      ))}
      <span className="progress-label">
        {current + 1} / {total}
      </span>
    </div>
  );
}

/** Countdown in seconds; call start()/reset(). onEnd fires once when it reaches 0. */
export function useCountdown(seconds, onEnd) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const cb = useRef(onEnd);
  cb.current = onEnd;

  useEffect(() => {
    if (!running) return undefined;
    const end = performance.now() + left * 1000;
    const id = setInterval(() => {
      const l = Math.max(0, (end - performance.now()) / 1000);
      setLeft(l);
      if (l <= 0) {
        clearInterval(id);
        setRunning(false);
        cb.current?.();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return {
    left,
    running,
    start: () => setRunning(true),
    reset: (s = seconds) => {
      setRunning(false);
      setLeft(s);
    },
  };
}

export function RingTimer({ left, total, size = 120 }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const frac = total ? left / total : 0;
  const low = left <= 10;
  return (
    <div className={`ring-timer ${low ? 'is-low' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="ring-fg"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span>{Math.ceil(left)}</span>
    </div>
  );
}

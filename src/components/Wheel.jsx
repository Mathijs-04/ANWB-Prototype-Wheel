import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import logo from '../assets/anwb-logo.png';
import { sfx } from '../lib/sound';
import { textOn } from '../lib/utils';

const R = 462; // slice radius in a -500..500 viewBox
const mod = (a, n) => ((a % n) + n) % n;

// Angles are degrees clockwise from 12 o'clock.
function polar(r, deg) {
  const t = (deg * Math.PI) / 180;
  return [r * Math.sin(t), -r * Math.cos(t)];
}

function slicePath(a0, a1, r) {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

/**
 * segments: [{ key, category }]. Spin with ref.spin(); onResult(segment) fires when it stops.
 * The wheel itself (including the ANWB logo hub) rotates; the pointer stays at the top.
 */
const Wheel = forwardRef(function Wheel({ segments, canSpin, onBlocked, onSpinStart, onResult }, ref) {
  const rotorRef = useRef(null);
  const pointerRef = useRef(null);
  const rotation = useRef(0);
  const rafRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  const n = segments.length;
  const seg = n ? 360 / n : 360;

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function kickPointer() {
    const el = pointerRef.current;
    if (!el) return;
    el.classList.remove('kick');
    void el.offsetWidth; // restart the CSS animation
    el.classList.add('kick');
  }

  function spin() {
    if (spinning || !n) return;
    if (!canSpin) {
      onBlocked?.();
      return;
    }
    const idx = Math.floor(Math.random() * n);
    const landAt = (idx + 0.5) * seg + (Math.random() - 0.5) * seg * 0.6;
    const start = rotation.current;
    const turns = 5 + Math.floor(Math.random() * 3);
    // final rotation r must satisfy r ≡ -landAt (mod 360) so that slice sits under the pointer
    const target = start + turns * 360 + mod(-landAt - start, 360);
    const duration = 5200 + Math.random() * 1300;
    const t0 = performance.now();
    const ease = (t) => 1 - (1 - t) ** 4;
    let lastBoundary = Math.floor(start / seg);

    setSpinning(true);
    setWinner(null);
    onSpinStart?.();

    const frame = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      const r = start + (target - start) * ease(t);
      rotation.current = r;
      if (rotorRef.current) rotorRef.current.style.transform = `rotate(${r}deg)`;
      const boundary = Math.floor(r / seg);
      if (boundary !== lastBoundary) {
        lastBoundary = boundary;
        sfx.tick();
        kickPointer();
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        setWinner(idx);
        onResult?.(segments[idx]);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  }

  useImperativeHandle(ref, () => ({ spin, clear: () => setWinner(null) }));

  return (
    <div className={`wheel ${spinning ? 'is-spinning' : ''}`}>
      <div className="wheel-pointer" ref={pointerRef} aria-hidden="true">
        {/* pin: round head (centre 30,30 r26) tapering to a tip at (30,76); fits inside the viewBox incl. stroke */}
        <svg viewBox="-4 -4 68 88">
          <path d="M30 76 L8.5 44.6 A26 26 0 1 1 51.5 44.6 Z" fill="#FFCC00" stroke="#003D86" strokeWidth="5" strokeLinejoin="round" />
          <circle cx="30" cy="30" r="9" fill="#003D86" />
        </svg>
      </div>
      <button type="button" className="wheel-button" onClick={spin} disabled={spinning} aria-label="Draai aan het rad">
        <div className="wheel-rotor" ref={rotorRef}>
          <svg viewBox="-500 -500 1000 1000" className={winner != null ? 'has-winner' : ''}>
            <defs>
              <radialGradient id="wheel-shine">
                <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="88%" stopColor="#FFFFFF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
              </radialGradient>
            </defs>
            <circle r="498" fill="#003D86" />
            <circle r="472" fill="#002A5C" />
            {n === 0 && <circle r={R} fill="#DDE5F0" />}
            {segments.map((s, i) => {
              const a0 = i * seg;
              const mid = a0 + seg / 2;
              const color = s.category.color;
              const label = s.category.name;
              const fg = textOn(color);
              // single short words: big and bold, sized so every label fits the same band
              const width = [...label].reduce((w, ch) => w + (ch === ch.toUpperCase() && /\p{L}/u.test(ch) ? 0.72 : 0.6), 0);
              const fontSize = Math.min(52, 160 / Math.max(2.5, width));
              return (
                <g key={s.key} className={`slice ${winner === i ? 'win' : ''}`}>
                  {n === 1 ? (
                    <circle r={R} fill={color} />
                  ) : (
                    <path d={slicePath(a0, a0 + seg, R)} fill={color} stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
                  )}
                  <g transform={`rotate(${mid})`}>
                    <circle cy={-394} r="56" fill="#FFFFFF" opacity="0.95" />
                    <circle cy={-394} r="56" fill="none" stroke={fg} strokeOpacity="0.15" strokeWidth="4" />
                    <text y={-390} textAnchor="middle" dominantBaseline="central" fontSize="66" className="slice-icon">
                      {s.category.icon}
                    </text>
                    <text
                      transform="translate(0 -246) rotate(-90)"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={fontSize}
                      fill={fg}
                      className="slice-label"
                    >
                      {label}
                    </text>
                  </g>
                </g>
              );
            })}
            <circle r={R} fill="url(#wheel-shine)" pointerEvents="none" />
            {Array.from({ length: Math.max(1, n) * 2 }, (_, i) => {
              const [x, y] = polar(485, (i * seg) / 2);
              return <circle key={i} cx={x} cy={y} r="7.5" fill={i % 2 ? '#FFCC00' : '#FFFFFF'} className="rim-light" />;
            })}
            <circle r="150" fill="#FFFFFF" stroke="#003D86" strokeWidth="12" />
            <circle r="133" fill="none" stroke="#FFCC00" strokeWidth="5" strokeDasharray="10 12" />
            <image href={logo} x="-102" y="-52.5" width="204" height="105" />
          </svg>
        </div>
      </button>
    </div>
  );
});

export default Wheel;

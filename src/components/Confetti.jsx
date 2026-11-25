import { useEffect, useRef } from 'react';

const COLORS = ['#FFCC00', '#003D86', '#009FE3', '#F39200', '#0069B4'];

export default function Confetti({ duration = 4200 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const parts = Array.from({ length: 170 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.6,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3.5,
      w: 7 + Math.random() * 7,
      h: 4 + Math.random() * 5,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let raf;
    const start = performance.now();
    const step = (now) => {
      const t = now - start;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = t > duration - 800 ? Math.max(0, (duration - t) / 800) : 1;
      for (const p of parts) {
        p.x += p.vx + Math.sin((t + p.y) / 300) * 0.6;
        p.y += p.vy;
        p.vy += 0.03;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t < duration) raf = requestAnimationFrame(step);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}

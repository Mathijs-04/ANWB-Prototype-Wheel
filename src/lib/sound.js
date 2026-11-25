// Tiny synthesized sound effects (Web Audio), so no audio files are needed.
let ctx = null;
let enabled = true;
let lastTick = 0;

export function setSoundEnabled(value) {
  enabled = !!value;
}

function getCtx() {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur = 0.15, { type = 'sine', gain = 0.12, delay = 0, slide = 0 } = {}) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.03);
}

export const sfx = {
  tick() {
    const now = performance.now();
    if (now - lastTick < 45) return;
    lastTick = now;
    tone(1400, 0.035, { type: 'square', gain: 0.03 });
  },
  land() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.22, { type: 'triangle', gain: 0.12, delay: i * 0.08 }));
  },
  correct() {
    tone(660, 0.12, { type: 'triangle' });
    tone(990, 0.22, { type: 'triangle', delay: 0.1 });
  },
  wrong() {
    tone(240, 0.28, { type: 'sawtooth', gain: 0.045, slide: 0.7 });
  },
  pop() {
    tone(500, 0.08, { gain: 0.08, slide: 1.8 });
  },
  reveal() {
    tone(440, 0.12, { type: 'triangle' });
    tone(554, 0.12, { type: 'triangle', delay: 0.1 });
    tone(659, 0.22, { type: 'triangle', delay: 0.2 });
  },
  beep() {
    tone(880, 0.12, { type: 'square', gain: 0.04 });
  },
  go() {
    tone(1320, 0.3, { type: 'square', gain: 0.05 });
  },
  buzzer() {
    tone(180, 0.5, { type: 'sawtooth', gain: 0.05 });
  },
  fanfare() {
    [523.25, 659.25, 783.99].forEach((f, i) => tone(f, 0.18, { type: 'triangle', delay: i * 0.12 }));
    tone(1046.5, 0.55, { type: 'triangle', delay: 0.36 });
  },
};

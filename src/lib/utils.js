export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function shuffle(list) {
  const r = [...list];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const sample = (list, n) => shuffle(list).slice(0, n);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const lc = (s) => String(s ?? '').trim().toLowerCase();
export const firstName = (name) => String(name ?? '').trim().split(/\s+/)[0] || '';

export function initials(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const AVATAR_COLORS = ['#003D86', '#0069B4', '#009FE3', '#F39200', '#00857C', '#5B6B85'];
export function colorFor(name) {
  let h = 0;
  for (const ch of String(name ?? '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function luminance(hex) {
  const m = String(hex).replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Picks navy or white text, whichever contrasts best with the given background. */
export function textOn(bg) {
  try {
    const L = luminance(bg);
    const navy = luminance('#003D86');
    const withWhite = 1.05 / (L + 0.05);
    const withNavy = (Math.max(L, navy) + 0.05) / (Math.min(L, navy) + 0.05);
    return withNavy > withWhite ? '#003D86' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
}

export const parseNum = (s) => Number(String(s ?? '').trim().replace(/\s/g, '').replace(',', '.'));
export const fmtNum = (n) => Number(n).toLocaleString('nl-NL');

/** Reads an image file and returns a downscaled JPEG data URL (keeps localStorage small). */
export function resizeImage(file, max = 640, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** "🚗 Auto" -> { emoji: '🚗', label: 'Auto' } */
export function parseIcon(line) {
  const [emoji, ...rest] = String(line).trim().split(/\s+/);
  return { emoji, label: rest.join(' ') };
}

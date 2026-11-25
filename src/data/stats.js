// Play history (used to avoid repeating the same activity). Kept apart from the content data so a content reset keeps them (and vice versa).
const KEY = 'anwb-draai-verbind-stats';
const empty = () => ({ history: [], plays: 0 });

export function getStats() {
  try {
    return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return empty();
  }
}

function save(stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* ignore: stats are a nice-to-have */
  }
}

export function recordPlay(activityId) {
  const s = getStats();
  s.history = [...s.history, activityId].slice(-20);
  s.plays += 1;
  save(s);
}

export function resetStats() {
  save(empty());
}

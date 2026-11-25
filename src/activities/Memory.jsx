import { useEffect, useRef, useState } from 'react';
import { PlayerName } from '../components/ui';
import { sfx } from '../lib/sound';
import { parseIcon, sample, shuffle } from '../lib/utils';

/** Cooperative memory: players alternate turns and try to beat a shared move target. */
export default function Memory({ activity, players, onComplete }) {
  const icons = (activity.icons || []).filter(Boolean).map(parseIcon);
  const pairs = Math.max(2, Math.min(activity.pairs || 8, icons.length));
  const target = activity.targetMoves || pairs * 2;

  const [cards] = useState(() =>
    shuffle(sample(icons, pairs).flatMap((ic, k) => [
      { key: `${k}a`, pair: k, ...ic },
      { key: `${k}b`, pair: k, ...ic },
    ])),
  );
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [turn, setTurn] = useState(0);
  const [lock, setLock] = useState(false);
  const timeouts = useRef([]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timeouts.current.push(setTimeout(fn, ms));

  function finish(totalMoves) {
    onComplete({ score: `Alle paren in ${totalMoves} beurten` });
  }

  function flip(idx) {
    const card = cards[idx];
    if (lock || open.includes(idx) || matched.has(card.pair)) return;
    sfx.pop();
    const nextOpen = [...open, idx];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const total = moves + 1;
    setMoves(total);
    const [x, y] = nextOpen;
    if (cards[x].pair === cards[y].pair) {
      const m = new Set(matched);
      m.add(cards[x].pair);
      setMatched(m);
      setOpen([]);
      sfx.correct();
      if (m.size === pairs) {
        setLock(true);
        later(() => finish(total), 1000);
      }
    } else {
      setLock(true);
      later(() => {
        setOpen([]);
        setLock(false);
        setTurn((t) => 1 - t);
      }, 1100);
    }
  }

  const cols = cards.length > 16 ? 5 : 4;
  const rows = Math.ceil(cards.length / cols);

  return (
    <div className="act act-memory">
      <div className="memory-bar">
        <div className="turn-banner" style={{ '--pc': players[turn].color }}>
          Beurt: <PlayerName player={players[turn]} />
        </div>
        <div className="memory-stats">
          <span>
            Paren <b>{matched.size}</b>/{pairs}
          </span>
          <span className={moves > target ? 'over' : ''}>
            Beurten <b>{moves}</b> · doel {target}
          </span>
        </div>
      </div>
      <p className="act-sub">Vind je een paar? Dan mag je nog een keer! Help elkaar onthouden.</p>
      <div className="mem-grid" style={{ '--cols': cols, '--rows': rows }}>
        {cards.map((c, idx) => {
          const isOpen = open.includes(idx) || matched.has(c.pair);
          return (
            <button
              type="button"
              key={c.key}
              className={`mem-card ${isOpen ? 'is-open' : ''} ${matched.has(c.pair) ? 'is-matched' : ''}`}
              onClick={() => flip(idx)}
              aria-label={isOpen ? c.label : 'Verborgen kaart'}
            >
              <span className="mem-inner">
                <span className="mem-face mem-back" />
                <span className="mem-face mem-front">
                  <span className="mem-emoji">{c.emoji}</span>
                  <span className="mem-label">{c.label}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

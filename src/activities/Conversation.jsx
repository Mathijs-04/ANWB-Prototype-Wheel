import { useMemo, useState } from 'react';
import { Btn, PlayerName, Progress, RingTimer, WithNames, useCountdown } from '../components/ui';
import { sfx } from '../lib/sound';
import { shuffle } from '../lib/utils';

/** Open conversation cards. Supports {A}/{B} name placeholders and an optional talk timer per card. */
export default function Conversation({ activity, players, onComplete }) {
  const order = useMemo(() => shuffle([0, 1]), []);
  const A = players[order[0]];
  const B = players[order[1]];

  const [state, setState] = useState(() => {
    const all = (activity.cards || []).filter(Boolean);
    const deck = activity.random === false ? all : shuffle(all);
    const count = Math.max(1, Math.min(activity.count || 4, deck.length));
    return { cards: deck.slice(0, count), spare: deck.slice(count) };
  });
  const [i, setI] = useState(0);
  const seconds = Number(activity.timer) || 0;
  const timer = useCountdown(seconds, () => sfx.buzzer());

  const { cards, spare } = state;
  const text = cards[i];
  if (!text) return null;
  const last = i === cards.length - 1;
  const hasNames = /\{[AB]\}/.test(text);
  const starter = i % 2 === 0 ? A : B;

  function next() {
    timer.reset();
    if (last) {
      onComplete({ score: null });
      return;
    }
    sfx.pop();
    setI(i + 1);
  }

  function swap() {
    if (!spare.length) return;
    const nextCards = [...cards];
    const old = nextCards[i];
    nextCards[i] = spare[0];
    setState({ cards: nextCards, spare: [...spare.slice(1), old] });
    timer.reset();
    sfx.pop();
  }

  return (
    <div className="act act-talk">
      <Progress current={i} total={cards.length} />
      <div className="talk-card" key={`${i}-${text}`}>
        <span className="talk-quote" aria-hidden="true">“</span>
        <p>
          <WithNames text={text} A={A} B={B} />
        </p>
      </div>

      {!hasNames && (
        <div className="starter">
          🎤 <PlayerName player={starter} /> begint, daarna is de ander aan de beurt.
        </div>
      )}

      {seconds > 0 && (
        <div className="talk-timer">
          <RingTimer left={timer.left} total={seconds} size={110} />
          {!timer.running && timer.left > 0 && (
            <Btn variant="yellow" onClick={timer.start}>
              {timer.left === seconds ? '▶ Start de timer' : '▶ Verder'}
            </Btn>
          )}
          {timer.left <= 0 && <strong className="talk-timeup">Tijd is om! ⏰</strong>}
        </div>
      )}

      <div className="act-actions">
        {activity.random !== false && spare.length > 0 && (
          <Btn variant="ghost" onClick={swap}>
            ↻ Andere vraag
          </Btn>
        )}
        <Btn onClick={next}>{last ? 'Afronden' : 'Volgende vraag →'}</Btn>
      </div>
    </div>
  );
}

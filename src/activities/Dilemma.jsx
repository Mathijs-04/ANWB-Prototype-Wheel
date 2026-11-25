import { useMemo, useState } from 'react';
import { Btn, PlayerName, Progress } from '../components/ui';
import { sfx } from '../lib/sound';
import { sample } from '../lib/utils';

/** A/B dilemmas or statements. Players pick in turn (choice hidden), then both choices are revealed. */
export default function Dilemma({ activity, players, onComplete }) {
  const items = useMemo(() => sample(activity.items || [], activity.count || 5), [activity]);
  const [i, setI] = useState(0);
  const [choices, setChoices] = useState([null, null]);
  const [agreed, setAgreed] = useState(0);

  const item = items[i];
  if (!item) return null;
  const last = i === items.length - 1;
  const turn = choices[0] === null ? 0 : choices[1] === null ? 1 : null;
  const revealed = turn === null;
  const same = revealed && choices[0] === choices[1];

  function choose(opt) {
    if (revealed) return;
    const next = [...choices];
    next[turn] = opt;
    setChoices(next);
    if (turn === 1) {
      if (next[0] === next[1]) {
        setAgreed((a) => a + 1);
        sfx.correct();
      } else sfx.reveal();
    } else sfx.pop();
  }

  function nextItem() {
    if (last) {
      onComplete({ score: `${agreed} van de ${items.length} keer eens` });
      return;
    }
    setI(i + 1);
    setChoices([null, null]);
  }

  return (
    <div className="act act-dilemma" key={i}>
      <Progress current={i} total={items.length} />
      <h3 className="act-question">{item.q || 'Wat kies jij liever?'}</h3>

      <div className="turn-banner" style={{ '--pc': revealed ? '#003D86' : players[turn].color }}>
        {revealed ? (
          same ? (
            <>🤝 Jullie zijn het eens! Waarom kozen jullie dit?</>
          ) : (
            <>🔀 Verschillende keuzes. Leg elkaar uit waarom!</>
          )
        ) : turn === 0 ? (
          <>
            <PlayerName player={players[0]} />, wat kies jij?
          </>
        ) : (
          <>
            ✓ {players[0].name} heeft gekozen. Nu jij, <PlayerName player={players[1]} />!
          </>
        )}
      </div>

      <div className="duo-cards">
        {['a', 'b'].map((opt) => {
          const voters = players.filter((_, k) => choices[k] === opt);
          const emoji = opt === 'a' ? item.emojiA : item.emojiB;
          return (
            <button
              type="button"
              key={opt}
              className={`duo-card opt-${opt} ${revealed && !voters.length ? 'is-dim' : ''}`}
              onClick={() => choose(opt)}
              disabled={revealed}
            >
              {emoji && <span className="duo-emoji">{emoji}</span>}
              <span className="duo-text">{item[opt]}</span>
              {revealed && voters.length > 0 && (
                <span className="duo-voters">
                  {voters.map((p) => (
                    <span key={p.name} className="voter" style={{ '--pc': p.color }}>
                      {p.name}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
        <div className="duo-or">OF</div>
      </div>

      <div className="act-actions">{revealed && <Btn onClick={nextItem}>{last ? 'Bekijk resultaat' : 'Volgende →'}</Btn>}</div>
    </div>
  );
}

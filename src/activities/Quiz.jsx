import { useMemo, useState } from 'react';
import { Btn, Progress } from '../components/ui';
import { sfx } from '../lib/sound';
import { fmtNum, parseNum, sample } from '../lib/utils';

const TILES = [
  { bg: '#003D86', fg: '#FFFFFF' },
  { bg: '#009FE3', fg: '#FFFFFF' },
  { bg: '#FFCC00', fg: '#003D86' },
  { bg: '#F39200', fg: '#003D86' },
];

export default function Quiz({ activity, players, onComplete }) {
  const questions = useMemo(() => sample(activity.questions || [], activity.count || 5), [activity]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [guesses, setGuesses] = useState(['', '']);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ team: 0, choice: 0 });

  const q = questions[i];
  if (!q) return null;
  const last = i === questions.length - 1;
  const isNumber = q.kind === 'number';

  const diffs = isNumber ? guesses.map((g) => Math.abs(parseNum(g) - Number(q.answer))) : [];
  const best = diffs.length ? Math.min(...diffs) : null;
  const guessesValid = guesses.every((g) => g.trim() !== '' && !Number.isNaN(parseNum(g)));

  function pickAnswer(idx) {
    if (revealed) return;
    const ok = idx === q.answer;
    setPicked(idx);
    setRevealed(true);
    if (ok) sfx.correct();
    else sfx.wrong();
    setScore((s) => ({ ...s, team: s.team + (ok ? 1 : 0), choice: s.choice + 1 }));
  }

  function revealNumber() {
    setRevealed(true);
    sfx.reveal();
  }

  function finish() {
    // estimate questions have no right/wrong, so the score counts the multiple-choice questions
    onComplete({ score: score.choice ? `${score.team} van de ${score.choice} goed` : null });
  }

  function next() {
    if (last) return finish();
    setI(i + 1);
    setPicked(null);
    setGuesses(['', '']);
    setRevealed(false);
  }

  const ok = picked === q.answer;

  return (
    <div className="act act-quiz" key={i}>
      <Progress current={i} total={questions.length} />
      <h3 className="act-question">{q.q}</h3>

      {isNumber ? (
        <>
          {!revealed && <p className="act-sub">Schatvraag! Ieder vult een eigen getal in. Wie zit het dichtst bij?</p>}
          <div className="estimate-row">
            {players.map((p, k) => (
              <label
                key={k}
                className={`estimate-card ${revealed && diffs[k] === best ? 'is-best' : ''}`}
                style={{ '--pc': p.color }}
              >
                <span className="estimate-name">{p.name}</span>
                <input
                  inputMode="decimal"
                  value={guesses[k]}
                  disabled={revealed}
                  placeholder="?"
                  onChange={(e) => setGuesses((g) => g.map((v, j) => (j === k ? e.target.value : v)))}
                />
                {revealed && (
                  <span className="estimate-diff">
                    {diffs[k] === 0 ? 'Precies goed! 🎯' : `${fmtNum(diffs[k])} ernaast`}
                    {diffs[k] === best && ' 👑'}
                  </span>
                )}
              </label>
            ))}
          </div>
          {revealed && (
            <div className="answer-reveal">
              <span>Het juiste antwoord</span>
              <strong>
                {q.unit ? fmtNum(q.answer) : q.answer} {q.unit}
              </strong>
            </div>
          )}
        </>
      ) : (
        <>
          {revealed ? (
            <div className={`feedback ${ok ? 'good' : 'bad'}`}>{ok ? 'Goed zo! 🎉' : 'Helaas, dat is niet goed'}</div>
          ) : (
            <p className="act-sub">Overleg samen en kies één antwoord.</p>
          )}
          <div className="tiles">
            {q.options.map((o, k) => {
              const state = !revealed ? '' : k === q.answer ? 'is-correct' : k === picked ? 'is-wrong' : 'is-dim';
              return (
                <button
                  type="button"
                  key={k}
                  className={`tile ${state}`}
                  style={{ '--tile': TILES[k % 4].bg, '--tile-text': TILES[k % 4].fg }}
                  onClick={() => pickAnswer(k)}
                  disabled={revealed}
                >
                  <span className="tile-letter">{'ABCD'[k]}</span>
                  <span className="tile-text">{o}</span>
                  {revealed && k === q.answer && <span className="tile-mark good">✓</span>}
                  {revealed && k === picked && k !== q.answer && <span className="tile-mark bad">✗</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {revealed && q.info && <div className="info-box">💡 {q.info}</div>}

      <div className="act-actions">
        {isNumber && !revealed && (
          <Btn variant="yellow" onClick={revealNumber} disabled={!guessesValid}>
            Onthul het antwoord
          </Btn>
        )}
        {revealed && <Btn onClick={next}>{last ? 'Bekijk resultaat' : 'Volgende vraag →'}</Btn>}
      </div>
    </div>
  );
}

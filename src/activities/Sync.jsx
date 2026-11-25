import { useEffect, useMemo, useState } from 'react';
import { Btn, Progress } from '../components/ui';
import { sfx } from '../lib/sound';
import { sample } from '../lib/utils';

/** "Op één lijn": count down together and say an answer at the same time. Missed? One retry to meet in the middle. */
export default function Sync({ activity, players, onComplete }) {
  const prompts = useMemo(() => sample((activity.prompts || []).filter(Boolean), activity.count || 6), [activity]);
  const [i, setI] = useState(0);
  const [stage, setStage] = useState('prompt'); // prompt | count | say | result
  const [attempt, setAttempt] = useState(0);
  const [count, setCount] = useState(3);
  const [hits, setHits] = useState(0);
  const [lastOk, setLastOk] = useState(null);

  useEffect(() => {
    if (stage !== 'count') return undefined;
    let n = 3;
    setCount(3);
    sfx.beep();
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        sfx.go();
        setStage('say');
      } else {
        setCount(n);
        sfx.beep();
      }
    }, 850);
    return () => clearInterval(id);
  }, [stage, attempt]);

  const prompt = prompts[i];
  if (!prompt) return null;
  const last = i === prompts.length - 1;

  function answer(same) {
    setLastOk(same);
    if (same) {
      setHits((h) => h + 1);
      sfx.correct();
    } else sfx.wrong();
    setStage('result');
  }

  function retry() {
    setAttempt((a) => a + 1);
    setStage('count');
  }

  function next() {
    if (last) {
      onComplete({ score: `${hits} van de ${prompts.length} goed` });
      return;
    }
    setI(i + 1);
    setAttempt(0);
    setLastOk(null);
    setStage('prompt');
  }

  const promptText = attempt > 0 ? 'Iets wat tussen jullie twee antwoorden in ligt' : prompt;

  return (
    <div className="act act-sync">
      <Progress current={i} total={prompts.length} />

      {stage === 'prompt' && (
        <>
          <p className="act-kicker">Noem tegelijk…</p>
          <div className="sync-prompt">{prompt}</div>
          <p className="act-sub">
            Bedenk allebei stil een antwoord. Tel samen af en zeg het tegelijk hardop, {players[0].name} en {players[1].name}!
          </p>
          <div className="act-actions">
            <Btn variant="yellow" onClick={() => setStage('count')}>
              3, 2, 1… aftellen
            </Btn>
          </div>
        </>
      )}

      {stage === 'count' && (
        <>
          <p className="act-kicker">{promptText}</p>
          <div className="sync-count" key={count}>
            {count}
          </div>
        </>
      )}

      {stage === 'say' && (
        <>
          <div className="sync-now">Zeg het NU! 🗣️</div>
          <h3 className="act-question">Zeiden jullie hetzelfde?</h3>
          <div className="act-actions">
            <Btn variant="ghost" onClick={() => answer(false)}>
              Nee, iets anders
            </Btn>
            <Btn variant="success" onClick={() => answer(true)}>
              Ja, hetzelfde! 🎉
            </Btn>
          </div>
        </>
      )}

      {stage === 'result' && (
        <>
          <div className="big-emoji">{lastOk ? '🤝' : '🙃'}</div>
          <h3 className="act-question">{lastOk ? 'Op één lijn!' : 'Net niet!'}</h3>
          {!lastOk && attempt === 0 && (
            <p className="act-sub">
              Tweede kans: bedenk allebei iets wat tussen jullie twee antwoorden in ligt, en zeg het weer tegelijk.
            </p>
          )}
          <div className="act-actions">
            {!lastOk && attempt === 0 && (
              <Btn variant="yellow" onClick={retry}>
                Nog een poging
              </Btn>
            )}
            <Btn onClick={next}>{last ? 'Bekijk resultaat' : 'Volgende →'}</Btn>
          </div>
        </>
      )}
    </div>
  );
}

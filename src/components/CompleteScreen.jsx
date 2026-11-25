import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sound';
import Confetti from './Confetti';
import { Btn } from './ui';

/** result = { score: string | null }, e.g. "4 van de 5 goed". Returns to the wheel automatically. */
export default function CompleteScreen({ result, players, seconds = 45, onDone }) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    sfx.fanfare();
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left <= 0) done.current();
  }, [left]);

  return (
    <div className="complete">
      <Confetti />
      <div className="complete-check">✓</div>
      <h2>Activiteit voltooid!</h2>
      {result?.score && <p className="complete-score">{result.score}</p>}
      <p className="complete-thanks">
        Bedankt voor het spelen, {players[0].name} en {players[1].name}!
      </p>
      <Btn variant="yellow" onClick={onDone}>
        Terug naar het rad
      </Btn>
    </div>
  );
}

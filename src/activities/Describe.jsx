import { useState } from 'react';
import { Btn, PlayerName, useCountdown } from '../components/ui';
import { sfx } from '../lib/sound';
import { shuffle } from '../lib/utils';

/** "Beschrijf het!": one player describes, the other guesses, against the clock. Team score + team record. */
export default function Describe({ activity, players, onComplete }) {
  const rounds = activity.rounds || 2;
  const seconds = activity.seconds || 60;
  const [words] = useState(() => shuffle((activity.words || []).filter(Boolean)));
  const [wordIndex, setWordIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [stage, setStage] = useState('ready'); // ready | play | end
  const [roundScores, setRoundScores] = useState([]);
  const timer = useCountdown(seconds, () => {
    sfx.buzzer();
    setStage('end');
  });

  const describer = players[round % 2];
  const guesser = players[(round + 1) % 2];
  const word = words.length ? words[wordIndex % words.length] : '…';
  const current = roundScores[round] || 0;
  const total = roundScores.reduce((a, b) => a + b, 0);

  function start() {
    setRoundScores((s) => {
      const n = [...s];
      n[round] = 0;
      return n;
    });
    timer.reset(seconds);
    timer.start();
    setStage('play');
    sfx.go();
  }

  function hit() {
    sfx.correct();
    setRoundScores((s) => s.map((v, k) => (k === round ? v + 1 : v)));
    setWordIndex((w) => w + 1);
  }

  function skip() {
    sfx.pop();
    setWordIndex((w) => w + 1);
  }

  function nextRound() {
    if (round < rounds - 1) {
      setRound(round + 1);
      setStage('ready');
      return;
    }
    onComplete({ score: `${total} ${total === 1 ? 'woord' : 'woorden'} geraden` });
  }

  return (
    <div className="act act-describe">
      {stage === 'ready' && (
        <div className="describe-ready">
          <span className="round-chip">
            Ronde {round + 1} van {rounds}
          </span>
          <h3 className="act-question">
            <PlayerName player={describer} /> beschrijft, <PlayerName player={guesser} /> raadt
          </h3>
          <div className="rules">
            <p>🙈 {guesser.name}, niet naar het scherm kijken!</p>
            <p>🤫 Zeg het woord zelf niet, en ook geen deel ervan.</p>
            <p>⏱️ Zoveel mogelijk woorden in {seconds} seconden. Lastig? Sla over!</p>
          </div>
          <div className="act-actions">
            <Btn variant="yellow" onClick={start}>
              Start! ▶
            </Btn>
          </div>
        </div>
      )}

      {stage === 'play' && (
        <>
          <div className="time-bar">
            <div className="time-fill" style={{ width: `${(timer.left / seconds) * 100}%` }} />
            <span>{Math.ceil(timer.left)}s</span>
          </div>
          <p className="act-sub">
            <PlayerName player={describer} /> beschrijft:
          </p>
          <div className="word-card" key={wordIndex}>
            {word}
          </div>
          <div className="score-chip">✓ {current} geraden</div>
          <div className="act-actions">
            <Btn variant="ghost" onClick={skip}>
              Overslaan →
            </Btn>
            <Btn variant="success" onClick={hit}>
              Geraden! ✓
            </Btn>
          </div>
        </>
      )}

      {stage === 'end' && (
        <div className="describe-ready">
          <div className="big-emoji">⏰</div>
          <h3 className="act-question">Tijd!</h3>
          <p className="act-big">
            {current} {current === 1 ? 'woord' : 'woorden'} geraden
          </p>
          <div className="act-actions">
            <Btn onClick={nextRound}>{round < rounds - 1 ? 'Wissel van rol →' : 'Bekijk resultaat'}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

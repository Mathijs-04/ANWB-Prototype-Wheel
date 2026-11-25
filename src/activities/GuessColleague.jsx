import { useMemo, useState } from 'react';
import { Btn, PlayerName, Progress } from '../components/ui';
import { useData } from '../data/store';
import { sfx } from '../lib/sound';
import { lc, pick, sample, shuffle } from '../lib/utils';

const FALLBACK_HOBBIES = ['tuinieren', 'gamen', 'schaken', 'yoga', 'surfen', 'breien', 'zingen', 'tennis', 'puzzelen', 'paardrijden'];

function buildRounds(count, players, data) {
  const pqs = shuffle(data.profileQuestions || []);
  const allHobbies = [...new Set([...data.people.flatMap((p) => p.hobbies || []), ...FALLBACK_HOBBIES].map(lc))];
  const hobbyUsed = [false, false];
  let pqIndex = 0;
  const rounds = [];

  for (let r = 0; r < count; r++) {
    const guesser = r % 2;
    const subject = 1 - guesser;
    const hobbies = (players[subject].person?.hobbies || []).filter(Boolean);
    const wantHobby = r >= 2 && !hobbyUsed[subject] && hobbies.length > 0 && (r >= count - 2 || Math.random() < 0.5);

    if (wantHobby || (!pqs.length && hobbies.length && !hobbyUsed[subject])) {
      hobbyUsed[subject] = true;
      const real = pick(hobbies);
      const own = hobbies.map(lc);
      const decoys = sample(allHobbies.filter((h) => !own.includes(h)), 3);
      rounds.push({
        kind: 'hobby',
        guesser,
        subject,
        options: shuffle([real, ...decoys]).map((h) => ({ id: lc(h), label: h, emoji: '🎯' })),
        answer: lc(real),
      });
      continue;
    }
    if (!pqs.length) break;
    const q = pqs[pqIndex++ % pqs.length];
    const known = players[subject].person?.answers?.[q.id];
    rounds.push({
      kind: 'pq',
      guesser,
      subject,
      options: [
        { id: 'a', label: q.a, emoji: q.emojiA },
        { id: 'b', label: q.b, emoji: q.emojiB },
      ],
      answer: known === 'a' || known === 'b' ? known : null,
    });
  }
  return rounds;
}

/**
 * "Hoe goed ken je elkaar?": players take turns guessing what the other picks.
 * Uses the subject's admin profile when available; otherwise the subject reveals their own answer.
 */
export default function GuessColleague({ activity, players, onComplete }) {
  const { data } = useData();
  const rounds = useMemo(() => buildRounds(activity.rounds || 6, players, data), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [stage, setStage] = useState('guess'); // guess | confirm | reveal
  const [guess, setGuess] = useState(null);
  const [real, setReal] = useState(null);
  const [scores, setScores] = useState([0, 0]);

  const round = rounds[i];
  if (!round) return null;
  const last = i === rounds.length - 1;
  const G = players[round.guesser];
  const S = players[round.subject];
  const optionLabel = (id) => round.options.find((o) => o.id === id)?.label ?? id;

  function reveal(g, r) {
    setReal(r);
    setStage('reveal');
    if (g === r) {
      sfx.correct();
      setScores((s) => s.map((v, k) => (k === round.guesser ? v + 1 : v)));
    } else sfx.wrong();
  }

  function onPick(id) {
    if (stage === 'guess') {
      setGuess(id);
      if (round.answer) reveal(id, round.answer);
      else {
        sfx.pop();
        setStage('confirm');
      }
    } else if (stage === 'confirm') reveal(guess, id);
  }

  function next() {
    if (last) {
      onComplete({ score: `${scores[0] + scores[1]} van de ${rounds.length} goed` });
      return;
    }
    setI(i + 1);
    setStage('guess');
    setGuess(null);
    setReal(null);
  }

  const ok = stage === 'reveal' && guess === real;
  const isDuo = round.options.length === 2;

  return (
    <div className="act act-guess" key={i}>
      <Progress current={i} total={rounds.length} />

      {stage === 'guess' && (
        <>
          <h3 className="act-question">
            <PlayerName player={G} />, {round.kind === 'hobby' ? <>welke hobby heeft </> : <>wat kiest </>}
            <PlayerName player={S} />
            {round.kind === 'hobby' ? '?' : ' liever?'}
          </h3>
          <p className="act-sub">{S.name}, niet voorzeggen! 🤐</p>
        </>
      )}
      {stage === 'confirm' && (
        <>
          <h3 className="act-question">
            <PlayerName player={S} />, wat is jouw echte antwoord?
          </h3>
          <p className="act-sub">{G.name} heeft gegokt. Eerlijk zijn!</p>
        </>
      )}
      {stage === 'reveal' && (
        <>
          <div className={`feedback ${ok ? 'good' : 'bad'}`}>{ok ? 'Goed geraden! 🎉' : 'Mis! 😅'}</div>
          <h3 className="act-question">
            {round.kind === 'hobby' ? (
              <>
                <PlayerName player={S} /> houdt van {optionLabel(real)}
              </>
            ) : (
              <>
                <PlayerName player={S} /> kiest {optionLabel(real).toLowerCase()}
              </>
            )}
          </h3>
          <p className="act-sub">Vertel eens, {S.name}: waarom?</p>
        </>
      )}

      <div className={isDuo ? 'duo-cards' : 'tiles tiles-light'}>
        {round.options.map((o) => {
          const state =
            stage !== 'reveal' ? '' : o.id === real ? 'is-correct' : o.id === guess ? 'is-wrong' : 'is-dim';
          return (
            <button
              type="button"
              key={o.id}
              className={isDuo ? `duo-card opt-${o.id} ${state === 'is-dim' || state === 'is-wrong' ? 'is-dim' : ''}` : `tile ${state}`}
              onClick={() => onPick(o.id)}
              disabled={stage === 'reveal'}
            >
              {isDuo && o.emoji && <span className="duo-emoji">{o.emoji}</span>}
              {!isDuo && <span className="tile-letter">{o.emoji}</span>}
              <span className={isDuo ? 'duo-text' : 'tile-text'}>{o.label}</span>
              {stage === 'reveal' && o.id === guess && <span className="guess-tag">gok van {G.name}</span>}
            </button>
          );
        })}
        {isDuo && <div className="duo-or">OF</div>}
      </div>

      <div className="act-actions">{stage === 'reveal' && <Btn onClick={next}>{last ? 'Bekijk resultaat' : 'Volgende →'}</Btn>}</div>
    </div>
  );
}

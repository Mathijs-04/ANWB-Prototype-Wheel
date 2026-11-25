import { useMemo, useState } from 'react';
import { Avatar, Btn, Progress } from '../components/ui';
import { useData } from '../data/store';
import { sfx } from '../lib/sound';
import { lc, sample, shuffle } from '../lib/utils';

export const CLUE_TYPES = {
  hobby: { label: "Hobby's", prompt: 'Wie heeft deze hobby?', icon: '🎯' },
  funFact: { label: 'Leuke weetjes', prompt: 'Van wie is dit weetje?', icon: '💡' },
  project: { label: 'Projecten', prompt: 'Wie werkt hieraan?', icon: '🛠️' },
  photo: { label: "Foto's", prompt: 'Bij wie hoort deze foto?', icon: '📷' },
};

/** Collects clues about colleagues who are NOT currently playing. Hobbies only count when unique. */
export function buildClues(data, players, clueTypes = []) {
  const playerIds = players.map((p) => p.personId).filter(Boolean);
  const people = data.people.filter((p) => !playerIds.includes(p.id));
  const hobbyCount = {};
  people.forEach((p) => (p.hobbies || []).forEach((h) => (hobbyCount[lc(h)] = (hobbyCount[lc(h)] || 0) + 1)));

  const clues = [];
  for (const p of people) {
    if (clueTypes.includes('hobby'))
      (p.hobbies || []).filter((h) => h && hobbyCount[lc(h)] === 1).forEach((h) => clues.push({ type: 'hobby', personId: p.id, value: h }));
    if (clueTypes.includes('funFact') && p.funFact?.trim()) clues.push({ type: 'funFact', personId: p.id, value: p.funFact });
    if (clueTypes.includes('project') && p.project?.trim()) clues.push({ type: 'project', personId: p.id, value: p.project });
    if (clueTypes.includes('photo') && p.photo) clues.push({ type: 'photo', personId: p.id, value: p.photo });
  }
  return { people, clues };
}

export function canPlayWhoIsIt(activity, ctx) {
  const { people, clues } = buildClues(ctx.data, ctx.players || [], activity.clueTypes || []);
  return people.length >= 3 && new Set(clues.map((c) => c.personId)).size >= 3;
}

/** Picks clues: mixes clue types and prefers a different colleague per question. */
function pickQuestions(people, clues, count) {
  const byType = {};
  shuffle(clues).forEach((c) => (byType[c.type] ||= []).push(c));
  // photo clues first in the rotation so uploaded photos actually show up
  const types = shuffle(Object.keys(byType)).sort((a, b) => (b === 'photo') - (a === 'photo'));
  const mixed = [];
  while (types.some((t) => byType[t].length)) types.forEach((t) => byType[t].length && mixed.push(byType[t].shift()));

  const chosen = [];
  const used = new Set();
  for (const c of mixed) if (chosen.length < count && !used.has(c.personId)) chosen.push(c) && used.add(c.personId);
  for (const c of mixed) if (chosen.length < count && !chosen.includes(c)) chosen.push(c);

  return shuffle(chosen).map((clue) => {
    const subject = people.find((p) => p.id === clue.personId);
    const others = sample(people.filter((p) => p.id !== subject.id), 3);
    return { clue, subject, options: shuffle([subject, ...others]) };
  });
}

export default function WhoIsIt({ activity, players, onComplete }) {
  const { data } = useData();
  const questions = useMemo(() => {
    const { people, clues } = buildClues(data, players, activity.clueTypes || []);
    return pickQuestions(people, clues, activity.count || 5);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  const q = questions[i];
  if (!q) return null;
  const last = i === questions.length - 1;
  const revealed = picked !== null;
  const ok = picked === q.subject.id;
  const meta = CLUE_TYPES[q.clue.type];

  function choose(id) {
    if (revealed) return;
    setPicked(id);
    if (id === q.subject.id) {
      setScore((s) => s + 1);
      sfx.correct();
    } else sfx.wrong();
  }

  function next() {
    if (last) {
      onComplete({ score: `${score} van de ${questions.length} goed` });
      return;
    }
    setI(i + 1);
    setPicked(null);
  }

  return (
    <div className="act act-who" key={i}>
      <Progress current={i} total={questions.length} />
      <h3 className="act-question">{meta.prompt}</h3>

      <div className={`clue-card clue-${q.clue.type}`}>
        {q.clue.type === 'photo' ? (
          <img src={q.clue.value} alt="Foto van een activiteit van een collega" />
        ) : (
          <>
            <span className="clue-icon">{meta.icon}</span>
            <span className="clue-text">{q.clue.type === 'funFact' ? `“${q.clue.value}”` : q.clue.value}</span>
          </>
        )}
      </div>

      {revealed ? (
        <div className={`feedback ${ok ? 'good' : 'bad'}`}>
          {ok ? 'Goed zo! 🎉' : 'Helaas!'} Het is {q.subject.name}
          {q.subject.role ? `, ${q.subject.role}` : ''}
          {q.subject.team ? ` bij ${q.subject.team}` : ''}.
        </div>
      ) : (
        <p className="act-sub">Overleg samen en kies één collega.</p>
      )}

      <div className="tiles tiles-light">
        {q.options.map((p) => {
          const state = !revealed ? '' : p.id === q.subject.id ? 'is-correct' : p.id === picked ? 'is-wrong' : 'is-dim';
          return (
            <button type="button" key={p.id} className={`tile person-tile ${state}`} onClick={() => choose(p.id)} disabled={revealed}>
              <Avatar name={p.name} size={52} />
              <span className="tile-text">
                {p.name}
                {(p.role || p.team) && <small>{p.role || p.team}</small>}
              </span>
              {revealed && p.id === q.subject.id && <span className="tile-mark good">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="act-actions">
        {revealed && <Btn onClick={next}>{last ? 'Bekijk resultaat' : 'Volgende →'}</Btn>}
      </div>
    </div>
  );
}

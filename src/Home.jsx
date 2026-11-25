import { useEffect, useMemo, useRef, useState } from 'react';
import { buildSegments, chooseActivity } from './activities/registry';
import logo from './assets/anwb-logo.png';
import ActivityModal from './components/ActivityModal';
import NameInput from './components/NameInput';
import Wheel from './components/Wheel';
import { useData } from './data/store';
import { recordPlay } from './data/stats';
import { setSoundEnabled, sfx } from './lib/sound';
import { firstName, lc, textOn } from './lib/utils';

export const PLAYER_COLORS = ['#009FE3', '#F39200'];
const EMPTY = { name: '', personId: null };

export default function Home() {
  const { data } = useData();
  const [players, setPlayers] = useState([EMPTY, EMPTY]);
  const [phase, setPhase] = useState('home'); // home | spinning | landed | activity
  const [landed, setLanded] = useState(null); // { category, activity }
  const [nudge, setNudge] = useState(0);
  const wheelRef = useRef(null);
  const lastActive = useRef(Date.now());
  const timers = useRef([]);
  const tryMode = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const segments = useMemo(() => buildSegments(data), [data]);
  const canSpin = players.every((p) => p.name.trim());
  const resolved = useMemo(
    () =>
      players.map((p, i) => {
        const person = data.people.find((x) => x.id === p.personId) || null;
        // linked profiles play under their first name ("Sanne"), unless both players share it
        const other = players[1 - i];
        const short = person ? firstName(person.name) : p.name.trim();
        const clash = lc(short) === lc(other.personId ? firstName(other.name) : other.name);
        return { ...p, name: person && !clash ? short : p.name.trim(), index: i, color: PLAYER_COLORS[i], person };
      }),
    [players, data.people],
  );

  // Admin "Probeer uit": #/try/<activityId> opens that activity straight away with two test players.
  useEffect(() => {
    checkTry();
    window.addEventListener('hashchange', checkTry);
    return () => window.removeEventListener('hashchange', checkTry);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function checkTry() {
    const m = window.location.hash.match(/^#\/try\/(.+)$/);
    if (!m) return;
    const data = dataRef.current;
    const activity = data.activities.find((a) => a.id === decodeURIComponent(m[1]));
    window.history.replaceState(null, '', '#/');
    if (!activity) return;
    const category = data.categories.find((c) => c.id === activity.categoryId) || {
      id: 'test',
      name: 'Test',
      title: '',
      icon: '🧪',
      color: '#003D86',
    };
    tryMode.current = true;
    setPlayers([
      { name: 'Speler 1', personId: null },
      { name: 'Speler 2', personId: null },
    ]);
    wheelRef.current?.clear();
    setLanded({ category, activity });
    setPhase('activity');
  }

  useEffect(() => setSoundEnabled(data.settings.sound), [data.settings.sound]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Kiosk safety net: return to the start screen after a period of inactivity.
  useEffect(() => {
    const mark = () => (lastActive.current = Date.now());
    window.addEventListener('pointerdown', mark);
    window.addEventListener('keydown', mark);
    return () => {
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
    };
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      if (phase === 'spinning' || phase === 'landed') return;
      const busy = phase !== 'home' || players.some((p) => p.name);
      const idle = (Date.now() - lastActive.current) / 1000;
      if (busy && idle > (data.settings.idleSeconds || 240)) resetAll();
    }, 5000);
    return () => clearInterval(id);
  }, [phase, players, data.settings.idleSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  function resetAll() {
    setPhase('home');
    setLanded(null);
    setPlayers([EMPTY, EMPTY]);
    wheelRef.current?.clear();
  }

  function handleBlocked() {
    setNudge((n) => n + 1);
    sfx.wrong();
  }

  function handleResult(segment) {
    const category = segment.category;
    const activity = chooseActivity(data, category.id, resolved);
    setLanded({ category, activity });
    setPhase('landed');
    sfx.land();
    timers.current.push(setTimeout(() => setPhase('activity'), 1700));
  }

  function handleFinish(completed) {
    if (completed && landed?.activity && !tryMode.current) recordPlay(landed.activity.id);
    if (tryMode.current) {
      tryMode.current = false;
      window.location.hash = '#/admin';
    }
    resetAll();
  }

  const busy = phase !== 'home';

  return (
    <div className="home">
      <div className="home-deco" aria-hidden="true" />
      <header className="home-header">
        <img src={logo} alt="ANWB" className="home-logo" />
      </header>

      <main className="home-stage">
        <NameInput
          label="Speler 1"
          value={players[0]}
          onChange={(v) => setPlayers([v, players[1]])}
          people={data.people}
          takenId={players[1].personId}
          color={PLAYER_COLORS[0]}
          disabled={busy}
          shake={nudge}
          key={`p0-${nudge}`}
        />

        <div className="wheel-col">
          <Wheel
            ref={wheelRef}
            segments={segments}
            canSpin={canSpin}
            onBlocked={handleBlocked}
            onSpinStart={() => setPhase('spinning')}
            onResult={handleResult}
          />
          <button
            type="button"
            className={`spin-cta ${canSpin ? '' : 'is-waiting'}`}
            onClick={() => wheelRef.current?.spin()}
            disabled={busy || !segments.length}
          >
            {phase === 'spinning' ? 'Draaien…' : 'Draai aan het rad!'}
          </button>
          <p className={`spin-hint ${nudge ? 'is-nudged' : ''}`} key={nudge}>
            {segments.length === 0
              ? 'Er staan nog geen activiteiten aan. Voeg ze toe via beheer.'
              : canSpin
                ? 'Klaar? Draai aan het rad of tik op het wiel.'
                : 'Vul eerst allebei je naam in'}
          </p>

          {phase === 'landed' && landed && (
            <div className="landed-banner" style={{ '--cat': landed.category.color, '--cat-text': textOn(landed.category.color) }}>
              <span>{landed.category.icon}</span> {landed.category.name}!
            </div>
          )}
        </div>

        <NameInput
          label="Speler 2"
          value={players[1]}
          onChange={(v) => setPlayers([players[0], v])}
          people={data.people}
          takenId={players[0].personId}
          color={PLAYER_COLORS[1]}
          disabled={busy}
          shake={nudge}
          key={`p1-${nudge}`}
        />
      </main>

      <a href="#/admin" className="gear" aria-label="Beheer" title="Beheer">
        ⚙
      </a>

      {phase === 'activity' && landed && (
        <ActivityModal category={landed.category} activity={landed.activity} players={resolved} onFinish={handleFinish} />
      )}
    </div>
  );
}

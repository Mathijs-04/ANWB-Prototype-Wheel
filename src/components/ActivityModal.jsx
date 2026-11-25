import { useState } from 'react';
import { ACTIVITY_TYPES } from '../activities/registry';
import { useData } from '../data/store';
import { textOn } from '../lib/utils';
import CompleteScreen from './CompleteScreen';
import { Avatar, Btn } from './ui';

/** Full-screen-ish pop-up: intro → activity → completed. The close button is deliberately low-key. */
export default function ActivityModal({ category, activity, players, onFinish }) {
  const { data } = useData();
  const [stage, setStage] = useState('intro'); // intro | play | done
  const [result, setResult] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const type = activity ? ACTIVITY_TYPES[activity.type] : null;
  const Component = type?.component;

  function requestClose() {
    if (stage === 'play') setConfirmClose(true);
    else onFinish(stage === 'done');
  }

  return (
    <div className="modal-backdrop">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={activity?.title || category.name}
        style={{ '--cat': category.color, '--cat-text': textOn(category.color) }}
      >
        <header className="modal-head">
          <span className="cat-chip">
            {category.icon} {category.name}
          </span>
          {activity && stage !== 'intro' && <h2>{activity.title}</h2>}
          <div className="modal-players">
            {players.map((p) => (
              <span key={p.index} className="modal-player">
                <Avatar name={p.name} size={34} color={p.color} />
                {p.name}
              </span>
            ))}
          </div>
        </header>
        <button type="button" className="modal-close" onClick={requestClose} aria-label="Activiteit sluiten">
          ×
        </button>

        <div className="modal-body">
          {!activity && (
            <div className="intro">
              <h3>Nog geen activiteit</h3>
              <p className="intro-text">Draai gerust nog een keer!</p>
              <Btn onClick={() => onFinish(false)}>Terug naar het rad</Btn>
            </div>
          )}

          {activity && stage === 'intro' && (
            <div className="intro">
              <h3>{activity.title}</h3>
              {activity.intro && <p className="intro-text">{activity.intro}</p>}
              <Btn variant="yellow" className="btn-xl" onClick={() => setStage('play')}>
                Start!
              </Btn>
            </div>
          )}

          {activity && stage === 'play' && Component && (
            <Component
              activity={activity}
              players={players}
              onComplete={(r) => {
                setResult(r);
                setStage('done');
              }}
            />
          )}

          {stage === 'done' && (
            <CompleteScreen result={result} players={players} seconds={data.settings.autoReturnSeconds || 45} onDone={() => onFinish(true)} />
          )}
        </div>

        {confirmClose && (
          <div className="confirm-layer">
            <div className="confirm-box">
              <h3>Nu al stoppen?</h3>
              <p>Jullie zijn zo lekker bezig!</p>
              <div className="confirm-actions">
                <Btn variant="ghost" onClick={() => onFinish(false)}>
                  Ja, stoppen
                </Btn>
                <Btn onClick={() => setConfirmClose(false)}>Nee, verder spelen</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

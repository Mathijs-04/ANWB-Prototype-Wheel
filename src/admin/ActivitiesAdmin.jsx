import { useState } from 'react';
import { ACTIVITY_TYPES } from '../activities/registry';
import { useData } from '../data/store';
import { uid } from '../lib/utils';
import { EDITORS, cleanActivity } from './ActivityEditors';
import { Field, SaveBar, TextArea, TextField, Toggle, useFlash } from './fields';

export default function ActivitiesAdmin() {
  const { data, update } = useData();
  const [selected, setSelected] = useState(null);
  const [picking, setPicking] = useState(false);
  const activity = data.activities.find((a) => a.id === selected);

  function create(type) {
    const def = ACTIVITY_TYPES[type];
    const a = {
      id: uid('act'),
      type,
      categoryId: data.categories[0]?.id,
      enabled: true,
      title: def.label,
      intro: '',
      ...def.create(),
    };
    update((d) => void d.activities.push(a));
    setPicking(false);
    setSelected(a.id);
  }

  const toggle = (id, enabled) =>
    update((d) => {
      d.activities.find((a) => a.id === id).enabled = enabled;
    });

  const groups = [...data.categories, { id: null, name: 'Zonder categorie', color: '#999', icon: '❔' }]
    .map((c) => ({ c, list: data.activities.filter((a) => (c.id ? a.categoryId === c.id : !data.categories.some((x) => x.id === a.categoryId))) }))
    .filter((g) => g.c.id || g.list.length);

  return (
    <div className="adm-split">
      <aside className="adm-panel adm-list">
        <div className="adm-list-head">
          <b>Activiteiten</b>
          <button type="button" className="abtn" onClick={() => setPicking(true)}>
            + Nieuw
          </button>
        </div>
        {groups.map(({ c, list }) => (
          <div key={c.id ?? 'none'} className="act-group">
            <div className="act-group-head">
              <span className="dot" style={{ background: c.color }} /> {c.icon} {c.name}
            </div>
            <ul>
              {list.map((a) => (
                <li key={a.id} className="act-row">
                  <Toggle checked={a.enabled} onChange={(v) => toggle(a.id, v)} />
                  <button
                    type="button"
                    className={`${a.id === selected && !picking ? 'active' : ''} ${a.enabled ? '' : 'is-off'}`}
                    onClick={() => {
                      setSelected(a.id);
                      setPicking(false);
                    }}
                  >
                    <span>
                      {a.title}
                      <small>
                        {ACTIVITY_TYPES[a.type]?.icon} {ACTIVITY_TYPES[a.type]?.label}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
              {!list.length && <li className="adm-empty">Nog geen activiteiten</li>}
            </ul>
          </div>
        ))}
      </aside>

      <section className="adm-panel">
        {picking ? (
          <>
            <h2 className="adm-title">Kies een type activiteit</h2>
            <div className="type-grid">
              {Object.entries(ACTIVITY_TYPES).map(([id, t]) => (
                <button type="button" key={id} className="type-card" onClick={() => create(id)}>
                  <span className="type-icon">{t.icon}</span>
                  <b>{t.label}</b>
                  <small>{t.description}</small>
                </button>
              ))}
            </div>
            <button type="button" className="abtn secondary" onClick={() => setPicking(false)}>
              Annuleren
            </button>
          </>
        ) : activity ? (
          <ActivityForm key={activity.id} activity={activity} onDeleted={() => setSelected(null)} />
        ) : (
          <p className="adm-empty">
            Kies links een activiteit om te bewerken, of maak een nieuwe. Met de schakelaar zet je een activiteit aan of uit. Het
            rad kiest na het draaien willekeurig een actieve activiteit uit de categorie.
          </p>
        )}
      </section>
    </div>
  );
}

function ActivityForm({ activity, onDeleted }) {
  const { data, update } = useData();
  const [d, setD] = useState(() => structuredClone(activity));
  const [flash, showFlash] = useFlash();
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const Editor = EDITORS[d.type];
  const type = ACTIVITY_TYPES[d.type];

  function save() {
    const clean = cleanActivity(d);
    const ok = update((x) => {
      const i = x.activities.findIndex((a) => a.id === activity.id);
      if (i >= 0) x.activities[i] = clean;
    });
    if (ok) showFlash();
  }

  function remove() {
    if (!confirm(`‘${activity.title}’ verwijderen?`)) return;
    update((x) => void (x.activities = x.activities.filter((a) => a.id !== activity.id)));
    onDeleted();
  }

  return (
    <div className="activity-form">
      <div className="type-badge">
        {type?.icon} {type?.label}
      </div>
      <div className="field-row">
        <TextField label="Titel" value={d.title} onChange={(v) => set('title', v)} />
        <Field label="Categorie">
          <select value={d.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <TextArea label="Introtekst" rows={2} value={d.intro} onChange={(v) => set('intro', v)} />
      <Toggle checked={d.enabled} onChange={(v) => set('enabled', v)} label="Actief (kan op het rad vallen)" />
      <hr />
      {Editor && <Editor d={d} set={set} />}
      <SaveBar onSave={save} flash={flash}>
        <a className="abtn secondary try-btn" href={`#/try/${encodeURIComponent(activity.id)}`} title="Speelt de opgeslagen versie">
          ▶ Probeer uit
        </a>
        <button type="button" className="abtn danger" onClick={remove}>
          Verwijderen
        </button>
      </SaveBar>
    </div>
  );
}

import { useState } from 'react';
import { Avatar } from '../components/ui';
import { useData } from '../data/store';
import { lc, resizeImage, uid } from '../lib/utils';
import { Field, SaveBar, Segmented, TextArea, TextField, useFlash } from './fields';

export default function PeopleAdmin() {
  const { data, update } = useData();
  const [selected, setSelected] = useState(data.people[0]?.id ?? null);
  const [query, setQuery] = useState('');

  const people = [...data.people].sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  const filtered = people.filter((p) => !query || lc(p.name).includes(lc(query)) || lc(p.team).includes(lc(query)));
  const person = data.people.find((p) => p.id === selected);

  function add() {
    const p = { id: uid('p'), name: 'Nieuwe collega', team: '', role: '', project: '', hobbies: [], funFact: '', photo: null, answers: {} };
    update((d) => {
      d.people.push(p);
    });
    setSelected(p.id);
  }

  return (
    <div className="adm-split">
      <aside className="adm-panel adm-list">
        <div className="adm-list-head">
          <input placeholder="Zoeken…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="button" className="abtn" onClick={add}>
            + Nieuw
          </button>
        </div>
        <ul>
          {filtered.map((p) => (
            <li key={p.id}>
              <button type="button" className={p.id === selected ? 'active' : ''} onClick={() => setSelected(p.id)}>
                <Avatar name={p.name} size={34} />
                <span>
                  {p.name}
                  <small>{p.team || '—'}</small>
                </span>
                {p.photo && <span title="Heeft foto">📷</span>}
              </button>
            </li>
          ))}
          {!filtered.length && <li className="adm-empty">Geen collega's gevonden.</li>}
        </ul>
        <p className="adm-help">{data.people.length} collega's. Spelers met een profiel krijgen persoonlijke vragen.</p>
      </aside>

      <section className="adm-panel">
        {person ? (
          <PersonForm key={person.id} person={person} onDeleted={() => setSelected(null)} />
        ) : (
          <p className="adm-empty">Kies links een collega of voeg er een toe.</p>
        )}
      </section>
    </div>
  );
}

function PersonForm({ person, onDeleted }) {
  const { data, update } = useData();
  const [d, setD] = useState(() => ({ ...person, hobbiesText: (person.hobbies || []).join(', ') }));
  const [flash, showFlash] = useFlash();
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));

  function save() {
    const { hobbiesText, ...rest } = d;
    const clean = { ...rest, name: rest.name.trim() || 'Naamloos', hobbies: hobbiesText.split(',').map((s) => s.trim()).filter(Boolean) };
    const ok = update((x) => {
      const i = x.people.findIndex((p) => p.id === person.id);
      if (i >= 0) x.people[i] = clean;
    });
    if (ok) showFlash();
  }

  function remove() {
    if (!confirm(`${person.name} verwijderen?`)) return;
    update((x) => {
      x.people = x.people.filter((p) => p.id !== person.id);
    });
    onDeleted();
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      set('photo', await resizeImage(file, 640, 0.78));
    } catch {
      alert('Deze afbeelding kon niet worden gelezen.');
    }
  }

  return (
    <div className="person-form">
      <div className="person-form-head">
        <Avatar name={d.name} size={56} />
        <h2>{d.name || 'Naamloos'}</h2>
      </div>

      <div className="field-row">
        <TextField label="Naam" value={d.name} onChange={(v) => set('name', v)} />
        <TextField label="Team" value={d.team} onChange={(v) => set('team', v)} />
        <TextField label="Rol" value={d.role} onChange={(v) => set('role', v)} />
      </div>
      <TextField label="Huidig project" hint="Gebruikt in 'Wie werkt waaraan?'" value={d.project} onChange={(v) => set('project', v)} />
      <div className="field-row">
        <TextField
          label="Hobby's"
          hint="Gescheiden door komma's, bijv. zeilen, koken"
          value={d.hobbiesText}
          onChange={(v) => set('hobbiesText', v)}
        />
        <TextArea label="Leuk weetje" rows={2} value={d.funFact} onChange={(v) => set('funFact', v)} />
      </div>

      <Field label="Activiteitfoto" hint="Een foto van een hobby of activiteit (niet van het gezicht). Gebruikt in 'Wie is het?'">
        <div className="photo-field">
          {d.photo ? <img src={d.photo} alt="" /> : <div className="photo-empty">Geen foto</div>}
          <div className="photo-actions">
            <span className="abtn secondary file-btn">
              Foto kiezen
              <input type="file" accept="image/*" onChange={onPhoto} />
            </span>
            {d.photo && (
              <button type="button" className="abtn danger" onClick={() => set('photo', null)}>
                Verwijderen
              </button>
            )}
          </div>
        </div>
      </Field>

      <h3 className="adm-subtitle">Dit of dat?</h3>
      <p className="adm-help">Gebruikt in ‘Hoe goed ken je elkaar?’. Onbekend laten? Dan geeft de speler zelf antwoord.</p>
      <div className="pq-list">
        {data.profileQuestions.map((q) => (
          <div className="pq-row" key={q.id}>
            <Segmented
              value={d.answers?.[q.id] || ''}
              onChange={(v) => {
                const answers = { ...(d.answers || {}) };
                if (v) answers[q.id] = v;
                else delete answers[q.id];
                set('answers', answers);
              }}
              options={[
                { value: 'a', label: `${q.emojiA || ''} ${q.a}` },
                { value: '', label: '?' },
                { value: 'b', label: `${q.emojiB || ''} ${q.b}` },
              ]}
            />
          </div>
        ))}
      </div>

      <SaveBar onSave={save} flash={flash}>
        <button type="button" className="abtn danger" onClick={remove}>
          Verwijderen
        </button>
      </SaveBar>
    </div>
  );
}

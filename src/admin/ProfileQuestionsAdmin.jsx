import { useState } from 'react';
import { useData } from '../data/store';
import { uid } from '../lib/utils';
import { SaveBar, useFlash } from './fields';

export default function ProfileQuestionsAdmin() {
  const { data, update } = useData();
  const [rows, setRows] = useState(() => structuredClone(data.profileQuestions));
  const [flash, showFlash] = useFlash();

  const set = (i, k, v) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));

  function save() {
    const clean = rows.filter((r) => r.a.trim() && r.b.trim());
    if (update((d) => void (d.profileQuestions = clean))) {
      setRows(clean);
      showFlash();
    }
  }

  return (
    <div className="adm-panel">
      <h2 className="adm-title">Dit-of-dat vragen</h2>
      <p className="adm-help">
        Twee opties per vraag. Bij elke collega kun je invullen wat die kiest. In ‘Hoe goed ken je elkaar?’ raden spelers wat de
        ander kiest, bijvoorbeeld: <i>“Jim, wat kiest Thamar liever: wandelen of fietsen?”</i>
      </p>
      <div className="pq-edit-head">
        <span>Emoji</span>
        <span>Optie A</span>
        <span />
        <span>Emoji</span>
        <span>Optie B</span>
        <span />
      </div>
      {rows.map((r, i) => (
        <div className="pq-edit" key={r.id}>
          <input className="emoji-input" value={r.emojiA || ''} onChange={(e) => set(i, 'emojiA', e.target.value)} />
          <input value={r.a} onChange={(e) => set(i, 'a', e.target.value)} placeholder="Wandelen" />
          <span className="pq-of">of</span>
          <input className="emoji-input" value={r.emojiB || ''} onChange={(e) => set(i, 'emojiB', e.target.value)} />
          <input value={r.b} onChange={(e) => set(i, 'b', e.target.value)} placeholder="Fietsen" />
          <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
            🗑
          </button>
        </div>
      ))}
      <button type="button" className="abtn secondary" onClick={() => setRows([...rows, { id: uid('pq'), a: '', emojiA: '', b: '', emojiB: '' }])}>
        + Vraag toevoegen
      </button>
      <SaveBar onSave={save} flash={flash} />
    </div>
  );
}

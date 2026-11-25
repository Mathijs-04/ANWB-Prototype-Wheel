import { useState } from 'react';
import { useData } from '../data/store';
import { PALETTE } from '../data/seed';
import { textOn, uid } from '../lib/utils';
import { SaveBar, Toggle, useFlash } from './fields';

export default function CategoriesAdmin() {
  const { data, update } = useData();
  const [rows, setRows] = useState(() => structuredClone(data.categories));
  const [flash, showFlash] = useFlash();
  const set = (i, k, v) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const activeCount = (id) => data.activities.filter((a) => a.categoryId === id && a.enabled).length;
  const totalCount = (id) => data.activities.filter((a) => a.categoryId === id).length;

  function save() {
    const clean = rows.map((r) => ({ ...r, name: r.name.trim() || 'Categorie' }));
    if (update((d) => void (d.categories = clean))) {
      setRows(clean);
      showFlash();
    }
  }

  function remove(i) {
    const c = rows[i];
    if (totalCount(c.id) > 0) {
      alert('Deze categorie heeft nog activiteiten. Verplaats of verwijder die eerst.');
      return;
    }
    setRows(rows.filter((_, j) => j !== i));
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const r = [...rows];
    [r[i], r[j]] = [r[j], r[i]];
    setRows(r);
  }

  return (
    <div className="adm-panel">
      <h2 className="adm-title">Categorieën</h2>
      <p className="adm-help">
        Elke categorie is een kleur op het rad. De korte naam staat op het rad (houd die kort, max. ~13 tekens). Alleen actieve
        categorieën met minstens één actieve activiteit komen op het rad.
      </p>

      <div className="cat-list">
        {rows.map((r, i) => (
          <div className="cat-card" key={r.id}>
            <div className="cat-preview" style={{ background: r.color, color: textOn(r.color) }}>
              <span>{r.icon}</span>
              <b>{r.name || '…'}</b>
            </div>
            <div className="cat-fields">
              <div className="cat-line">
                <input className="emoji-input" value={r.icon} onChange={(e) => set(i, 'icon', e.target.value)} aria-label="Emoji" />
                <input value={r.name} maxLength={16} onChange={(e) => set(i, 'name', e.target.value)} placeholder="Korte naam (op het rad)" />
                <Toggle checked={r.enabled} onChange={(v) => set(i, 'enabled', v)} label="Actief" />
              </div>
              <input value={r.title} onChange={(e) => set(i, 'title', e.target.value)} placeholder="Volledige omschrijving, bijv. Ontdek wie…" />
              <div className="cat-line">
                <div className="swatches">
                  {PALETTE.map((p) => (
                    <button
                      type="button"
                      key={p.value}
                      title={p.name}
                      className={`swatch ${r.color === p.value ? 'on' : ''}`}
                      style={{ background: p.value }}
                      onClick={() => set(i, 'color', p.value)}
                    />
                  ))}
                  <input type="color" value={r.color} onChange={(e) => set(i, 'color', e.target.value)} aria-label="Eigen kleur" />
                </div>
                <span className="adm-help">
                  {activeCount(r.id)} actieve activiteit{activeCount(r.id) === 1 ? '' : 'en'}
                  {r.enabled && activeCount(r.id) === 0 && ' · staat niet op het rad'}
                </span>
                <span className="cat-tools">
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Omhoog">
                    ↑
                  </button>
                  <button type="button" className="icon-btn" onClick={() => move(i, 1)} aria-label="Omlaag">
                    ↓
                  </button>
                  <button type="button" className="icon-btn" onClick={() => remove(i)} aria-label="Verwijderen">
                    🗑
                  </button>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="abtn secondary"
        onClick={() => setRows([...rows, { id: uid('cat'), name: 'Nieuw', title: '', icon: '⭐', color: '#0069B4', enabled: true }])}
      >
        + Categorie toevoegen
      </button>
      <SaveBar onSave={save} flash={flash} />
    </div>
  );
}

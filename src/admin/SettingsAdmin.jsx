import { useRef } from 'react';
import { useData, SEED_VERSION } from '../data/store';
import { getStats, resetStats } from '../data/stats';
import { NumberField, Toggle } from './fields';

export default function SettingsAdmin() {
  const { data, update, replace, reset } = useData();
  const fileRef = useRef(null);
  const stats = getStats();
  const sizeKb = Math.round(JSON.stringify(data).length / 1024);

  const setSetting = (k, v) => update((d) => void (d.settings[k] = v));

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draai-en-verbind-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || !Array.isArray(parsed.activities) || !Array.isArray(parsed.categories) || !Array.isArray(parsed.people)) {
        throw new Error('format');
      }
      if (!confirm('Alle huidige gegevens vervangen door dit bestand?')) return;
      replace({ ...parsed, version: SEED_VERSION, settings: { ...data.settings, ...parsed.settings }, profileQuestions: parsed.profileQuestions || [] });
      alert('Gegevens geïmporteerd ✓');
    } catch {
      alert('Dit bestand kon niet worden geïmporteerd. Is het een export van deze app?');
    }
  }

  return (
    <div className="settings-grid">
      <div className="adm-panel">
        <h2 className="adm-title">Instellingen</h2>
        <Toggle checked={data.settings.sound} onChange={(v) => setSetting('sound', v)} label="Geluidseffecten" />
        <div className="field-row" style={{ marginTop: '1rem' }}>
          <NumberField
            label="Terug naar start bij inactiviteit (seconden)"
            hint="Als niemand het scherm aanraakt"
            value={data.settings.idleSeconds}
            min={30}
            max={3600}
            onChange={(v) => setSetting('idleSeconds', Number(v) || 240)}
          />
          <NumberField
            label="Automatisch terug na ‘voltooid’ (seconden)"
            value={data.settings.autoReturnSeconds}
            min={5}
            max={600}
            onChange={(v) => setSetting('autoReturnSeconds', Number(v) || 45)}
          />
        </div>
      </div>

      <div className="adm-panel">
        <h2 className="adm-title">Data</h2>
        <p className="adm-help">
          Alles wordt alleen in deze browser bewaard (localStorage, nu ±{sizeKb} KB). Gebruik export/import om gegevens naar een
          ander apparaat over te zetten of als back-up.
        </p>
        <div className="btn-row">
          <button type="button" className="abtn" onClick={exportData}>
            ⬇ Exporteren (JSON)
          </button>
          <button type="button" className="abtn secondary" onClick={() => fileRef.current?.click()}>
            ⬆ Importeren
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />
        </div>
        <hr />
        <p className="adm-help">
          Gespeeld: <b>{stats.plays}</b> activiteiten
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="abtn danger"
            onClick={() => confirm('Alle content terugzetten naar de voorbeelddata? Je eigen wijzigingen gaan verloren.') && reset()}
          >
            Voorbeelddata herstellen
          </button>
          <button
            type="button"
            className="abtn danger"
            onClick={() => {
              if (confirm('Speelstatistieken wissen?')) {
                resetStats();
                alert('Statistieken gewist.');
              }
            }}
          >
            Statistieken wissen
          </button>
        </div>
      </div>
    </div>
  );
}

import { CLUE_TYPES } from '../activities/WhoIsIt';
import { Field, LinesField, NumberField, TextField, Toggle } from './fields';

/** Type-specific settings. Each editor gets the draft activity `d` and `set(key, value)`. */

function QuizEditor({ d, set }) {
  const questions = d.questions || [];
  const setQ = (i, patch) => set('questions', questions.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const add = (kind) =>
    set('questions', [
      ...questions,
      kind === 'number' ? { kind, q: '', answer: 0, unit: '', info: '' } : { kind, q: '', options: ['', '', '', ''], answer: 0, info: '' },
    ]);

  return (
    <>
      <NumberField label="Aantal vragen per spel" hint="Willekeurig gekozen uit de lijst hieronder" value={d.count} min={1} max={20} onChange={(v) => set('count', v)} />
      <h3 className="adm-subtitle">Vragen ({questions.length})</h3>
      {questions.map((q, i) => (
        <div className="q-card" key={i}>
          <div className="q-card-head">
            <b>
              {i + 1}. {q.kind === 'number' ? 'Schatvraag' : 'Meerkeuze'}
            </b>
            <button type="button" className="icon-btn" aria-label="Vraag verwijderen" onClick={() => set('questions', questions.filter((_, j) => j !== i))}>
              🗑
            </button>
          </div>
          <TextField label="Vraag" value={q.q} onChange={(v) => setQ(i, { q: v })} />
          {q.kind === 'number' ? (
            <div className="field-row">
              <NumberField label="Juiste antwoord" value={q.answer} min={-1e12} max={1e12} onChange={(v) => setQ(i, { answer: v })} />
              <TextField label="Eenheid (optioneel)" value={q.unit} onChange={(v) => setQ(i, { unit: v })} />
            </div>
          ) : (
            <Field label="Antwoorden (kies het juiste)">
              <div className="option-list">
                {(q.options || []).map((o, k) => (
                  <div className="option-row" key={k}>
                    <input type="radio" name={`ans-${i}`} checked={q.answer === k} onChange={() => setQ(i, { answer: k })} aria-label="Juiste antwoord" />
                    <span className="option-letter">{'ABCD'[k]}</span>
                    <input value={o} onChange={(e) => setQ(i, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })} />
                  </div>
                ))}
              </div>
            </Field>
          )}
          <TextField label="Weetje na het antwoord (optioneel)" value={q.info} onChange={(v) => setQ(i, { info: v })} />
        </div>
      ))}
      <div className="btn-row">
        <button type="button" className="abtn secondary" onClick={() => add('choice')}>
          + Meerkeuzevraag
        </button>
        <button type="button" className="abtn secondary" onClick={() => add('number')}>
          + Schatvraag
        </button>
      </div>
    </>
  );
}

function DilemmaEditor({ d, set }) {
  const items = d.items || [];
  const setItem = (i, k, v) => set('items', items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  return (
    <>
      <NumberField label="Aantal dilemma's per spel" value={d.count} min={1} max={20} onChange={(v) => set('count', v)} />
      <h3 className="adm-subtitle">Dilemma's / stellingen ({items.length})</h3>
      <p className="adm-help">Laat ‘Vraag’ leeg voor “Wat kies jij liever?”. Voor een stelling: zet de stelling bij Vraag en gebruik Eens / Oneens.</p>
      {items.map((it, i) => (
        <div className="q-card" key={i}>
          <div className="q-card-head">
            <b>{i + 1}.</b>
            <button type="button" className="icon-btn" aria-label="Verwijderen" onClick={() => set('items', items.filter((_, j) => j !== i))}>
              🗑
            </button>
          </div>
          <TextField label="Vraag / stelling (optioneel)" value={it.q} placeholder="Wat kies jij liever?" onChange={(v) => setItem(i, 'q', v)} />
          <div className="dilemma-row">
            <input className="emoji-input" value={it.emojiA || ''} onChange={(e) => setItem(i, 'emojiA', e.target.value)} aria-label="Emoji A" />
            <input value={it.a} onChange={(e) => setItem(i, 'a', e.target.value)} placeholder="Optie A" />
            <span className="pq-of">of</span>
            <input className="emoji-input" value={it.emojiB || ''} onChange={(e) => setItem(i, 'emojiB', e.target.value)} aria-label="Emoji B" />
            <input value={it.b} onChange={(e) => setItem(i, 'b', e.target.value)} placeholder="Optie B" />
          </div>
        </div>
      ))}
      <div className="btn-row">
        <button type="button" className="abtn secondary" onClick={() => set('items', [...items, { q: '', a: '', b: '', emojiA: '', emojiB: '' }])}>
          + Dilemma
        </button>
        <button
          type="button"
          className="abtn secondary"
          onClick={() => set('items', [...items, { q: '', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' }])}
        >
          + Stelling
        </button>
      </div>
    </>
  );
}

function ConversationEditor({ d, set }) {
  return (
    <>
      <div className="field-row">
        <NumberField label="Aantal vragen per spel" value={d.count} min={1} max={20} onChange={(v) => set('count', v)} />
        <NumberField label="Timer per vraag (seconden)" hint="0 = geen timer" value={d.timer} min={0} max={600} onChange={(v) => set('timer', v)} />
      </div>
      <Toggle checked={d.random !== false} onChange={(v) => set('random', v)} label="Willekeurige volgorde (en ‘Andere vraag’-knop)" />
      <LinesField
        label="Gespreksvragen (één per regel)"
        hint="Gebruik {A} en {B} voor de namen van de spelers, bijv. “{A}, vertel {B} over…”"
        value={d.cards}
        rows={10}
        onChange={(v) => set('cards', v)}
      />
    </>
  );
}

function GuessEditor({ d, set }) {
  return (
    <>
      <NumberField label="Aantal rondes" hint="Spelers wisselen elke ronde. Even getal is eerlijk." value={d.rounds} min={2} max={12} onChange={(v) => set('rounds', v)} />
      <p className="adm-help">
        Deze activiteit gebruikt de <b>Dit-of-dat</b> vragen en de <b>hobby’s</b> uit de profielen. Staat een antwoord niet in het
        profiel (of speelt iemand zonder profiel)? Dan geeft de speler zelf het echte antwoord.
      </p>
    </>
  );
}

function WhoIsItEditor({ d, set }) {
  const types = d.clueTypes || [];
  return (
    <>
      <NumberField label="Aantal vragen per spel" value={d.count} min={1} max={15} onChange={(v) => set('count', v)} />
      <Field label="Soorten hints">
        <div className="check-list">
          {Object.entries(CLUE_TYPES).map(([id, t]) => (
            <Toggle
              key={id}
              checked={types.includes(id)}
              label={`${t.icon} ${t.label}`}
              onChange={(on) => set('clueTypes', on ? [...types, id] : types.filter((x) => x !== id))}
            />
          ))}
        </div>
      </Field>
      <p className="adm-help">Hints komen uit de profielen van collega’s die niet zelf aan het spelen zijn. Er zijn minimaal 3 collega’s met hints nodig.</p>
    </>
  );
}

function DescribeEditor({ d, set }) {
  return (
    <>
      <div className="field-row">
        <NumberField label="Aantal rondes" hint="Spelers wisselen per ronde" value={d.rounds} min={1} max={6} onChange={(v) => set('rounds', v)} />
        <NumberField label="Seconden per ronde" value={d.seconds} min={15} max={300} onChange={(v) => set('seconds', v)} />
      </div>
      <LinesField label="Woorden (één per regel)" value={d.words} rows={12} onChange={(v) => set('words', v)} />
    </>
  );
}

function MemoryEditor({ d, set }) {
  return (
    <>
      <div className="field-row">
        <NumberField label="Aantal paren" hint="4 t/m 10" value={d.pairs} min={2} max={10} onChange={(v) => set('pairs', v)} />
        <NumberField label="Doel: maximaal aantal beurten" value={d.targetMoves} min={2} max={60} onChange={(v) => set('targetMoves', v)} />
      </div>
      <LinesField label="Kaarten (emoji + naam, één per regel)" hint="Bijv. “🚗 Auto”. Er worden willekeurig paren uit gekozen." value={d.icons} rows={10} onChange={(v) => set('icons', v)} />
    </>
  );
}

function SyncEditor({ d, set }) {
  return (
    <>
      <NumberField label="Aantal rondes" value={d.count} min={1} max={15} onChange={(v) => set('count', v)} />
      <LinesField label="Opdrachten (één per regel)" hint="Bijv. “Een automerk”" value={d.prompts} rows={10} onChange={(v) => set('prompts', v)} />
    </>
  );
}

export const EDITORS = {
  quiz: QuizEditor,
  dilemma: DilemmaEditor,
  conversation: ConversationEditor,
  guess: GuessEditor,
  whoisit: WhoIsItEditor,
  describe: DescribeEditor,
  memory: MemoryEditor,
  sync: SyncEditor,
};

/** Drops empty lines / incomplete rows before saving. */
export function cleanActivity(a) {
  const out = { ...a, title: a.title.trim() || 'Naamloze activiteit' };
  for (const key of ['cards', 'words', 'icons', 'prompts']) if (Array.isArray(out[key])) out[key] = out[key].map((s) => s.trim()).filter(Boolean);
  if (out.items) out.items = out.items.filter((it) => it.a?.trim() && it.b?.trim());
  if (out.questions)
    out.questions = out.questions
      .filter((q) => q.q?.trim())
      .map((q) => {
        if (q.kind === 'number') return { ...q, answer: Number(q.answer) || 0 };
        // drop empty options but keep pointing at the same correct answer
        const kept = (q.options || []).map((o, k) => ({ o: o.trim(), k })).filter((x) => x.o);
        const answer = kept.findIndex((x) => x.k === q.answer);
        return { ...q, options: kept.map((x) => x.o), answer: answer < 0 ? 0 : answer };
      })
      .filter((q) => q.kind === 'number' || q.options.length >= 2);
  return out;
}

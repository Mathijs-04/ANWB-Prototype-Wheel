import { useEffect, useRef, useState } from 'react';

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function TextField({ label, hint, value, onChange, ...rest }) {
  return (
    <Field label={label} hint={hint}>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 3 }) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function NumberField({ label, hint, value, onChange, min = 0, max = 999 }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </Field>
  );
}

/** One item per line. Keeps raw text while typing; empty lines are dropped on save. */
export function LinesField({ label, hint, value, onChange, rows = 8 }) {
  const [text, setText] = useState(() => (value || []).join('\n'));
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={rows}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split('\n'));
        }}
      />
    </Field>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true" />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Segmented({ value, options, onChange }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button type="button" key={o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Small "Opgeslagen ✓" flash next to save buttons. */
export function useFlash() {
  const [msg, setMsg] = useState('');
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  return [
    msg,
    (m = 'Opgeslagen ✓') => {
      setMsg(m);
      clearTimeout(t.current);
      t.current = setTimeout(() => setMsg(''), 2200);
    },
  ];
}

export function SaveBar({ onSave, flash, children }) {
  return (
    <div className="save-bar">
      <button type="button" className="abtn" onClick={onSave}>
        Opslaan
      </button>
      {flash && <span className="flash">{flash}</span>}
      <span className="save-bar-spacer" />
      {children}
    </div>
  );
}

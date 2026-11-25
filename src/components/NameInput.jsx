import { useRef, useState } from 'react';
import { lc } from '../lib/utils';
import { Avatar } from './ui';

/**
 * Name field that suggests colleague profiles. value = { name, personId }.
 * Picking a profile links it (personalized questions); typing a new name works too.
 */
export default function NameInput({ label, value, onChange, people, takenId, color, disabled, shake }) {
  const [focus, setFocus] = useState(false);
  const inputRef = useRef(null);
  const q = lc(value.name);

  const available = people.filter((p) => p.id !== takenId);
  const exact = value.personId && available.some((p) => p.id === value.personId && lc(p.name) === q);
  const suggestions = exact ? [] : available.filter((p) => !q || lc(p.name).includes(q)).slice(0, 5);

  function setText(text) {
    const match = available.find((p) => lc(p.name) === lc(text));
    onChange({ name: text, personId: match ? match.id : null });
  }

  function choose(person) {
    onChange({ name: person.name, personId: person.id });
    setFocus(false);
    inputRef.current?.blur();
  }

  const filled = value.name.trim().length > 0;

  return (
    <div className={`name-card ${filled ? 'is-filled' : ''} ${shake && !filled ? 'shake' : ''}`} style={{ '--pc': color }}>
      <div className="name-label">{label}</div>
      <div className="name-field">
        <Avatar name={filled ? value.name : '?'} size={58} color={filled ? color : '#C9D3E0'} />
        <input
          ref={inputRef}
          value={value.name}
          placeholder="Typ je naam"
          maxLength={32}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (q && !value.personId && suggestions.length === 1) choose(suggestions[0]);
              e.currentTarget.blur();
            }
          }}
        />
        {filled && !disabled && (
          <button
            type="button"
            className="name-clear"
            aria-label="Naam wissen"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange({ name: '', personId: null })}
          >
            ×
          </button>
        )}
      </div>
      <div className="name-hint">
        {value.personId ? '✓ Profiel gevonden: persoonlijke vragen aan' : filled ? 'Geen profiel? Geen probleem!' : 'Kies of typ je naam'}
      </div>
      {focus && !disabled && suggestions.length > 0 && (
        <ul className="name-suggest">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(p)}>
                <Avatar name={p.name} size={38} />
                <span>
                  <b>{p.name}</b>
                  <small>{p.role || p.team}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

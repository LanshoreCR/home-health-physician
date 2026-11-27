import { useId, useMemo, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import type { SelectOption } from './Select';

/** Más de esto se vuelve un scroll inútil: se pide seguir escribiendo. */
const MAX_VISIBLE = 100;

interface ComboboxProps {
  name?: string;
  /** Selected option value ('' when nothing is selected). */
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

/**
 * Combobox — searchable single-choice dropdown styled to match Input.
 * Typing filters the options by label (case-insensitive, every word must
 * match); only a listed option can be picked, and × clears the value.
 */
export function Combobox({
  name, value, options, onChange, onBlur, ref,
  placeholder = 'Type to search…', invalid = false, disabled = false,
}: ComboboxProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [focus, setFocus] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const selected = options.find((option) => option.value === value);
  const matches = useMemo(() => filterOptions(options, query), [options, query]);
  const visible = matches.slice(0, MAX_VISIBLE);

  const borderColor = invalid
    ? 'var(--danger-600)'
    : focus ? 'var(--blue-500)' : 'var(--border-field)';

  function openWith(nextQuery: string) {
    setQuery(nextQuery);
    setActive(0);
    setOpen(true);
  }

  function pick(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  }

  function moveActive(delta: number) {
    if (!open) return openWith('');
    const next = Math.max(0, Math.min(visible.length - 1, active + delta));
    setActive(next);
    listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
    else if (e.key === 'Enter' && open) {
      e.preventDefault();
      if (visible[active]) pick(visible[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
      setQuery('');
    }
  }

  // Cerrado muestra el label elegido; abierto, lo que el usuario va escribiendo.
  const shown = open ? query : selected?.label ?? value;

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={ref}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && visible[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={shown}
        placeholder={placeholder}
        disabled={disabled}
        title={selected?.label}
        onChange={(e) => openWith(e.target.value)}
        onClick={() => { if (!open) openWith(''); }}
        onKeyDown={onKeyDown}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          setOpen(false);
          setQuery('');
          onBlur?.();
        }}
        style={{
          width: '100%', height: 'var(--input-h)', boxSizing: 'border-box',
          padding: value && !disabled ? '0 36px 0 12px' : '0 12px',
          background: disabled ? 'var(--surface-subtle)' : 'var(--surface-card)',
          border: `${focus || invalid ? 'var(--border-width-focus)' : 'var(--border-width)'} solid ${borderColor}`,
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-heading)',
          textOverflow: 'ellipsis',
          outline: 'none',
          boxShadow: focus && !invalid ? 'var(--ring-focus)' : 'none',
          transition: 'box-shadow .12s ease, border-color .12s ease',
        }}
      />
      {value && !disabled && (
        <button
          type="button"
          aria-label="Clear"
          tabIndex={-1}
          // mousedown y no click: así el input no pierde el foco antes de limpiar.
          onMouseDown={(e) => { e.preventDefault(); onChange(''); setQuery(''); }}
          style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            width: '24px', height: '24px', padding: 0, border: 'none', background: 'none',
            color: 'var(--slate-400)', cursor: 'pointer', fontSize: '18px', lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          style={{
            // Puede ser más ancha que el input: en una columna angosta los labels largos se partían en 5 líneas.
            position: 'absolute', zIndex: 20, top: 'calc(100% + 4px)', left: 0,
            minWidth: '100%', width: 'max-content', maxWidth: 'min(560px, 90vw)', boxSizing: 'border-box',
            maxHeight: '280px', overflowY: 'auto', margin: 0, padding: '4px 0', listStyle: 'none',
            background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-card)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-pop)',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
          }}
        >
          {visible.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(e) => { e.preventDefault(); pick(option); }}
              onMouseEnter={() => setActive(index)}
              style={{
                padding: '7px 12px', cursor: 'pointer',
                background: index === active ? 'var(--blue-50)' : 'transparent',
                color: 'var(--text-heading)',
                fontWeight: option.value === value ? 600 : 400,
              }}
            >
              {option.label}
            </li>
          ))}
          {visible.length === 0 && <ListNote text="No matches" />}
          {matches.length > visible.length && (
            <ListNote text={`${matches.length - visible.length} more — keep typing to narrow the list`} />
          )}
        </ul>
      )}
    </div>
  );
}

function ListNote({ text }: { text: string }) {
  return (
    <li role="presentation" style={{ padding: '7px 12px', color: 'var(--text-faint)', fontSize: 'var(--fs-small)' }}>
      {text}
    </li>
  );
}

/** Cada palabra tiene que aparecer en el label, en cualquier orden: "207 family" encuentra 207Q00000X. */
function filterOptions(options: SelectOption[], query: string): SelectOption[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return options;
  return options.filter((option) => {
    const label = option.label.toLowerCase();
    return words.every((word) => label.includes(word));
  });
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { getUsers } from '../api/auth';
import styles from './UserAutocomplete.module.css';

interface UserAutocompleteSingleProps {
  value: string;
  onChange: (value: string) => void;
  multi?: false;
  placeholder?: string;
  showPublicOption?: boolean;
  exclude?: string[];
  id?: string;
}

interface UserAutocompleteMultiProps {
  value: string[];
  onChange: (value: string[]) => void;
  multi: true;
  placeholder?: string;
  showPublicOption?: boolean;
  exclude?: string[];
  id?: string;
}

type UserAutocompleteProps = UserAutocompleteSingleProps | UserAutocompleteMultiProps;

export function UserAutocomplete(props: UserAutocompleteProps) {
  const {
    placeholder = 'Search username…',
    showPublicOption = false,
    exclude = [],
    id,
  } = props;

  const isMulti = props.multi === true;

  const [users, setUsers] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => {});
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Build exclusion set: explicit excludes + already-selected in multi mode
  const selectedMulti = isMulti ? (props.value as string[]) : [];
  const allExcluded = isMulti
    ? [...exclude, ...selectedMulti]
    : exclude;
  const excludeSet = new Set(allExcluded.map((e) => e.toLowerCase()));

  const filtered = users.filter((u) =>
    u.toLowerCase().includes(filter.toLowerCase()) && !excludeSet.has(u.toLowerCase()),
  );

  // Visible options for keyboard navigation (public option counts as index 0 if shown)
  const hasPublicOption = showPublicOption && !excludeSet.has('*');
  const visibleOptions: string[] = [];
  if (hasPublicOption) visibleOptions.push('*');
  visibleOptions.push(...filtered.slice(0, 50));

  const handleSelect = (username: string) => {
    if (isMulti) {
      const current = props.value as string[];
      if (!current.includes(username)) {
        (props.onChange as (v: string[]) => void)([...current, username]);
      }
    } else {
      (props.onChange as (v: string) => void)(username);
    }
    setFilter('');
    setHighlightIndex(-1);
    if (!isMulti) {
      setOpen(false);
    } else {
      // Keep focus in the input for adding more
      inputRef.current?.focus();
    }
  };

  const removeTag = (username: string) => {
    if (!isMulti) return;
    const current = props.value as string[];
    (props.onChange as (v: string[]) => void)(current.filter((u) => u !== username));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlightIndex((prev) => Math.min(prev + 1, visibleOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if ((e.key === 'Enter' || e.key === 'Tab') && open && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(visibleOptions[highlightIndex]);
    } else if (e.key === 'Backspace' && !filter && isMulti && selectedMulti.length > 0) {
      // Remove last tag on backspace with empty input
      removeTag(selectedMulti[selectedMulti.length - 1]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [filter]);

  // Single-select mode with a value selected: show the selected chip
  if (!isMulti && props.value) {
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        <div className={styles.selected}>
          <span className={styles.selectedName}>
            {props.value === '*' ? '✱ All Users (Public)' : props.value}
          </span>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => (props.onChange as (v: string) => void)('')}
            aria-label="Clear selection"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div
        className={isMulti && selectedMulti.length > 0 ? styles.multiInput : undefined}
        onClick={() => inputRef.current?.focus()}
      >
        {isMulti && selectedMulti.map((username) => (
          <span key={username} className={styles.tag}>
            <span>{username}</span>
            <button
              type="button"
              className={styles.tagRemove}
              onClick={(e) => { e.stopPropagation(); removeTag(username); }}
              aria-label={`Remove ${username}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isMulti && selectedMulti.length > 0 ? '' : placeholder}
          autoComplete="off"
          className={isMulti && selectedMulti.length > 0 ? styles.tagInput : undefined}
        />
      </div>
      {open && (
        <div className={styles.dropdown}>
          {hasPublicOption && (
            <button
              type="button"
              className={`${styles.option} ${highlightIndex === 0 ? styles.optionHighlight : ''}`}
              onClick={() => handleSelect('*')}
            >
              <span className={styles.publicLabel}>✱ All Users (Public)</span>
            </button>
          )}
          {filtered.length === 0 && !hasPublicOption && (
            <div className={styles.empty}>No users found</div>
          )}
          {filtered.slice(0, 50).map((u) => {
            const idx = visibleOptions.indexOf(u);
            return (
              <button
                key={u}
                type="button"
                className={`${styles.option} ${idx === highlightIndex ? styles.optionHighlight : ''}`}
                onClick={() => handleSelect(u)}
              >
                {u}
              </button>
            );
          })}
          {filtered.length > 50 && (
            <div className={styles.empty}>
              {filtered.length - 50} more — refine your search
            </div>
          )}
        </div>
      )}
    </div>
  );
}

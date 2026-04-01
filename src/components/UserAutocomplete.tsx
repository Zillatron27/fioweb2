import { useState, useEffect, useRef, useCallback } from 'react';
import { getUsers } from '../api/auth';
import styles from './UserAutocomplete.module.css';

interface UserAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showPublicOption?: boolean;
  id?: string;
}

export function UserAutocomplete({
  value,
  onChange,
  placeholder = 'Search username\u2026',
  showPublicOption = false,
  id,
}: UserAutocompleteProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const filtered = users.filter((u) =>
    u.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleSelect = (username: string) => {
    onChange(username);
    setFilter('');
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {value ? (
        <div className={styles.selected}>
          <span className={styles.selectedName}>
            {value === '*' ? '\u2731 All Users (Public)' : value}
          </span>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onChange('')}
            aria-label="Clear selection"
          >
            \u00d7
          </button>
        </div>
      ) : (
        <>
          <input
            id={id}
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
          />
          {open && (
            <div className={styles.dropdown}>
              {showPublicOption && (
                <button
                  type="button"
                  className={styles.option}
                  onClick={() => handleSelect('*')}
                >
                  <span className={styles.publicLabel}>\u2731 All Users (Public)</span>
                </button>
              )}
              {filtered.length === 0 && !showPublicOption && (
                <div className={styles.empty}>No users found</div>
              )}
              {filtered.slice(0, 50).map((u) => (
                <button
                  key={u}
                  type="button"
                  className={styles.option}
                  onClick={() => handleSelect(u)}
                >
                  {u}
                </button>
              ))}
              {filtered.length > 50 && (
                <div className={styles.empty}>
                  {filtered.length - 50} more — refine your search
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { setAnonymousDataCollection, resetGameData, deleteAccount } from '../api/auth';
import { ApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import styles from './AccountSettings.module.css';

const RESET_CATEGORIES = [
  { key: 'company', label: 'Company' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'cxos', label: 'CX Orders' },
  { key: 'experts', label: 'Experts' },
  { key: 'flights', label: 'Flights' },
  { key: 'production_lines', label: 'Production Lines' },
  { key: 'ships', label: 'Ships' },
  { key: 'sites', label: 'Sites' },
  { key: 'storages', label: 'Storages' },
  { key: 'workforces', label: 'Workforces' },
] as const;

type DeleteState = 'idle' | 'confirming' | 'entering-password';

export function AccountSettings() {
  const { logout } = useAuth();

  // Anonymous data collection
  const [anonAllow, setAnonAllow] = useState<boolean | null>(null);
  const [anonSaving, setAnonSaving] = useState(false);
  const [anonMessage, setAnonMessage] = useState<string | null>(null);

  // Reset game data
  const [resetChecks, setResetChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(RESET_CATEGORIES.map((c) => [c.key, true])),
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Delete account
  const [deleteState, setDeleteState] = useState<DeleteState>('idle');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleAnonSave = async () => {
    if (anonAllow === null) return;
    setAnonSaving(true);
    setAnonMessage(null);
    try {
      await setAnonymousDataCollection(anonAllow);
      setAnonMessage('Preference saved.');
    } catch (err) {
      setAnonMessage(err instanceof ApiError ? err.message : 'Failed to save preference.');
    } finally {
      setAnonSaving(false);
    }
  };

  const toggleResetCheck = (key: string) => {
    setResetChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllReset = (value: boolean) => {
    setResetChecks(Object.fromEntries(RESET_CATEGORIES.map((c) => [c.key, value])));
  };

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    setResetLoading(true);
    setResetMessage(null);
    try {
      await resetGameData(resetChecks);
      setResetMessage('Game data has been reset.');
    } catch (err) {
      setResetMessage(err instanceof ApiError ? err.message : 'Failed to reset game data.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteConfirm = (password?: string) => {
    if (deleteState === 'confirming') {
      setDeleteState('entering-password');
      return;
    }
    if (deleteState === 'entering-password' && password) {
      setDeleteError(null);
      deleteAccount(password)
        .then(() => {
          logout();
        })
        .catch((err) => {
          setDeleteError(err instanceof ApiError
            ? (err.status === 401 ? 'Incorrect password.' : err.message)
            : 'Failed to delete account.');
          setDeleteState('idle');
        });
    }
  };

  const anyResetChecked = Object.values(resetChecks).some(Boolean);

  return (
    <div>
      <h1 className={styles.heading}>Account Settings</h1>

      {/* Anonymous Data Collection */}
      <section className={`card ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Anonymous Data Collection</h2>
        <p className={styles.hint}>
          Control whether your data is included in anonymous data collection by FIO.
        </p>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="anon"
              checked={anonAllow === true}
              onChange={() => setAnonAllow(true)}
            />
            <span>Allow anonymous data collection</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="anon"
              checked={anonAllow === false}
              onChange={() => setAnonAllow(false)}
            />
            <span>Disallow anonymous data collection</span>
          </label>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAnonSave}
            disabled={anonAllow === null || anonSaving}
          >
            {anonSaving ? 'Saving…' : 'Save Preference'}
          </button>
        </div>
        {anonMessage && (
          <p className={styles.feedback}>{anonMessage}</p>
        )}
      </section>

      {/* Reset Game Data */}
      <section className={`card ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Reset Game Data</h2>
        <p className={styles.hint}>
          Selectively reset your stored game data. This is useful after a bad data
          hydration, COLIQ, or to start fresh. Selected categories will be permanently deleted.
        </p>
        <div className={styles.bulkActions}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => selectAllReset(true)}>
            Select All
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => selectAllReset(false)}>
            Deselect All
          </button>
        </div>
        <div className={styles.checkboxGrid}>
          {RESET_CATEGORIES.map((cat) => (
            <label key={cat.key} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={resetChecks[cat.key]}
                onChange={() => toggleResetCheck(cat.key)}
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowResetConfirm(true)}
            disabled={!anyResetChecked || resetLoading}
          >
            {resetLoading ? 'Resetting…' : 'Reset Data'}
          </button>
        </div>
        {resetMessage && (
          <p className={styles.feedback}>{resetMessage}</p>
        )}
      </section>

      {/* Delete Account */}
      <section className={`card ${styles.section} ${styles.dangerZone}`}>
        <h2 className={styles.sectionTitle}>Delete Account</h2>
        <p className={styles.hint}>
          Permanently delete your FIO account and all associated data.
          This action cannot be undone.
        </p>
        {deleteError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>{deleteError}</div>
        )}
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => { setDeleteError(null); setDeleteState('confirming'); }}
        >
          Delete Account
        </button>
      </section>

      {/* Reset confirmation */}
      <ConfirmDialog
        open={showResetConfirm}
        title="Reset Game Data"
        message={`This will permanently delete ${Object.values(resetChecks).filter(Boolean).length} categories of game data. This cannot be undone.`}
        confirmLabel="Reset Data"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        destructive
      />

      {/* Delete account — two-step confirmation */}
      <ConfirmDialog
        open={deleteState === 'confirming'}
        title="Delete Account"
        message="Are you sure you want to permanently delete your FIO account? This cannot be undone."
        confirmLabel="Continue"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteState('idle')}
        destructive
      />
      <ConfirmDialog
        open={deleteState === 'entering-password'}
        title="Confirm Deletion"
        message="Enter your password to confirm account deletion."
        confirmLabel="Delete Account"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteState('idle')}
        requirePassword
        destructive
      />
    </div>
  );
}

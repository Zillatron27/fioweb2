import { useState } from 'react';
import { checkUser, createAccount, adminDeleteAccount, clearAdminData } from '../api/admin';
import type { AdminClearTarget } from '../api/admin';
import { ApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UserAutocomplete } from '../components/UserAutocomplete';
import styles from './Admin.module.css';

const CLEAR_TARGETS: { target: AdminClearTarget; label: string; description: string }[] = [
  { target: 'clearcxdata', label: 'CX Data', description: 'All commodity exchange entries' },
  { target: 'clearchatdata', label: 'Chat Data', description: 'All chat channels and messages' },
  { target: 'clearbuidata', label: 'Building Data', description: 'All building definitions' },
  { target: 'clearmatdata', label: 'Material Data', description: 'All material definitions' },
  { target: 'clearjumpcache', label: 'Jump Cache', description: 'All jump cache data' },
  { target: 'clearstationdata', label: 'Station Data', description: 'All station data' },
  { target: 'clearmapdata', label: 'Map Data', description: 'All systems, stars, and sectors' },
];

export function Admin() {
  // Check user
  const [checkUsername, setCheckUsername] = useState('');
  const [checkResult, setCheckResult] = useState<'exists' | 'not-found' | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);

  // Create account
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createAdmin, setCreateAdmin] = useState(false);
  const [createBot, setCreateBot] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete account
  const [deleteUsername, setDeleteUsername] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Data management
  const [clearTarget, setClearTarget] = useState<AdminClearTarget | null>(null);
  const [clearMessage, setClearMessage] = useState<string | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);

  const handleCheckUser = async () => {
    if (!checkUsername.trim()) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const exists = await checkUser(checkUsername.trim());
      setCheckResult(exists ? 'exists' : 'not-found');
    } catch {
      setCheckResult(null);
    } finally {
      setCheckLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateMessage(null);
    try {
      await createAccount({
        UserName: createUsername.trim(),
        Password: createPassword,
        Admin: createAdmin,
        Bot: createBot,
      });
      setCreateMessage(`Account "${createUsername.trim()}${createBot ? ' - Bot' : ''}" created.`);
      setCreateUsername('');
      setCreatePassword('');
      setCreateAdmin(false);
      setCreateBot(false);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Failed to create account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
    setDeleteMessage(null);
    try {
      await adminDeleteAccount(deleteUsername.trim());
      setDeleteMessage(`Account "${deleteUsername.trim()}" deleted.`);
      setDeleteUsername('');
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Failed to delete account.');
    }
  };

  const handleClearData = async () => {
    if (!clearTarget) return;
    const label = CLEAR_TARGETS.find((t) => t.target === clearTarget)?.label ?? clearTarget;
    setClearTarget(null);
    setClearError(null);
    setClearMessage(null);
    try {
      await clearAdminData(clearTarget);
      setClearMessage(`${label} cleared.`);
    } catch (err) {
      setClearError(err instanceof ApiError ? err.message : `Failed to clear ${label}.`);
    }
  };

  return (
    <div>
      <h1 className={styles.heading}>Admin Panel</h1>

      {/* Check User */}
      <section className={`card ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Check User</h2>
        <div className={styles.inlineForm}>
          <div className={styles.inlineInput}>
            <UserAutocomplete
              value={checkUsername}
              onChange={(v) => { setCheckUsername(v); setCheckResult(null); }}
              placeholder="Search username…"
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCheckUser}
            disabled={!checkUsername.trim() || checkLoading}
          >
            {checkLoading ? 'Checking…' : 'Check'}
          </button>
          {checkResult === 'exists' && (
            <span className={styles.resultExists}>User exists</span>
          )}
          {checkResult === 'not-found' && (
            <span className={styles.resultNotFound}>User not found</span>
          )}
        </div>
      </section>

      {/* Create Account */}
      <section className={`card ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Create Account</h2>
        <p className={styles.hint}>
          Bot accounts have " - Bot" appended to their username automatically.
        </p>
        {createError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>{createError}</div>
        )}
        {createMessage && (
          <div className="alert alert-success" style={{ marginBottom: 12 }}>{createMessage}</div>
        )}
        <form onSubmit={handleCreateAccount}>
          <div className={styles.field}>
            <label htmlFor="create-username">Username</label>
            <input
              id="create-username"
              type="text"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              required
              minLength={3}
              maxLength={32}
              autoComplete="off"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="create-password">Password</label>
            <input
              id="create-password"
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              required
              minLength={3}
              autoComplete="new-password"
            />
          </div>
          <div className={styles.toggleRow}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={createAdmin}
                onChange={(e) => setCreateAdmin(e.target.checked)}
              />
              <span>Administrator</span>
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={createBot}
                onChange={(e) => setCreateBot(e.target.checked)}
              />
              <span>Bot Account</span>
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createLoading}
          >
            {createLoading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
      </section>

      {/* Delete Account */}
      <section className={`card ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Delete Account</h2>
        {deleteError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>{deleteError}</div>
        )}
        {deleteMessage && (
          <div className="alert alert-success" style={{ marginBottom: 12 }}>{deleteMessage}</div>
        )}
        <div className={styles.inlineForm}>
          <div className={styles.inlineInput}>
            <UserAutocomplete
              value={deleteUsername}
              onChange={setDeleteUsername}
              placeholder="Search username…"
            />
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!deleteUsername.trim()}
          >
            Delete
          </button>
        </div>
      </section>

      {/* Data Management */}
      <section className={`card ${styles.section} ${styles.dangerZone}`}>
        <h2 className={styles.sectionTitle}>Data Management</h2>
        <p className={styles.hint}>
          These operations permanently delete server-wide data. Use with extreme caution.
        </p>
        {clearError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>{clearError}</div>
        )}
        {clearMessage && (
          <div className="alert alert-success" style={{ marginBottom: 12 }}>{clearMessage}</div>
        )}
        <div className={styles.clearGrid}>
          {CLEAR_TARGETS.map((item) => (
            <button
              key={item.target}
              type="button"
              className={`btn btn-danger ${styles.clearBtn}`}
              onClick={() => setClearTarget(item.target)}
            >
              <span className={styles.clearLabel}>{item.label}</span>
              <span className={styles.clearDesc}>{item.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Delete account confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Account"
        message={`Permanently delete the account "${deleteUsername}"?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive
      />

      {/* Clear data confirmation — requires typing the label to confirm */}
      <ConfirmDialog
        open={clearTarget !== null}
        title={`Clear ${CLEAR_TARGETS.find((t) => t.target === clearTarget)?.label ?? ''}`}
        message={`This will permanently delete ${CLEAR_TARGETS.find((t) => t.target === clearTarget)?.description.toLowerCase() ?? 'this data'}. This cannot be undone.`}
        confirmLabel="Clear Data"
        requireConfirmText={CLEAR_TARGETS.find((t) => t.target === clearTarget)?.label}
        onConfirm={handleClearData}
        onCancel={() => setClearTarget(null)}
        destructive
      />
    </div>
  );
}

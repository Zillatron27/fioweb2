import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDiscordName, updateDiscordName } from '../api/auth';
import { ApiError } from '../api/client';
import styles from './Account.module.css';

export function Account() {
  const { username, isAdmin } = useAuth();
  const [discordName, setDiscordName] = useState<string | null>(null);
  const [discordLoading, setDiscordLoading] = useState(true);

  // Inline edit state
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDiscordLoading(true);
    getDiscordName()
      .then((name) => {
        if (!cancelled) setDiscordName(name || null);
      })
      .catch(() => {
        if (!cancelled) setDiscordName(null);
      })
      .finally(() => {
        if (!cancelled) setDiscordLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const startEdit = () => {
    setEditValue(discordName ?? '');
    setEditError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditError(null);
  };

  const saveEdit = async () => {
    const trimmed = editValue.trim();
    if (trimmed.length === 1) {
      setEditError('Discord name cannot be exactly 1 character.');
      return;
    }
    if (trimmed.length > 32) {
      setEditError('Discord name must be 32 characters or fewer.');
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await updateDiscordName(trimmed);
      setDiscordName(trimmed || null);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update Discord name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className={styles.heading}>Account Overview</h1>

      <div className={styles.grid}>
        <div className="card">
          <h2 className={styles.cardTitle}>Profile</h2>
          <dl className={styles.details}>
            <div className={styles.detailRow}>
              <dt>Username</dt>
              <dd>{username}</dd>
            </div>
            {isAdmin && (
              <div className={styles.detailRow}>
                <dt>Account Type</dt>
                <dd>
                  <span className="badge">★ Administrator</span>
                </dd>
              </div>
            )}
            <div className={styles.detailRow}>
              <dt>Discord</dt>
              <dd>
                {discordLoading ? (
                  <span className={styles.loading}>Loading…</span>
                ) : editing ? (
                  <div className={styles.editRow}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      maxLength={32}
                      className={styles.editInput}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span className={styles.editableValue}>
                    {discordName || 'Not set'}
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={startEdit}
                      aria-label="Edit Discord name"
                    >
                      Edit
                    </button>
                  </span>
                )}
              </dd>
            </div>
            {editError && (
              <div className="alert alert-error" style={{ marginTop: 8 }}>{editError}</div>
            )}
          </dl>
        </div>

        <div className="card">
          <h2 className={styles.cardTitle}>Quick Links</h2>
          <div className={styles.links}>
            <Link to="/account/changepassword" className={styles.quickLink}>
              Change Password
            </Link>
            <Link to="/account/apikeys" className={styles.quickLink}>
              Manage API Keys
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

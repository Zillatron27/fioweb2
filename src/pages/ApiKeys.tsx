import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { listApiKeys, createApiKey, revokeApiKey } from '../api/apikeys';
import { ApiError } from '../api/client';
import { CopyButton } from '../components/CopyButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { APIKey } from '../types/apikeys';
import styles from './ApiKeys.module.css';

const MAX_KEYS = 20;

export function ApiKeys() {
  const { username } = useAuth();

  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog state
  const [showCreate, setShowCreate] = useState(false);
  const [createAppName, setCreateAppName] = useState('');
  const [createAllowWrites, setCreateAllowWrites] = useState(false);
  const [createPassword, setCreatePassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  // Revoke dialog state
  const [revokeTarget, setRevokeTarget] = useState<APIKey | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const result = await listApiKeys();
      setKeys(result);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to load API keys.');
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setCreateError(null);
    setCreateLoading(true);

    try {
      const response = await createApiKey({
        UserName: username,
        Password: createPassword,
        ApplicationName: createAppName,
        AllowWrites: createAllowWrites,
      });
      setNewKey(response.APIKey);
      setCreateAppName('');
      setCreateAllowWrites(false);
      setCreatePassword('');
      setShowCreate(false);
      fetchKeys();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 406) {
          setCreateError('Maximum of 20 API keys reached.');
        } else if (err.status === 401) {
          setCreateError('Incorrect password.');
        } else {
          setCreateError(err.message || 'Failed to create API key.');
        }
      } else {
        setCreateError('Unable to connect. Please try again.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRevoke = async (password?: string) => {
    if (!revokeTarget || !username || !password) return;
    setRevokeError(null);

    try {
      await revokeApiKey({
        UserName: username,
        Password: password,
        APIKeyToRevoke: revokeTarget.Key,
      });
      setRevokeTarget(null);
      fetchKeys();
    } catch (err) {
      if (err instanceof ApiError) {
        setRevokeError(
          err.status === 401
            ? 'Incorrect password.'
            : err.message || 'Failed to revoke key.'
        );
      } else {
        setRevokeError('Unable to connect. Please try again.');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className={styles.heading}>API Keys</h1>
        <p className={styles.loadingText}>Loading API keys…</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>API Keys</h1>
        <span className={styles.count}>{keys.length} / {MAX_KEYS}</span>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {newKey && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          <strong>New API key created.</strong>
          <div className={styles.newKeyRow}>
            <code className="mono">{newKey}</code>
            <CopyButton text={newKey} label="Copy key" />
          </div>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => setNewKey(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {keys.length === 0 && !error ? (
        <div className="card">
          <p className={styles.emptyText}>
            No API keys yet. Create one to let external tools access your FIO
            data.
          </p>
        </div>
      ) : (
        <div className={styles.keyList}>
          {keys.map((key) => (
            <div key={key.Key} className={`card ${styles.keyCard}`}>
              <div className={styles.keyInfo}>
                <div className={styles.keyAppName}>{key.Application}</div>
                <div className={styles.keyMeta}>
                  <span className="badge">
                    {key.AllowWrites ? '\u270e Read/Write' : '\u25cb Read Only'}
                  </span>
                  <span className={styles.keyDate}>
                    Created {formatDate(key.CreateTime)}
                  </span>
                </div>
                <div className={styles.keyValue}>
                  <code className="mono">{key.Key}</code>
                  <CopyButton text={key.Key} label="Copy" />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flexShrink: 0 }}
                onClick={() => setRevokeTarget(key)}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 20 }}
        disabled={keys.length >= MAX_KEYS}
        onClick={() => {
          setShowCreate(true);
          setCreateError(null);
          setNewKey(null);
        }}
      >
        Create API Key
      </button>

      {/* Create dialog */}
      {showCreate && (
        <div className={styles.overlay}>
          <div className={`card ${styles.createDialog}`}>
            <h2 className={styles.dialogTitle}>Create API Key</h2>

            {createError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className={styles.field}>
                <label htmlFor="app-name">Application Name</label>
                <input
                  id="app-name"
                  type="text"
                  value={createAppName}
                  onChange={(e) => setCreateAppName(e.target.value)}
                  placeholder="e.g. Helm, My Spreadsheet"
                  autoComplete="off"
                  required
                  maxLength={128}
                />
              </div>

              <div className={styles.toggleField}>
                <label htmlFor="allow-writes" className={styles.toggleLabel}>
                  <span>Allow Writes</span>
                  <span className={styles.toggleHint}>
                    Write access lets tools modify your data. Only enable if the
                    tool requires it.
                  </span>
                </label>
                <input
                  id="allow-writes"
                  type="checkbox"
                  checked={createAllowWrites}
                  onChange={(e) => setCreateAllowWrites(e.target.checked)}
                  className={styles.toggle}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="create-password">Password</label>
                <input
                  id="create-password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreate(false);
                    setCreateError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating\u2026' : 'Create Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke confirmation dialog */}
      <ConfirmDialog
        open={revokeTarget !== null}
        title="Revoke API Key"
        message={
          revokeTarget
            ? `Are you sure you want to revoke the key for "${revokeTarget.Application}"? Any tools using this key will stop working.${revokeError ? `\n\n${revokeError}` : ''}`
            : ''
        }
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        onCancel={() => {
          setRevokeTarget(null);
          setRevokeError(null);
        }}
        requirePassword
        destructive
      />
    </div>
  );
}

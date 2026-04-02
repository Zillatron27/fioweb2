import { useEffect, useState } from 'react';
import { getWebhook, deleteWebhook } from '../api/webhooks';
import { ApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import styles from './Webhooks.module.css';

export function Webhooks() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    getWebhook()
      .then(setCurrentUrl)
      .catch(() => setCurrentUrl(null))
      .finally(() => setLoading(false));
  }, []);

  // handleSet disabled pending API verification — re-enable when webhook access is clarified

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setError(null);
    setMessage(null);
    try {
      await deleteWebhook();
      setCurrentUrl(null);
      setMessage('Webhook removed.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete webhook.');
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className={styles.heading}>Webhooks</h1>
        <p className={styles.muted}>Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.heading}>Webhooks</h1>

      <p className={styles.hint}>
        Webhooks allow bot accounts to receive notifications when game data is updated.
        Only bot accounts can set a webhook URL.
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}
      {message && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>{message}</div>
      )}

      {currentUrl ? (
        <div className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Current Webhook</h2>
          <div className={styles.urlDisplay}>
            <code className="mono">{currentUrl}</code>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Remove Webhook
            </button>
          </div>
        </div>
      ) : (
        <div className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Set Webhook URL</h2>
          <div className={styles.field}>
            <label htmlFor="webhook-url">URL</label>
            <input
              id="webhook-url"
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              minLength={3}
              maxLength={256}
            />
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-primary"
              disabled
            >
              Save Webhook
            </button>
            <p className={styles.hint} style={{ marginTop: 8, marginBottom: 0 }}>
              Webhook management is currently disabled pending API verification.
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Remove Webhook"
        message="Remove the current webhook URL? You can set a new one later."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        destructive
      />
    </div>
  );
}

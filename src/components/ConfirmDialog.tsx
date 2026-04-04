import { useRef, useEffect, useState } from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: (password?: string) => void;
  onCancel: () => void;
  requirePassword?: boolean;
  requireConfirmText?: string;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  requirePassword = false,
  requireConfirmText,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setPassword('');
      setConfirmText('');
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(requirePassword ? password : undefined);
  };

  const handleCancel = () => {
    setPassword('');
    setConfirmText('');
    onCancel();
  };

  const confirmDisabled =
    loading ||
    (requirePassword && !password) ||
    (requireConfirmText !== undefined && confirmText !== requireConfirmText);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
    >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>

      {requirePassword && (
        <div className={styles.field}>
          <label htmlFor="confirm-password" className={styles.label}>
            Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
      )}

      {requireConfirmText !== undefined && (
        <div className={styles.field}>
          <label htmlFor="confirm-text" className={styles.label}>
            Type <strong>{requireConfirmText}</strong> to confirm
          </label>
          <input
            id="confirm-text"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={requireConfirmText}
            autoComplete="off"
          />
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${destructive ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

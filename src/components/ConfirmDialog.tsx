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
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  requirePassword = false,
  destructive = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setPassword('');
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
    onCancel();
  };

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
          disabled={requirePassword && !password}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

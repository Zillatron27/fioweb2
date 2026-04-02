import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';
import styles from './AuthForm.module.css';

export function Register() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userName = searchParams.get('UserName');
  const registrationGuid = searchParams.get('RegistrationGuid');
  const hasParams = userName !== null && registrationGuid !== null;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  if (!hasParams) {
    return (
      <div className={styles.page}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>Register for FIO</h1>

          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            <strong>Registration requires the FIO extension.</strong> Open
            Prosperous Universe with the FIO extension installed, and it will
            generate a registration link that brings you here automatically.
          </div>

          <p className={styles.footer}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        UserName: userName,
        Password: password,
        RegistrationGuid: registrationGuid,
      });
      navigate('/login');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? 'Invalid registration link. Make sure you started registration from the FIO extension first.'
            : err.message || 'Registration failed.'
        );
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Register for FIO</h1>

        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <strong>Important:</strong> Do not reuse your APEX (Prosperous
          Universe) password. Choose a unique password for your FIO account.
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={userName}
              readOnly
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={3}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering\u2026' : 'Register'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

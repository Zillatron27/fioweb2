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
            <strong>Registration requires the FIO browser extension.</strong>
            <ol style={{ margin: '12px 0 0', paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Install the FIO extension for{' '}
                <a href="https://chromewebstore.google.com/detail/honhnhpbngledkpkocmeihfgkfmocmkh" target="_blank" rel="noopener noreferrer">Chrome</a>
                {' '}or{' '}
                <a href="https://addons.mozilla.org/en-US/firefox/addon/fio/" target="_blank" rel="noopener noreferrer">Firefox</a>
              </li>
              <li>Log into the extension inside APEX (Prosperous Universe)</li>
              <li>The extension will redirect you here to complete registration</li>
            </ol>
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
          Your UserName is identical to your game UserName. It is strongly
          suggested that you use a unique password or password manager.{' '}
          <strong>DO NOT</strong> use the same password here that you do for APEX.
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
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

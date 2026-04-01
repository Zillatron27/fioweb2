import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDiscordName } from '../api/auth';
import styles from './Account.module.css';

export function Account() {
  const { username, isAdmin } = useAuth();
  const [discordName, setDiscordName] = useState<string | null>(null);
  const [discordLoading, setDiscordLoading] = useState(true);

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
                  <span className="badge">{'\u2605'} Administrator</span>
                </dd>
              </div>
            )}
            <div className={styles.detailRow}>
              <dt>Discord</dt>
              <dd className={discordLoading ? styles.loading : ''}>
                {discordLoading ? 'Loading\u2026' : (discordName || 'Not set')}
              </dd>
            </div>
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

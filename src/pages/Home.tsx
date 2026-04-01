import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>FIO</span>Web
        </h1>
        <p className={styles.subtitle}>
          Account management for the FIO ecosystem
        </p>
        <p className={styles.description}>
          Manage your FIO account, API keys, permissions, and groups so that
          community tools can access your Prosperous Universe data.
        </p>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <Link to="/account" className="btn btn-primary">
              Go to Account
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Log in
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <div className="card">
          <h2>What is FIO?</h2>
          <p>
            FIO is a community data API for Prosperous Universe. The FIO
            extension collects game data and makes it available through a REST
            API that community tools like Helm, APXM, DryDock, and others use to
            provide useful features to players.
          </p>
        </div>
        <div className="card">
          <h2>What is FIOWeb?</h2>
          <p>
            FIOWeb is the self-service portal for managing your FIO account. Create
            API keys for external tools, control what data you share with other
            players, and manage group permissions for your corporation or alliance.
          </p>
        </div>
      </div>
    </div>
  );
}

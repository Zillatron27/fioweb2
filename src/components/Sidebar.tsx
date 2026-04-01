import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'colorblind', label: 'Colorblind' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { username, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <>
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandText}>FIO</span>
          <span className={styles.brandSub}>Web</span>
        </div>

        {username && (
          <div className={styles.userInfo}>
            <span className={styles.username}>{username}</span>
            <span className="badge">
              {isAdmin ? '\u2605 Admin' : '\u2022 Standard'}
            </span>
          </div>
        )}

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Account</span>
            <NavLink
              to="/account"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              Overview
            </NavLink>
            <NavLink
              to="/account/changepassword"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              Change Password
            </NavLink>
            <NavLink
              to="/account/apikeys"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              API Keys
            </NavLink>
          </div>
        </nav>

        <div className={styles.bottom}>
          <div className={styles.themeSwitch}>
            <span className={styles.navGroupLabel}>Theme</span>
            <div className={styles.themeButtons}>
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`${styles.themeBtn} ${theme === t.value ? styles.themeBtnActive : ''}`}
                  onClick={() => setTheme(t.value)}
                  aria-pressed={theme === t.value}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.navLink} ${styles.logoutBtn}`}
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

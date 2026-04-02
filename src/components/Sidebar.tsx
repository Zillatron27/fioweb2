import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';
import { useInvites } from '../context/InviteContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: { value: Theme; symbol: string; title: string }[] = [
  { value: 'dark', symbol: '☾', title: 'Dark' },
  { value: 'light', symbol: '☀', title: 'Light' },
  { value: 'colorblind', symbol: '◑', title: 'Colorblind' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { username, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { inviteCount } = useInvites();

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
            {isAdmin && <span className="badge">{'★'} Admin</span>}
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

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Data Sharing</span>
            <NavLink
              to="/permissions"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              Permissions
            </NavLink>
            <NavLink
              to="/groups"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              Groups
            </NavLink>
            <NavLink
              to="/groups/invites"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              Invitations
              {inviteCount > 0 && (
                <span className={styles.badge}>{inviteCount}</span>
              )}
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
                  aria-label={t.title}
                  title={t.title}
                >
                  <span style={{
                    ...(t.value === 'dark' ? { marginLeft: 4 } : {}),
                    ...(t.value === 'colorblind' ? { position: 'relative' as const, top: -2 } : {}),
                  }}>{t.symbol}</span>
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

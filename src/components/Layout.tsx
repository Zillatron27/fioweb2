import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './Layout.module.css';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <header className={styles.mobileHeader}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
          <span className={styles.mobileTitle}>
            <span className={styles.mobileBrand}>FIO</span>
            <span className={styles.mobileBrandSub}>Web</span>
          </span>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

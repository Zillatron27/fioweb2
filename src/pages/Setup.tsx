import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSites, getWorkforces } from '../api/data';
import styles from './Setup.module.css';

const POLL_INTERVAL = 4000;

interface StepConfig {
  title: string;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    title: 'Log in to FIOWeb',
    description: 'Log in to your FIO account to continue setup.',
  },
  {
    title: 'Log into FIO Extension and refresh APEX',
    description:
      'Click the FIO Extension icon in your browser and log in. It will be located in the top-right corner. You might have to click the puzzle icon. After doing so, refresh APEX.',
  },
  {
    title: 'Open all bases in APEX',
    description:
      'In APEX, click on BS and then click the "View Base" button for each planet. FIO Extension will brighten when transmitting data.',
  },
  {
    title: 'Done!',
    description: 'Your game data is flowing into FIO. You can now use community tools that rely on FIO data.',
  },
];

export function Setup() {
  const { isAuthenticated, username } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [siteCount, setSiteCount] = useState(0);
  const siteCountRef = useRef(0);
  const activeStepRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  useEffect(() => {
    siteCountRef.current = siteCount;
  }, [siteCount]);

  // Step 1: auto-complete if authenticated
  useEffect(() => {
    if (isAuthenticated && activeStep === 0) {
      setActiveStep(1);
    }
  }, [isAuthenticated, activeStep]);

  // Step 2: poll for sites
  const pollSites = useCallback(async () => {
    if (!username || activeStepRef.current !== 1) return;
    try {
      const sites = await getSites(username);
      if (sites.length > 0) {
        setSiteCount(sites.length);
        siteCountRef.current = sites.length;
        setActiveStep(2);
      }
    } catch {
      // Silently retry on next interval
    }
  }, [username]);

  useEffect(() => {
    if (activeStep !== 1 || !username) return;
    pollSites();
    const interval = setInterval(pollSites, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [activeStep, username, pollSites]);

  // Step 3: poll for workforces
  const pollWorkforces = useCallback(async () => {
    if (!username || activeStepRef.current !== 2) return;
    try {
      const workforces = await getWorkforces(username);
      if (workforces.length >= siteCountRef.current) {
        setActiveStep(3);
      }
    } catch {
      // Silently retry on next interval
    }
  }, [username]);

  useEffect(() => {
    if (activeStep !== 2 || !username) return;
    pollWorkforces();
    const interval = setInterval(pollWorkforces, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [activeStep, username, pollWorkforces]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>FIO Setup</h1>
        <p className={styles.subtitle}>
          Get your game data flowing into FIO
        </p>

        <div className={styles.stepper}>
          {STEPS.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isFuture = index > activeStep;

            return (
              <div
                key={index}
                className={`${styles.step} ${isCompleted ? styles.stepCompleted : ''} ${isActive ? styles.stepActive : ''} ${isFuture ? styles.stepFuture : ''}`}
              >
                <div className={styles.stepIndicator}>
                  <div className={styles.stepDot}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {index < STEPS.length - 1 && <div className={styles.stepLine} />}
                </div>
                <div className={styles.stepContent}>
                  <h2 className={styles.stepTitle}>{step.title}</h2>
                  {(isActive || isCompleted) && (
                    <p className={styles.stepDescription}>{step.description}</p>
                  )}
                  {isActive && index === 0 && !isAuthenticated && (
                    <Link to="/login" className="btn btn-primary" style={{ marginTop: 12 }}>
                      Log in
                    </Link>
                  )}
                  {isActive && (index === 1 || index === 2) && (
                    <div className={styles.polling}>
                      <span className={styles.pollingDot} />
                      <span>Waiting for data…</span>
                    </div>
                  )}
                  {isActive && index === 3 && (
                    <div className={styles.doneLinks}>
                      <Link to="/account" className="btn btn-primary">
                        Go to Account
                      </Link>
                      <Link to="/account/data" className="btn btn-secondary">
                        View My Data
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className={styles.footnote}>
          If you have no bases present, setup will not function correctly.
          In that scenario, you can just browse away from this page.
        </p>
      </div>
    </div>
  );
}

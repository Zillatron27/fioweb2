import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllData } from '../api/data';
import type { AllData } from '../types/data';
import styles from './DataOverview.module.css';

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function latestTimestamp(items: { Timestamp: string }[]): string | null {
  if (items.length === 0) return null;
  return items.reduce((latest, item) =>
    item.Timestamp > latest ? item.Timestamp : latest,
    items[0].Timestamp,
  );
}

interface CategoryTile {
  label: string;
  items: { Timestamp: string }[];
}

export function DataOverview() {
  const { username } = useAuth();
  const [data, setData] = useState<AllData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    getAllData(username)
      .then(setData)
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div>
        <h1 className={styles.heading}>My Data</h1>
        <p className={styles.muted}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className={styles.heading}>My Data</h1>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className={styles.heading}>My Data</h1>
        <div className="card">
          <p className={styles.muted}>
            No data found for your account. If you haven't set up the FIO extension yet,{' '}
            <Link to="/setup">visit Setup</Link> to get started.
          </p>
        </div>
      </div>
    );
  }

  const categories: CategoryTile[] = [
    { label: 'Company', items: data.Company ? [data.Company] : [] },
    { label: 'Sites', items: data.Sites ?? [] },
    { label: 'Ships', items: data.Ships ?? [] },
    { label: 'Flights', items: data.Flights ?? [] },
    { label: 'Storage', items: data.Storages ?? [] },
    { label: 'Workforces', items: data.Workforces ?? [] },
    { label: 'Production Lines', items: data.ProductionLines ?? [] },
    { label: 'Contracts', items: data.Contracts ?? [] },
    { label: 'Exchange Orders', items: data.CXOSs ?? [] },
  ];

  return (
    <div>
      <h1 className={styles.heading}>My Data</h1>

      {/* Company Card */}
      {data.Company ? (
        <div className={`card ${styles.companyCard}`}>
          <div className={styles.companyHeader}>
            <h2 className={styles.companyName}>{data.Company.Name}</h2>
            <span className="badge mono">{data.Company.Code}</span>
          </div>
          <div className={styles.companyMeta}>
            <span>{data.Company.CountryName} ({data.Company.CountryCode})</span>
          </div>
        </div>
      ) : (
        <div className={`card ${styles.companyCard}`}>
          <p className={styles.muted}>
            No company data found.{' '}
            <Link to="/setup">Complete Setup</Link> to start collecting your game data.
          </p>
        </div>
      )}

      {/* Category Grid */}
      <div className={styles.grid}>
        {categories.map((cat) => {
          const hasData = cat.items.length > 0;
          const latest = latestTimestamp(cat.items);

          return (
            <div key={cat.label} className={`card ${styles.tile}`}>
              <div className={styles.tileHeader}>
                <span className={hasData ? styles.iconPresent : styles.iconEmpty}>
                  {hasData ? '✓' : '✗'}
                </span>
                <span className={styles.tileLabel}>{cat.label}</span>
              </div>
              <div className={styles.tileTimestamp}>
                {latest ? relativeTime(latest) : 'No data'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

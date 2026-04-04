import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listInvites, acceptInvite, rejectInvite } from '../api/groups';
import { ApiError } from '../api/client';
import { PermissionEditor } from '../components/PermissionEditor';
import type { InviteResponse } from '../types/groups';
import { countEnabled, TOTAL_PERMISSIONS } from '../types/permissions';
import { useInvites } from '../context/InviteContext';
import styles from './GroupInvites.module.css';

export function GroupInvites() {
  const { refreshInvites } = useInvites();
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchInvites = useCallback(async () => {
    try {
      const result = await listInvites();
      setInvites(result);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvites(); }, [fetchInvites]);

  const handleAccept = async (groupId: number) => {
    setActionLoading(groupId);
    try {
      await acceptInvite(groupId);
      fetchInvites();
      refreshInvites();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to accept invite.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (groupId: number) => {
    setActionLoading(groupId);
    try {
      await rejectInvite(groupId);
      fetchInvites();
      refreshInvites();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reject invite.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div>
        <Link to="/groups" className={styles.backLink}>{'←'} Groups</Link>
        <h1 className={styles.heading}>Group Invitations</h1>
        <p className={styles.muted}>Loading invitations…</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/groups" className={styles.backLink}>{'←'} Groups</Link>
      <h1 className={styles.heading}>Group Invitations</h1>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {invites.length === 0 ? (
        <div className="card">
          <p className={styles.muted}>No pending invitations.</p>
        </div>
      ) : (
        <div className={styles.inviteList}>
          {invites.map((invite) => (
            <div key={invite.GroupId} className={`card ${styles.inviteCard}`}>
              <div className={styles.inviteHeader}>
                <div className={styles.inviteInfo}>
                  <span className={styles.groupName}>{invite.GroupName}</span>
                  <div className={styles.inviteMeta}>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      #{invite.GroupId}
                    </span>
                    <span className="badge">
                      {invite.Admin ? '☆ Admin' : '• Member'}
                    </span>
                    <span className={styles.permCount}>
                      {countEnabled(invite.Permissions)}/${TOTAL_PERMISSIONS} permissions
                    </span>
                  </div>
                </div>

                <div className={styles.inviteActions}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setExpandedId(expandedId === invite.GroupId ? null : invite.GroupId)}
                  >
                    {expandedId === invite.GroupId ? 'Hide' : 'View'} Permissions
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAccept(invite.GroupId)}
                    disabled={actionLoading === invite.GroupId}
                  >
                    {actionLoading === invite.GroupId ? '\u2026' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleReject(invite.GroupId)}
                    disabled={actionLoading === invite.GroupId}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {expandedId === invite.GroupId && (
                <div className={styles.permPanel}>
                  <PermissionEditor permissions={invite.Permissions} readOnly />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

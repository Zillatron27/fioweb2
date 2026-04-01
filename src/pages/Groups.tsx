import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listGroupsWithRoles, listInvites } from '../api/groups';
import { ApiError } from '../api/client';
import type { GroupWithRole } from '../types/groups';
import type { InviteResponse } from '../types/groups';
import { countEnabled } from '../types/permissions';
import styles from './Groups.module.css';

const MAX_GROUPS = 10;

const ROLE_LABELS: Record<string, string> = {
  owner: '\u2605 Owner',
  admin: '\u2606 Admin',
  member: '\u2022 Member',
};

export function Groups() {
  const [groups, setGroups] = useState<GroupWithRole[]>([]);
  const [invites, setInvites] = useState<InviteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [g, inv] = await Promise.all([
        listGroupsWithRoles(),
        listInvites(),
      ]);
      setGroups(g);
      setInvites(inv);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load groups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ownedCount = groups.filter((g) => g.role === 'owner').length;

  if (loading) {
    return (
      <div>
        <h1 className={styles.heading}>Groups</h1>
        <p className={styles.muted}>Loading groups\u2026</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Groups</h1>
        <span className={styles.count}>{ownedCount} / {MAX_GROUPS} owned</span>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {invites.length > 0 && (
        <Link to="/groups/invites" className={`alert alert-warning ${styles.inviteBanner}`}>
          You have {invites.length} pending group invitation{invites.length > 1 ? 's' : ''}. View invitations \u2192
        </Link>
      )}

      <Link
        to="/groups/create"
        className={`btn btn-primary ${ownedCount >= MAX_GROUPS ? styles.disabled : ''}`}
        onClick={(e) => { if (ownedCount >= MAX_GROUPS) e.preventDefault(); }}
        style={{ marginBottom: 20, display: 'inline-flex' }}
      >
        Create Group
      </Link>

      {groups.length === 0 ? (
        <div className="card">
          <p className={styles.muted}>
            You're not part of any groups yet. Create one or accept an invitation.
          </p>
        </div>
      ) : (
        <div className={styles.groupList}>
          {groups.map((group) => (
            <Link
              key={group.GroupId}
              to={`/groups/${group.GroupId}`}
              className={`card ${styles.groupCard}`}
            >
              <div className={styles.groupInfo}>
                <div className={styles.groupName}>{group.GroupName}</div>
                <div className={styles.groupMeta}>
                  <span className={`mono ${styles.groupId}`}>#{group.GroupId}</span>
                  <span className="badge">{ROLE_LABELS[group.role]}</span>
                  <span className={styles.permCount}>
                    {countEnabled(group.Permissions)}/21 permissions
                  </span>
                </div>
              </div>
              <span className={styles.arrow}>\u203a</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

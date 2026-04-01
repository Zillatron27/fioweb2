import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroup, listGroupsOwner, listGroupsAdmin, inviteUsers, kickMember, promoteMember, leaveGroup, deleteGroup } from '../api/groups';
import { ApiError } from '../api/client';
import { PermissionEditor } from '../components/PermissionEditor';
import { UserAutocomplete } from '../components/UserAutocomplete';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { GroupDetailResponse } from '../types/groups';
import type { GroupRole } from '../types/groups';
import { countEnabled } from '../types/permissions';
import styles from './GroupDetail.module.css';

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const gid = Number(groupId);

  const [group, setGroup] = useState<GroupDetailResponse | null>(null);
  const [role, setRole] = useState<GroupRole>('member');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUser, setInviteUser] = useState('');
  const [inviteAsAdmin, setInviteAsAdmin] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Kick/promote form
  const [actionUser, setActionUser] = useState('');
  const [actionType, setActionType] = useState<'kick' | 'promote' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Delete/leave confirmations
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (isNaN(gid)) {
      setError('Invalid group ID.');
      setLoading(false);
      return;
    }
    try {
      const [g, owned, admined] = await Promise.all([
        getGroup(gid),
        listGroupsOwner(),
        listGroupsAdmin(),
      ]);
      setGroup(g);
      if (owned.some((o) => o.GroupId === gid)) setRole('owner');
      else if (admined.some((a) => a.GroupId === gid)) setRole('admin');
      else setRole('member');
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load group.');
    } finally {
      setLoading(false);
    }
  }, [gid]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const handleInvite = async () => {
    if (!inviteUser) return;
    setInviteError(null);
    setInviteLoading(true);
    try {
      await inviteUsers({
        GroupId: gid,
        Invites: [{ UserName: inviteUser, Admin: inviteAsAdmin }],
      });
      setShowInvite(false);
      setInviteUser('');
      setInviteAsAdmin(false);
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : 'Failed to send invite.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionUser || !actionType) return;
    setActionError(null);
    try {
      if (actionType === 'kick') {
        await kickMember(gid, actionUser);
      } else {
        await promoteMember(gid, actionUser);
      }
      setActionUser('');
      setActionType(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : `Failed to ${actionType} user.`);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroup(gid);
      navigate('/groups');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to leave group.');
    }
    setConfirmLeave(false);
  };

  const handleDelete = async () => {
    try {
      await deleteGroup(gid);
      navigate('/groups');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete group.');
    }
    setConfirmDelete(false);
  };

  const ROLE_LABELS: Record<GroupRole, string> = {
    owner: '\u2605 Owner',
    admin: '\u2606 Admin',
    member: '\u2022 Member',
  };

  if (loading) {
    return (
      <div>
        <Link to="/groups" className={styles.backLink}>\u2190 Groups</Link>
        <h1 className={styles.heading}>Loading\u2026</h1>
      </div>
    );
  }

  if (!group) {
    return (
      <div>
        <Link to="/groups" className={styles.backLink}>\u2190 Groups</Link>
        <div className="alert alert-error">{error || 'Group not found.'}</div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/groups" className={styles.backLink}>\u2190 Groups</Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>{group.GroupName}</h1>
          <div className={styles.meta}>
            <span className="mono">#{group.GroupId}</span>
            <span className="badge">{ROLE_LABELS[role]}</span>
            <span className={styles.permCount}>
              {countEnabled(group.Permissions)}/21 permissions
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {/* Permissions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Permissions</h2>
        <PermissionEditor permissions={group.Permissions} readOnly />
      </section>

      {/* Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Actions</h2>

        <div className={styles.actionButtons}>
          {(role === 'owner' || role === 'admin') && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowInvite(true);
                setInviteError(null);
              }}
            >
              Invite User
            </button>
          )}

          {(role === 'owner' || role === 'admin') && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setActionType('kick');
                setActionError(null);
              }}
            >
              Kick User
            </button>
          )}

          {role === 'owner' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setActionType('promote');
                setActionError(null);
              }}
            >
              Promote to Admin
            </button>
          )}

          {role !== 'owner' && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmLeave(true)}
            >
              Leave Group
            </button>
          )}

          {role === 'owner' && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmDelete(true)}
            >
              Delete Group
            </button>
          )}
        </div>

        {/* Kick / Promote form */}
        {actionType && (
          <div className={`card ${styles.actionForm}`}>
            <h3 className={styles.actionFormTitle}>
              {actionType === 'kick' ? 'Kick User' : 'Promote to Admin'}
            </h3>
            {actionError && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>{actionError}</div>
            )}
            <div className={styles.field}>
              <label htmlFor="action-user">Username</label>
              <UserAutocomplete
                id="action-user"
                value={actionUser}
                onChange={setActionUser}
              />
            </div>
            <div className={styles.actionFormButtons}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setActionType(null); setActionUser(''); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'kick' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleAction}
                disabled={!actionUser}
              >
                {actionType === 'kick' ? 'Kick' : 'Promote'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Invite dialog */}
      {showInvite && (
        <div className={styles.overlay}>
          <div className={`card ${styles.inviteDialog}`}>
            <h2 className={styles.dialogTitle}>Invite User</h2>
            {inviteError && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>{inviteError}</div>
            )}
            <div className={styles.field}>
              <label htmlFor="invite-user">Username</label>
              <UserAutocomplete
                id="invite-user"
                value={inviteUser}
                onChange={setInviteUser}
              />
            </div>
            {role === 'owner' && (
              <label className={styles.toggleField}>
                <span>Invite as Admin</span>
                <input
                  type="checkbox"
                  checked={inviteAsAdmin}
                  onChange={(e) => setInviteAsAdmin(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: 'var(--accent)' }}
                />
              </label>
            )}
            <div className={styles.dialogActions}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowInvite(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleInvite}
                disabled={!inviteUser || inviteLoading}
              >
                {inviteLoading ? 'Sending\u2026' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmLeave}
        title="Leave Group"
        message={`Are you sure you want to leave "${group.GroupName}"?`}
        confirmLabel="Leave"
        onConfirm={handleLeave}
        onCancel={() => setConfirmLeave(false)}
        destructive
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Group"
        message={`Permanently delete "${group.GroupName}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        destructive
      />
    </div>
  );
}

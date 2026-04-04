import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroup, listGroupsOwner, listGroupsAdmin, inviteUsers, kickMember, promoteMember, leaveGroup, deleteGroup } from '../api/groups';
import { ApiError } from '../api/client';
import { PermissionEditor } from '../components/PermissionEditor';
import { UserAutocomplete } from '../components/UserAutocomplete';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { GroupDetailResponse } from '../types/groups';
import type { GroupRole } from '../types/groups';
import { countEnabled, TOTAL_PERMISSIONS } from '../types/permissions';
import styles from './GroupDetail.module.css';

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const gid = Number(groupId);

  const [group, setGroup] = useState<GroupDetailResponse | null>(null);
  const [role, setRole] = useState<GroupRole>('member');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action panels — only one open at a time
  const [activePanel, setActivePanel] = useState<'invite' | 'kick' | 'promote' | null>(null);

  // Invite form
  const [invitePending, setInvitePending] = useState<string[]>([]);
  const [inviteAsAdmin, setInviteAsAdmin] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Kick/promote form
  const [actionUser, setActionUser] = useState('');
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

  const togglePanel = (panel: 'invite' | 'kick' | 'promote') => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      setInvitePending([]);
      setInviteAsAdmin(false);
      setInviteError(null);
      setActionUser('');
      setActionError(null);
    }
  };

  const handleInvite = async () => {
    if (invitePending.length === 0) return;
    setInviteError(null);
    setInviteLoading(true);
    try {
      await inviteUsers({
        GroupId: gid,
        Invites: invitePending.map((u) => ({ UserName: u, Admin: inviteAsAdmin })),
      });
      setActivePanel(null);
      setInvitePending([]);
      setInviteAsAdmin(false);
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : 'Failed to send invite.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionUser || !activePanel) return;
    setActionError(null);
    try {
      if (activePanel === 'kick') {
        await kickMember(gid, actionUser);
      } else {
        await promoteMember(gid, actionUser);
      }
      setActionUser('');
      setActivePanel(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : `Failed to ${activePanel} user.`);
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
    owner: '★ Owner',
    admin: '☆ Admin',
    member: '• Member',
  };

  if (loading) {
    return (
      <div>
        <Link to="/groups" className={styles.backLink}>← Groups</Link>
        <h1 className={styles.heading}>Loading…</h1>
      </div>
    );
  }

  if (!group) {
    return (
      <div>
        <Link to="/groups" className={styles.backLink}>← Groups</Link>
        <div className="alert alert-error">{error || 'Group not found.'}</div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/groups" className={styles.backLink}>← Groups</Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>{group.GroupName}</h1>
          <div className={styles.meta}>
            <span className="mono">#{group.GroupId}</span>
            <span className="badge">{ROLE_LABELS[role]}</span>
            <span className={styles.permCount}>
              {countEnabled(group.Permissions)}/{TOTAL_PERMISSIONS} permissions
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {/* Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Actions</h2>

        <div className={styles.actionButtons}>
          {(role === 'owner' || role === 'admin') && (
            <button
              type="button"
              className={`btn ${activePanel === 'invite' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => togglePanel('invite')}
            >
              Invite User
            </button>
          )}

          {(role === 'owner' || role === 'admin') && (
            <button
              type="button"
              className={`btn ${activePanel === 'kick' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => togglePanel('kick')}
            >
              Kick User
            </button>
          )}

          {role === 'owner' && (
            <button
              type="button"
              className={`btn ${activePanel === 'promote' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => togglePanel('promote')}
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

        {/* Invite panel */}
        <div className={`${styles.panel} ${activePanel === 'invite' ? styles.panelOpen : ''}`}>
          {activePanel === 'invite' && (
            <div className={`card ${styles.actionForm}`}>
              {inviteError && (
                <div className="alert alert-error" style={{ marginBottom: 12 }}>{inviteError}</div>
              )}
              <div className={styles.field}>
                <label htmlFor="invite-user">Users to invite</label>
                <UserAutocomplete
                  multi
                  id="invite-user"
                  value={invitePending}
                  onChange={setInvitePending}
                  placeholder="Search users…"
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
              <div className={styles.actionFormButtons}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActivePanel(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleInvite}
                  disabled={invitePending.length === 0 || inviteLoading}
                >
                  {inviteLoading ? 'Sending…' : 'Send Invites'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kick panel */}
        <div className={`${styles.panel} ${activePanel === 'kick' ? styles.panelOpen : ''}`}>
          {activePanel === 'kick' && (
            <div className={`card ${styles.actionForm}`}>
              {actionError && (
                <div className="alert alert-error" style={{ marginBottom: 12 }}>{actionError}</div>
              )}
              <div className={styles.field}>
                <label htmlFor="kick-user">Username</label>
                <UserAutocomplete
                  id="kick-user"
                  value={actionUser}
                  onChange={setActionUser}
                />
              </div>
              <div className={styles.actionFormButtons}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActivePanel(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleAction}
                  disabled={!actionUser}
                >
                  Kick
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Promote panel */}
        <div className={`${styles.panel} ${activePanel === 'promote' ? styles.panelOpen : ''}`}>
          {activePanel === 'promote' && (
            <div className={`card ${styles.actionForm}`}>
              {actionError && (
                <div className="alert alert-error" style={{ marginBottom: 12 }}>{actionError}</div>
              )}
              <div className={styles.field}>
                <label htmlFor="promote-user">Username</label>
                <UserAutocomplete
                  id="promote-user"
                  value={actionUser}
                  onChange={setActionUser}
                />
              </div>
              <div className={styles.actionFormButtons}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActivePanel(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAction}
                  disabled={!actionUser}
                >
                  Promote
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Permissions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Permissions</h2>
        <PermissionEditor permissions={group.Permissions} readOnly />
      </section>

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

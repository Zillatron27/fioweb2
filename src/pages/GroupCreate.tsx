import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createGroup } from '../api/groups';
import { isGroupIdAvailable } from '../api/permissions';
import { ApiError } from '../api/client';
import { PermissionEditor } from '../components/PermissionEditor';
import { UserAutocomplete } from '../components/UserAutocomplete';
import type { Permissions } from '../types/permissions';
import { emptyPermissions, fullPermissions } from '../types/permissions';
import type { GroupInvite } from '../types/groups';
import styles from './GroupCreate.module.css';

function parseValidationError(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.errors) {
      const messages = Object.values(parsed.errors).flat();
      return messages.join(' ');
    }
    return parsed.title || raw;
  } catch {
    return raw;
  }
}

export function GroupCreate() {
  const navigate = useNavigate();
  const { username } = useAuth();

  const [groupName, setGroupName] = useState('');
  const [requestedId, setRequestedId] = useState('');
  const [idStatus, setIdStatus] = useState<'unchecked' | 'checking' | 'available' | 'taken'>('unchecked');
  const [permissions, setPermissions] = useState<Permissions>(emptyPermissions());
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Invite builder state
  const [inviteUsers, setInviteUsers] = useState<string[]>([]);
  const [inviteAdmin, setInviteAdmin] = useState(false);

  const checkId = useCallback(async (idStr: string) => {
    const id = Number(idStr);
    if (!idStr || isNaN(id) || id < 1 || id > 999999) {
      setIdStatus('unchecked');
      return;
    }
    setIdStatus('checking');
    const available = await isGroupIdAvailable(id);
    setIdStatus(available ? 'available' : 'taken');
  }, []);

  const addInvites = () => {
    if (inviteUsers.length === 0) return;
    const newInvites = inviteUsers
      .filter((u) => !invites.some((i) => i.UserName === u))
      .map((u) => ({ UserName: u, Admin: inviteAdmin }));
    setInvites([...invites, ...newInvites]);
    setInviteUsers([]);
    setInviteAdmin(false);
  };

  const removeInvite = (username: string) => {
    setInvites(invites.filter((i) => i.UserName !== username));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setError(null);
    setLoading(true);

    const reqId = requestedId ? Number(requestedId) : 0;

    try {
      const result = await createGroup({
        RequestedId: reqId,
        GroupName: groupName.trim(),
        Invites: invites,
        Permissions: permissions,
      });
      navigate(`/groups/${result.GroupId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 406) {
          setError('Maximum of 10 groups reached, or the requested ID is taken.');
        } else if (err.status === 400) {
          setError(parseValidationError(err.message));
        } else {
          setError(err.message || 'Failed to create group.');
        }
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/groups" className={styles.backLink}>{'\u2190'} Groups</Link>
      <h1 className={styles.heading}>Create Group</h1>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="group-name">Group Name</label>
          <input
            id="group-name"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            minLength={3}
            maxLength={16}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="requested-id">
            Requested ID <span className={styles.optional}>(optional, 1–999999)</span>
          </label>
          <div className={styles.idRow}>
            <input
              id="requested-id"
              type="number"
              value={requestedId}
              onChange={(e) => {
                setRequestedId(e.target.value);
                setIdStatus('unchecked');
              }}
              min={1}
              max={999999}
              placeholder="Auto-generate"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => checkId(requestedId)}
              disabled={!requestedId || idStatus === 'checking'}
            >
              {idStatus === 'checking' ? 'Checking\u2026' : 'Check'}
            </button>
          </div>
          {idStatus === 'available' && (
            <span className={styles.idAvailable}>{'\u2713'} Available</span>
          )}
          {idStatus === 'taken' && (
            <span className={styles.idTaken}>{'\u2717'} Taken</span>
          )}
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Initial Invites</h2>
          <div className={styles.inviteBuilder}>
            <div className={styles.inviteRow}>
              <div style={{ flex: 1 }}>
                <UserAutocomplete
                  multi
                  value={inviteUsers}
                  onChange={setInviteUsers}
                  placeholder="Search user to invite…"
                  exclude={[username ?? '', ...invites.map((i) => i.UserName)]}
                />
              </div>
              <label className={styles.adminToggle}>
                <input
                  type="checkbox"
                  checked={inviteAdmin}
                  onChange={(e) => setInviteAdmin(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
                />
                <span>Admin</span>
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addInvites}
                disabled={inviteUsers.length === 0}
              >
                Add
              </button>
            </div>
          </div>

          {invites.length > 0 && (
            <div className={styles.inviteList}>
              {invites.map((inv) => (
                <div key={inv.UserName} className={styles.inviteItem}>
                  <span>{inv.UserName}</span>
                  {inv.Admin && <span className="badge">Admin</span>}
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeInvite(inv.UserName)}
                    aria-label={`Remove ${inv.UserName}`}
                  >
                    {'\u00d7'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Permissions</h2>
          <p className={styles.hint}>
            These permissions define what data group members share with each other.
          </p>
          <div className={styles.bulkActions}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPermissions(fullPermissions())}
            >
              Select All
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPermissions(emptyPermissions())}
            >
              Clear All
            </button>
          </div>
          <PermissionEditor permissions={permissions} onChange={setPermissions} />
        </section>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !groupName.trim()}
          style={{ marginTop: 20 }}
        >
          {loading ? 'Creating\u2026' : 'Create Group'}
        </button>
      </form>
    </div>
  );
}

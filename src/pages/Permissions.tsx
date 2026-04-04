import { useEffect, useState, useCallback } from 'react';
import { getMyGrants, getGrantedToMe, grantPermission, revokePermission } from '../api/permissions';
import { ApiError } from '../api/client';
import { PermissionEditor } from '../components/PermissionEditor';
import { UserAutocomplete } from '../components/UserAutocomplete';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Dialog } from '../components/Dialog';
import type { PermissionResponse, Permissions } from '../types/permissions';
import { emptyPermissions, fullPermissions, countEnabled, TOTAL_PERMISSIONS } from '../types/permissions';
import styles from './Permissions.module.css';

type Tab = 'granted' | 'received';

export function PermissionsPage() {
  const [tab, setTab] = useState<Tab>('granted');
  const [myGrants, setMyGrants] = useState<PermissionResponse[]>([]);
  const [receivedGrants, setReceivedGrants] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grant form state
  const [showGrant, setShowGrant] = useState(false);
  const [grantUser, setGrantUser] = useState('');
  const [grantPerms, setGrantPerms] = useState<Permissions>(emptyPermissions());
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantLoading, setGrantLoading] = useState(false);

  // Edit state
  const [editingGrantee, setEditingGrantee] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<Permissions>(emptyPermissions());
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // View state (received permissions)
  const [viewingGrant, setViewingGrant] = useState<PermissionResponse | null>(null);

  // Revoke state
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [grants, received] = await Promise.all([
        getMyGrants(),
        getGrantedToMe(),
      ]);
      setMyGrants(grants);
      setReceivedGrants(received);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleGrant = async () => {
    if (!grantUser) return;
    setGrantError(null);
    setGrantLoading(true);
    try {
      await grantPermission({ UserName: grantUser, Permissions: grantPerms });
      setShowGrant(false);
      setGrantUser('');
      setGrantPerms(emptyPermissions());
      fetchAll();
    } catch (err) {
      setGrantError(err instanceof ApiError ? err.message : 'Failed to grant permissions.');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingGrantee) return;
    setEditError(null);
    setEditLoading(true);
    try {
      await grantPermission({ UserName: editingGrantee, Permissions: editPerms });
      setEditingGrantee(null);
      fetchAll();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update permissions.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokePermission(revokeTarget);
      setRevokeTarget(null);
      fetchAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to revoke permissions.');
    }
  };

  const startEdit = (grant: PermissionResponse) => {
    setEditingGrantee(grant.GranteeUserName);
    setEditPerms(structuredClone(grant.Permissions));
    setEditError(null);
  };

  if (loading) {
    return (
      <div>
        <h1 className={styles.heading}>Permissions</h1>
        <p className={styles.muted}>Loading permissions…</p>
      </div>
    );
  }

  const directGrants = myGrants.filter((g) => g.GroupId === 0);
  const groupGrants = myGrants.filter((g) => g.GroupId > 0);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Permissions</h1>
        {tab === 'granted' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowGrant(true);
              setGrantError(null);
            }}
          >
            Grant Permissions
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'granted' ? styles.tabActive : ''}`}
          onClick={() => setTab('granted')}
        >
          Granted by Me ({myGrants.length})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'received' ? styles.tabActive : ''}`}
          onClick={() => setTab('received')}
        >
          Granted to Me ({receivedGrants.length})
        </button>
      </div>

      {tab === 'granted' && (
        <div>
          {directGrants.length === 0 && groupGrants.length === 0 && (
            <div className="card">
              <p className={styles.muted}>
                You haven't granted permissions to anyone yet.
              </p>
            </div>
          )}

          {directGrants.map((grant) => (
            <div key={grant.GranteeUserName} className={`card ${styles.grantCard}`}>
              <div className={styles.grantHeader}>
                <span className={styles.grantee}>
                  {grant.GranteeUserName === '*'
                    ? '✱ All Users (Public)'
                    : grant.GranteeUserName}
                </span>
                <span className="badge">
                  {countEnabled(grant.Permissions)}/${TOTAL_PERMISSIONS} enabled
                </span>
                <div className={styles.grantActions}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => startEdit(grant)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setRevokeTarget(grant.GranteeUserName)}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          ))}

          {groupGrants.length > 0 && (
            <>
              <h2 className={styles.subheading}>From Groups</h2>
              {groupGrants.map((grant) => (
                <div key={`${grant.GranteeUserName}-${grant.GroupId}`} className={`card ${styles.grantCard} ${styles.groupGrant}`}>
                  <div className={styles.grantHeader}>
                    <span className={styles.grantee}>{grant.GranteeUserName}</span>
                    <span className="badge">
                      Group #{grant.GroupId} \u00b7 {countEnabled(grant.Permissions)}/${TOTAL_PERMISSIONS}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'received' && (
        <div>
          {receivedGrants.length === 0 && (
            <div className="card">
              <p className={styles.muted}>
                No one has granted you permissions yet.
              </p>
            </div>
          )}

          {receivedGrants.map((grant) => (
            <div key={`${grant.GrantorUserName}-${grant.GroupId}`} className={`card ${styles.grantCard}`}>
              <div className={styles.grantHeader}>
                <span className={styles.grantee}>{grant.GrantorUserName}</span>
                <span className="badge">
                  {grant.GroupId > 0 ? `Group #${grant.GroupId} · ` : ''}
                  {countEnabled(grant.Permissions)}/${TOTAL_PERMISSIONS} enabled
                </span>
                <div className={styles.grantActions}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setViewingGrant(grant)}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grant dialog */}
      <Dialog open={showGrant} onClose={() => setShowGrant(false)} className={styles.grantDialog}>
        <h2 className={styles.dialogTitle}>Grant Permissions</h2>

        {grantError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>{grantError}</div>
        )}

        <div className={styles.grantControls}>
          <div className={styles.grantUserField}>
            <label htmlFor="grant-user">User</label>
            <UserAutocomplete
              id="grant-user"
              value={grantUser}
              onChange={setGrantUser}
              showPublicOption
            />
          </div>
          <div className={styles.grantBulkActions}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setGrantPerms(fullPermissions())}
            >
              Select All
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setGrantPerms(emptyPermissions())}
            >
              Clear All
            </button>
          </div>
        </div>

        <PermissionEditor permissions={grantPerms} onChange={setGrantPerms} />

        <div className={styles.dialogActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowGrant(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGrant}
            disabled={!grantUser || grantLoading}
          >
            {grantLoading ? 'Granting\u2026' : 'Grant'}
          </button>
        </div>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editingGrantee !== null} onClose={() => setEditingGrantee(null)} className={styles.grantDialog}>
        <h2 className={styles.dialogTitle}>
          Edit Permissions — {editingGrantee === '*' ? '✱ All Users (Public)' : editingGrantee}
        </h2>

        {editError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>{editError}</div>
        )}

        <div className={styles.grantBulkActions} style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setEditPerms(fullPermissions())}
          >
            Select All
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditPerms(emptyPermissions())}
          >
            Clear All
          </button>
        </div>

        <PermissionEditor permissions={editPerms} onChange={setEditPerms} />

        <div className={styles.dialogActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditingGrantee(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEditSave}
            disabled={editLoading}
          >
            {editLoading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Dialog>

      {/* View dialog (received permissions) */}
      <Dialog open={viewingGrant !== null} onClose={() => setViewingGrant(null)} className={styles.grantDialog}>
        {viewingGrant && (
          <>
            <h2 className={styles.dialogTitle}>
              Permissions from {viewingGrant.GrantorUserName}
              {viewingGrant.GroupId > 0 ? ` (Group #${viewingGrant.GroupId})` : ''}
            </h2>

            <PermissionEditor permissions={viewingGrant.Permissions} readOnly />

            <div className={styles.dialogActions}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setViewingGrant(null)}
              >
                Close
              </button>
            </div>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={revokeTarget !== null}
        title="Revoke Permissions"
        message={
          revokeTarget
            ? `Revoke all permissions granted to ${revokeTarget === '*' ? 'all users (public)' : revokeTarget}?`
            : ''
        }
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
        destructive
      />
    </div>
  );
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { listInvites } from '../api/groups';

interface InviteContextValue {
  inviteCount: number;
  refreshInvites: () => void;
}

const InviteContext = createContext<InviteContextValue>({
  inviteCount: 0,
  refreshInvites: () => {},
});

export function InviteProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [inviteCount, setInviteCount] = useState(0);

  const refreshInvites = useCallback(() => {
    if (!isAuthenticated) return;
    listInvites()
      .then((invites) => setInviteCount(invites.length))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refreshInvites();
  }, [refreshInvites]);

  return (
    <InviteContext.Provider value={{ inviteCount, refreshInvites }}>
      {children}
    </InviteContext.Provider>
  );
}

export function useInvites(): InviteContextValue {
  return useContext(InviteContext);
}

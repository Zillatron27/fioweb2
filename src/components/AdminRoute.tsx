import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Bypasses admin check in dev mode only. Automatically false in production builds. */
const DEV_FORCE_ADMIN = import.meta.env.DEV;

export function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!DEV_FORCE_ADMIN && !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}

export { DEV_FORCE_ADMIN };

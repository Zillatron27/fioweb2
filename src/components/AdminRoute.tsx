import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Set to true to bypass admin check during UI development. */
const DEV_FORCE_ADMIN = false;

export function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!DEV_FORCE_ADMIN && !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}

export { DEV_FORCE_ADMIN };

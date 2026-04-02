import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { InviteProvider } from './context/InviteContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { ChangePassword } from './pages/ChangePassword';
import { ApiKeys } from './pages/ApiKeys';
import { PermissionsPage } from './pages/Permissions';
import { Groups } from './pages/Groups';
import { GroupDetail } from './pages/GroupDetail';
import { GroupCreate } from './pages/GroupCreate';
import { GroupInvites } from './pages/GroupInvites';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
        <InviteProvider>
          <Routes>
            {/* Public routes — no sidebar layout */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — sidebar layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/account" element={<Account />} />
                <Route path="/account/changepassword" element={<ChangePassword />} />
                <Route path="/account/apikeys" element={<ApiKeys />} />
                <Route path="/permissions" element={<PermissionsPage />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/create" element={<GroupCreate />} />
                <Route path="/groups/invites" element={<GroupInvites />} />
                <Route path="/groups/:groupId" element={<GroupDetail />} />
              </Route>
            </Route>
          </Routes>
        </InviteProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}

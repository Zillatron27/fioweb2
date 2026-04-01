import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { ChangePassword } from './pages/ChangePassword';
import { ApiKeys } from './pages/ApiKeys';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
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
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}

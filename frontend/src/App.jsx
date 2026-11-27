import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Households from './pages/Households.jsx';
import Residents from './pages/Residents.jsx';
import Login from './pages/Login.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import FeeCatalog from './pages/FeeCatalog.jsx';
import MonthlyFees from './pages/MonthlyFees.jsx';
import Collections from './pages/Collections.jsx';
import './styles/fees.css';
import { authApi } from './services/mockApi.js';

export default function App() {
  const [user, setUser] = useState(authApi.session);
  const { pathname, state } = useLocation();

  function logout() {
    authApi.logout();
    setUser(null);
  }

  return (
    <Routes>
      <Route path="/dang-nhap" element={user ? <Navigate to={state?.from || '/'} replace /> : <Login onLogin={setUser} />} />
      <Route
        element={user ? <AppLayout user={user} onLogout={logout} /> : <Navigate to="/dang-nhap" state={{ from: pathname }} replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="/ho-gia-dinh" element={<Households />} />
        <Route path="/nhan-khau" element={<Residents />} />
        <Route path="/khoan-thu" element={<FeeCatalog />} />
        <Route path="/bang-phi" element={<MonthlyFees />} />
        <Route path="/thu-phi" element={<Collections user={user} />} />
        <Route path="/doi-mat-khau" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

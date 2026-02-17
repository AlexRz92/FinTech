import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminWeeks from './pages/admin/Weeks';
import AdminCapital from './pages/admin/Capital';
import AdminUsers from './pages/admin/Users';
import UserDashboard from './pages/user/Dashboard';
import UserWeeks from './pages/user/Weeks';
import UserWithdrawals from './pages/user/Withdrawals';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/weeks" element={<AdminWeeks />} />
        <Route path="/admin/capital" element={<AdminCapital />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/weeks" element={<UserWeeks />} />
        <Route path="/user/withdrawals" element={<UserWithdrawals />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

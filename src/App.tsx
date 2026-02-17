import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />

        <Route path="/admin/weeks" element={<AdminDashboard />} />
        <Route path="/admin/capital" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />

        <Route path="/user/weeks" element={<UserDashboard />} />
        <Route path="/user/withdrawals" element={<UserDashboard />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

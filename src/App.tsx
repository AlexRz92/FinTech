import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminWeeks from './pages/admin/Weeks';
import AdminCapital from './pages/admin/Capital';
import AdminUsers from './pages/admin/Users';
import UserDashboard from './pages/user/Dashboard';
import UserWeeks from './pages/user/Weeks';
import UserCapital from './pages/user/Capital';
import UserWithdrawals from './pages/user/Withdrawals';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/weeks"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminWeeks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/capital"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminCapital />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredRole="USER">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/weeks"
          element={
            <ProtectedRoute requiredRole="USER">
              <UserWeeks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/capital"
          element={
            <ProtectedRoute requiredRole="USER">
              <UserCapital />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/withdrawals"
          element={
            <ProtectedRoute requiredRole="USER">
              <UserWithdrawals />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

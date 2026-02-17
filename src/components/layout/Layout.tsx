import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface LayoutProps {
  children: ReactNode;
  userRole: 'admin' | 'user';
  userName: string;
}

export default function Layout({ children, userRole, userName }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-fintage-dark">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      <Topbar userName={userName} />

      <main className="ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

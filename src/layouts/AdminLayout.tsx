
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {profile?.name || 'Admin'}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <nav className="flex space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/stores')}>
              Stores
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/merchandisers')}>
              Merchandisers
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/visits')}>
              Visits
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin/upload')}>
              Data Upload
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

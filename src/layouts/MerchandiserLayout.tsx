
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Map, Calendar, User } from 'lucide-react';

const MerchandiserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Merchandiser App</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              {profile?.name || 'Merchandiser'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
      <footer className="bg-white border-t">
        <div className="grid grid-cols-4 h-16">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => navigate('/visits')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Visits</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => navigate('/map')}
          >
            <Map className="h-5 w-5" />
            <span className="text-xs mt-1">Map</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default MerchandiserLayout;

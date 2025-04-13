
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      if (profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      navigate('/auth');
    }
  }, [user, profile, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;

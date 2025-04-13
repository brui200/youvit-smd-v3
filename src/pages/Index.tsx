
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();

  // Add console logging to help debug
  console.log('Current user:', user);
  console.log('Current profile:', profile);
  console.log('Is loading:', isLoading);
  console.log('User role:', profile?.role);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      // Make sure we have a profile before checking the role
      if (profile) {
        if (profile.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Redirecting to merchandiser home');
          navigate('/merchandiser');
        }
      } else {
        console.log('Profile is null, waiting for profile data');
        // If we have a user but no profile yet, we'll wait for the profile
        // The AuthContext will fetch the profile
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

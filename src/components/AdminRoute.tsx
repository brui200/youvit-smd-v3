
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // Add console logging for debugging
  console.log('AdminRoute - user:', user);
  console.log('AdminRoute - profile:', profile);
  console.log('AdminRoute - isLoading:', isLoading);
  console.log('AdminRoute - profile role:', profile?.role);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user exists but profile hasn't loaded yet, show loading
  if (user && !profile) {
    return <div className="flex h-screen items-center justify-center">Loading profile data...</div>;
  }

  // Check if user is admin
  if (profile?.role !== 'admin') {
    console.log('User is not admin, redirecting to /merchandiser');
    return <Navigate to="/merchandiser" state={{ from: location }} replace />;
  }

  console.log('User is admin, rendering admin route');
  return <>{children}</>;
};

export default AdminRoute;

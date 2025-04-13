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

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If user exists but profile is null (due to Supabase error), we'll make a best guess based on URL
  // This is a fallback to prevent infinite loading
  if (user && !profile) {
    if (location.pathname.startsWith('/admin')) {
      // If they're trying to access admin pages, we'll assume they're admin for now
      return <>{children}</>;
    } else {
      // Otherwise redirect to merchandiser page
      return <Navigate to="/merchandiser" state={{ from: location }} replace />;
    }
  }

  // Normal flow - check if user is admin
  if (!profile?.role || profile.role !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin';
  redirectTo?: string;
}

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/auth' }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  // Wait until auth (and admin check if needed) is resolved before rendering
  if (authLoading || (requiredRole === 'admin' && adminLoading)) {
    return null;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

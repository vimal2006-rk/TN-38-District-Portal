import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Spinner size="lg" className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/admin/dashboard" replace />;
  return children;
}

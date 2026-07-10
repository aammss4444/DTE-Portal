import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';
import { DASHBOARD_ROUTES } from '../constants/roles';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const normalizedRole = String(role || '').trim().toUpperCase();

  if (loading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated but role is missing, we're likely in a transition state (fetching profile)
  if (!role) {
    return <LoadingScreen message="Loading user profile..." />;
  }

  if (allowedRoles && !allowedRoles.some(r => r.toUpperCase() === normalizedRole)) {
    const safeRedirect = DASHBOARD_ROUTES[normalizedRole] || '/login';
    return <Navigate to={safeRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;

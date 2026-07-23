import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'agence' | 'voyageur';
}

const PrivateRoute = ({ children, allowedRole }: PrivateRouteProps) => {
  const user = authService.getUser();
  if (!user || !authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== allowedRole) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'agence') return <Navigate to="/agency-dashboard" replace />;
    return <Navigate to="/traveler-dashboard" replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;

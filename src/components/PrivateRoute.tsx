// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { authService } from "../services/api";
import toast from "react-hot-toast";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: 'admin' | 'voyageur';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    toast.error("Veuillez vous connecter pour accéder à cette page");
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    toast.error("Vous n'avez pas les permissions nécessaires");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div style={{ width: "100vw", height: "100vh", backgroundColor: "#1a0804" }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

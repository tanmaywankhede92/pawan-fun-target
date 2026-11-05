import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ width: "100vw", height: "100vh", backgroundColor: "#1a0804" }} />;
  }

  if (isAuthenticated) {
    return <Navigate to="/pre" replace />;
  }

  return children;
};

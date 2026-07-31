import { Routes, Route, Navigate } from 'react-router-dom';
// import { ProtectedRoute } from './ProtectedRoute';
// import { PublicRoute } from './PublicRoute';
import MainLayout from '@components/layouts/MainLayout';
import HomePage from '@pages/HomePage';
// import LoginPage from '@features/auth/pages/LoginPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login auth temporarily disabled — direct home page */}
      {/* <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      /> */}
      <Route
        path="/game"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

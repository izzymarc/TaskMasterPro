import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AuthScreen from './AuthScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [, setLocation] = useLocation();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const loading = useSelector((state: RootState) => state.user.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={() => setLocation(window.location.pathname)} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
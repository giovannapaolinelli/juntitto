import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state, canAccessRoute } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking access for path:', location.pathname);
  console.log('ProtectedRoute: Auth state:', {
    user: state.user?.id || 'No user',
    loading: state.loading,
    initialized: state.initialized
  });

  // Show loading while auth is initializing
  if (!state.initialized || state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!state.initialized ? 'Inicializando...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    );
  }

  // Check route access
  const accessResult = canAccessRoute(location.pathname);
  
  if (!accessResult.allowed && accessResult.redirectTo) {
    console.log('ProtectedRoute: Access denied, redirecting to:', accessResult.redirectTo);
    return <Navigate to={accessResult.redirectTo} replace />;
  }

  console.log('ProtectedRoute: Access granted, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
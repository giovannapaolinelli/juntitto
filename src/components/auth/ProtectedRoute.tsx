import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOwnership?: boolean;
  resourceOwnerId?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOwnership = false, 
  resourceOwnerId 
}) => {
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
    console.log('ProtectedRoute: Showing loading state - initialized:', state.initialized, 'loading:', state.loading);
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!state.initialized ? 'Carregando...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    );
  }

  // Step 5: Enhanced dashboard component debugging
  console.log('ProtectedRoute: Auth state check - User:', state.user?.id || 'None', 'Path:', location.pathname);

  // Check if user is authenticated
  if (!state.user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check ownership if required
  if (requireOwnership && resourceOwnerId && state.user.id !== resourceOwnerId) {
    console.log('ProtectedRoute: User not owner of resource, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Check route access
  const accessResult = canAccessRoute(location.pathname);
  
  if (!accessResult.allowed && accessResult.redirectTo) {
    console.log('ProtectedRoute: Access denied, redirecting to:', accessResult.redirectTo);
    return <Navigate to={accessResult.redirectTo} state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Access granted, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
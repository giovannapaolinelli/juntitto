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

  console.log('ProtectedRoute: Access check for:', location.pathname, {
    hasUser: !!state.user,
    userId: state.user?.id || 'None',
    loading: state.loading,
    initialized: state.initialized,
    timestamp: new Date().toISOString()
  });

  // Show loading while auth is initializing
  if (!state.initialized || state.loading) {
    console.log('ProtectedRoute: Showing loading state:', {
      initialized: state.initialized,
      loading: state.loading,
      reason: !state.initialized ? 'Not initialized' : 'Loading'
    });
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

  // Check if user is authenticated
  if (!state.user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check ownership if required
  if (requireOwnership && resourceOwnerId && state.user.id !== resourceOwnerId) {
    console.log('ProtectedRoute: User not owner of resource:', resourceOwnerId, 'redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Check route access
  const accessResult = canAccessRoute(location.pathname);
  
  if (!accessResult.allowed && accessResult.redirectTo) {
    console.log('ProtectedRoute: Access denied for:', location.pathname, 'redirecting to:', accessResult.redirectTo);
    return <Navigate to={accessResult.redirectTo} state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Access granted for:', location.pathname, 'user:', state.user.id);
  return <>{children}</>;
};

export default ProtectedRoute;
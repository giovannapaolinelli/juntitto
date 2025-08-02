import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for route protection and automatic redirects
 */
export const useAuthGuard = () => {
  const { state, canAccessRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check routes after auth is initialized
    if (!state.initialized) {
      return;
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!state.initialized) {
        console.warn('useAuthGuard: Auth initialization timeout');
      }
    }, 3000);

    console.log('useAuthGuard: Checking route access for:', location.pathname);

    const accessResult = canAccessRoute(location.pathname);

    if (!accessResult.allowed && accessResult.redirectTo) {
      console.log('useAuthGuard: Redirecting to:', accessResult.redirectTo);
      navigate(accessResult.redirectTo, { 
        replace: true,
        state: { from: location }
      });
    }

    return () => clearTimeout(timeout);
  }, [state.initialized, state.user, location.pathname, canAccessRoute, navigate]);

  return {
    isAuthenticated: !!state.user,
    isLoading: state.loading || !state.initialized,
    user: state.user,
    error: state.error
  };
};

/**
 * Hook for protecting specific routes
 */
export const useProtectedRoute = () => {
  const { state } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.initialized && !state.user) {
      console.log('useProtectedRoute: User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [state.initialized, state.user, navigate]);

  return {
    isAuthenticated: !!state.user,
    isLoading: state.loading || !state.initialized,
    user: state.user
  };
};

/**
 * Hook for redirecting authenticated users from auth pages
 */
export const useAuthRedirect = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authPages = ['/login', '/signup'];
    
    if (state.initialized && state.user && authPages.includes(location.pathname)) {
      console.log('useAuthRedirect: Authenticated user on auth page, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [state.initialized, state.user, location.pathname, navigate]);

  return {
    isAuthenticated: !!state.user,
    isLoading: state.loading || !state.initialized
  };
};
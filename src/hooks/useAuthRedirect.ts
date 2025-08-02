import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for handling automatic redirects after authentication
 */
export const useAuthRedirect = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only handle redirects after auth is fully initialized
    if (!state.initialized || state.loading) {
      return;
    }

    const currentPath = location.pathname;
    const authPages = ['/login', '/signup'];
    
    // If user is authenticated and on auth pages, redirect to dashboard
    if (state.user && authPages.includes(currentPath)) {
      console.log('useAuthRedirect: Authenticated user on auth page, redirecting to dashboard');
      
      // Get intended destination from location state or default to dashboard
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      
      // Use React Router's navigate for proper SPA navigation
      navigate(redirectTo, { 
        replace: true,
        state: undefined // Clear the redirect state
      });
    }
    
    // If user is not authenticated and on protected pages, redirect to login
    if (!state.user && !authPages.includes(currentPath) && currentPath !== '/' && !currentPath.startsWith('/play/')) {
      console.log('useAuthRedirect: Unauthenticated user on protected page, redirecting to login');
      navigate('/login', { 
        replace: true,
        state: { from: location }
      });
    }
  }, [state.initialized, state.user, state.loading, location.pathname, navigate, location]);

  return {
    isAuthenticated: !!state.user,
    isLoading: state.loading || !state.initialized,
    user: state.user
  };
};
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Centralized hook for handling all authentication-based redirects
 * This is the single source of truth for post-login redirection logic
 */
export const useAuthRedirect = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('useAuthRedirect: Evaluating redirect logic with state:', {
      user: !!state.user,
      loading: state.loading,
      initialized: state.initialized,
      currentPath: location.pathname
    }); // NOVO LOG
    
    const currentPath = location.pathname;
    const isAuthPage = ['/login', '/signup'].includes(currentPath);
    const isGuestQuiz = currentPath.startsWith('/play/');
    const isPublicPage = currentPath === '/' || currentPath.startsWith('/pricing') || currentPath.startsWith('/terms') || currentPath.startsWith('/privacy');

    // Wait for authentication state to be fully initialized
    if (!state.initialized || state.loading) {
      console.log('useAuthRedirect: Not ready for redirect. State: initialized='+state.initialized+', loading='+state.loading); // NOVO LOG
      console.log('useAuthRedirect: Waiting for auth initialization...', {
        initialized: state.initialized,
        loading: state.loading
      });
      return;
    }

    console.log('useAuthRedirect: Processing redirect logic', {
      currentPath,
      isAuthenticated: !!state.user,
      isAuthPage,
      isGuestQuiz,
      isPublicPage,
      userId: state.user?.id || 'None'
    });

    // Case 1: Authenticated user on auth pages should be redirected to dashboard
    if (state.user && isAuthPage) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      console.log('useAuthRedirect: Redirecting authenticated user from auth page to:', redirectTo);
      navigate(redirectTo, { replace: true });
      return;
    }

    // Case 2: Unauthenticated user trying to access protected routes
    if (!state.user && !isAuthPage && !isPublicPage && !isGuestQuiz) {
      console.log('useAuthRedirect: Redirecting unauthenticated user to login from:', currentPath);
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }

    console.log('useAuthRedirect: No redirect needed for current state');
  }, [
    state.user,
    state.loading,
    state.initialized,
    location.pathname,
    location.state,
    navigate
  ]);

  return {
    isAuthenticated: !!state.user,
    isLoading: state.loading || !state.initialized,
    user: state.user
  };
};

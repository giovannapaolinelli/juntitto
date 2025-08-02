import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for handling automatic redirects after authentication
 */
export const useAuthRedirect = () => {
  const { state } = useAuth(); // Assumindo que AuthContext fornece { user, loading, initialized }
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const isAuthPage = ['/login', '/signup'].includes(currentPath);
    const isGuestQuiz = currentPath.startsWith('/play/');

    const ready = state.initialized && !state.loading;

    console.log('useAuthRedirect: Evaluating redirect logic with state:', {
      user: !!state.user,
      loading: state.loading,
      initialized: state.initialized,
      currentPath: currentPath,
      ready: ready
    });

    // 🟡 Aguarda estado estar pronto
    if (!ready) {
      console.log('useAuthRedirect: Not ready for redirect. State: initialized='+state.initialized+', loading='+state.loading);
      return;
    }

    // ✅ Caso 1: Usuário autenticado em página pública (login/signup), redirecionar
    if (state.user && isAuthPage) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      console.log('🔁 Redirecionando usuário autenticado para:', redirectTo);
      navigate(redirectTo, { replace: true });
    }

    // ✅ Caso 2: Usuário NÃO autenticado tentando acessar rota protegida
    if (!state.user && !isAuthPage && currentPath !== '/' && !isGuestQuiz) {
      console.log('🔒 Usuário não autenticado, redirecionando para login');
      navigate('/login', { replace: true, state: { from: location } });
    }

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


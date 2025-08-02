import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthViewModel } from '../viewmodels/AuthViewModel';
import { AuthState, LoginCredentials, SignupCredentials } from '../types/auth';

interface AuthContextType {
  state: AuthState;
  signIn: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  canAccessRoute: (path: string) => { allowed: boolean; redirectTo?: string };
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authViewModel] = useState(() => new AuthViewModel());
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
    error: null
  });

  useEffect(() => {
    console.log('AuthProvider: Setting up ViewModel subscription');
    const unsubscribe = authViewModel.subscribe((newState) => {
      console.log('AuthProvider: State updated from ViewModel:', {
        hasUser: !!newState.user,
        userId: newState.user?.id || 'None',
        loading: newState.loading,
        initialized: newState.initialized,
        error: newState.error || 'None',
        timestamp: new Date().toISOString()
      });
      setState(newState);
      
      // Enhanced auth state change handling for post-login redirect
      if (newState.initialized && newState.user && !state.user) {
        console.log('AuthProvider: User authentication detected, checking for redirect needs');
        
        // Check if we're on an auth page and should redirect
        const currentPath = window.location.pathname;
        const authPages = ['/login', '/signup'];
        
        if (authPages.includes(currentPath)) {
          console.log('AuthProvider: User authenticated on auth page, initiating redirect to dashboard');
          
          // Ensure React state is fully propagated before navigation
          setTimeout(() => {
            const redirectTo = '/dashboard';
            console.log('AuthProvider: Executing redirect to:', redirectTo, 'at', new Date().toISOString());
            
            // Primary navigation method
            try {
              window.history.pushState({}, '', redirectTo);
              window.dispatchEvent(new PopStateEvent('popstate'));
            } catch (error) {
              console.warn('AuthProvider: History API failed, using location.href fallback');
              window.location.href = redirectTo;
            }
          }, 100);
        }
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up');
      unsubscribe();
      authViewModel.destroy();
    };
  }, [authViewModel, state.user]); // Added state.user dependency for proper comparison
  const value = {
    state,
    signIn: authViewModel.signIn.bind(authViewModel),
    signUp: authViewModel.signUp.bind(authViewModel),
    signOut: authViewModel.signOut.bind(authViewModel),
    canAccessRoute: authViewModel.canAccessRoute.bind(authViewModel),
    clearError: authViewModel.clearError.bind(authViewModel)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
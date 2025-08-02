import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  console.log('AuthProvider: Component function called');
  console.log('AuthProvider: Component rendering/mounting');
  
  // Use useRef to ensure AuthViewModel instance is stable across re-renders
  const authViewModelRef = useRef<AuthViewModel | null>(null);
  
  if (!authViewModelRef.current) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
    authViewModelRef.current = new AuthViewModel();
  }
  
  const authViewModel = authViewModelRef.current;

  useEffect(() => {
    console.log('AuthProvider: useEffect running - setting up subscription');
    console.log('AuthProvider: useEffect running - setting up subscription');
    console.log('AuthProvider: Setting up ViewModel subscription');
    
    const unsubscribe = authViewModel.subscribe((newState) => {
      console.log('AuthProvider: Received state from ViewModel:', {
        hasUser: !!newState.user,
        userId: newState.user?.id || 'None',
        loading: newState.loading,
        initialized: newState.initialized,
        error: newState.error || 'None'
      });
      
      console.log('AuthProvider: Setting React state to:', {
        hasUser: !!newState.user,
        userId: newState.user?.id || 'None',
        loading: newState.loading,
        initialized: newState.initialized,
        error: newState.error || 'None'
      });
      
      setState(newState);
      
      // Log the state immediately after setting it
      setTimeout(() => {
        console.log('AuthProvider: React state after setState:', {
          hasUser: !!state.user,
          userId: state.user?.id || 'None',
          loading: state.loading,
          initialized: state.initialized
        });
      }, 0);
    });

    return () => {
      console.log('AuthProvider: Cleaning up');
      unsubscribe();
      authViewModelRef.current?.destroy();
    };
  }, [authViewModel]);
  
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
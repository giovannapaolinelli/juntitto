import { AuthService } from '../services/AuthService';
import { RouteGuardService } from '../services/RouteGuardService';
import { User, AuthState, LoginCredentials, SignupCredentials, AuthError } from '../types/auth';

export class AuthViewModel {
  private authService: AuthService;
  private routeGuardService: RouteGuardService;
  private state: AuthState;
  private listeners: Set<(state: AuthState) => void> = new Set();
  private authStateUnsubscribe: { data: { subscription: { unsubscribe: () => void } } } | null = null;

  constructor() {
    this.authService = AuthService.getInstance();
    this.routeGuardService = RouteGuardService.getInstance();
    this.state = {
      user: null,
      loading: true,
      initialized: false,
      error: null
    };

    this.initialize();
  }

  /**
   * Initialize authentication state
   */
  private async initialize(): Promise<void> {
    console.log('AuthViewModel: Initializing...');
    
    // Set timeout to prevent infinite loading (increased to 5 seconds)
    const initTimeout = setTimeout(() => {
      console.warn('AuthViewModel: Initialization timeout, marking as initialized');
      this.updateState({
        user: null,
        loading: false,
        initialized: true,
        error: null // Don't show error for timeout, just mark as initialized
      });
    }, 5000);

    try {
      // Set up auth state change listener
      this.authStateUnsubscribe = this.authService.onAuthStateChange((user) => {
        console.log('AuthViewModel: Auth state changed, user:', user?.id || 'No user');
        clearTimeout(initTimeout);
        this.updateState({
          user,
          loading: false,
          initialized: true,
          error: null
        });
      });

      // Get initial session
      const { session, error } = await this.authService.getCurrentSession();
      
      if (error) {
        console.error('AuthViewModel: Failed to get initial session:', error);
        clearTimeout(initTimeout);
        this.updateState({
          user: null,
          loading: false,
          initialized: true,
          error: null // Don't show session errors on initial load
        });
        return;
      }

      // If no session, mark as initialized
      if (!session) {
        console.log('AuthViewModel: No initial session found');
        clearTimeout(initTimeout);
        this.updateState({
          user: null,
          loading: false,
          initialized: true,
          error: null
        });
      }

      // If session exists, the auth state change listener will handle it

    } catch (error) {
      console.error('AuthViewModel: Initialization error:', error);
      clearTimeout(initTimeout);
      this.updateState({
        user: null,
        loading: false,
        initialized: true,
        error: null // Don't show initialization errors to users
      });
    }
  }

  /**
   * Sign in user
   */
  async signIn(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    console.log('AuthViewModel: Sign in attempt for:', credentials.email);
    
    this.updateState({ ...this.state, loading: true, error: null });

    try {
      // Step 1: Proper await implementation with diagnostic logging
      const { user, error } = await this.authService.signIn(credentials);
      console.log('AuthViewModel: Supabase response - User:', user?.id || 'None', 'Error:', error?.message || 'None');

      if (error) {
        console.error('AuthViewModel: Sign in failed:', error);
        this.updateState({
          ...this.state,
          loading: false,
          error: error.message
        });
        return { success: false, error: error.message };
      }

      // Step 2: Session validation before success
      if (user) {
        console.log('AuthViewModel: Valid user received, updating state...');
        // Auth state change listener will update the state
        this.updateState({
          ...this.state,
          loading: false,
          error: null
        });
      } else {
        console.warn('AuthViewModel: No user in response despite no error');
        this.updateState({
          ...this.state,
          loading: false,
          error: 'Authentication failed - no user data'
        });
        return { success: false, error: 'Authentication failed' };
      }

      console.log('AuthViewModel: Sign in successful');
      return { success: true };

    } catch (error) {
      console.error('AuthViewModel: Unexpected sign in error:', error);
      const errorMessage = 'An unexpected error occurred during sign in';
      this.updateState({
        ...this.state,
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sign up user
   */
  async signUp(credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> {
    console.log('AuthViewModel: Sign up attempt for:', credentials.email);
    
    this.updateState({ ...this.state, loading: true, error: null });

    try {
      const { success, error } = await this.authService.signUp(credentials);

      if (error) {
        console.error('AuthViewModel: Sign up failed:', error);
        this.updateState({
          ...this.state,
          loading: false,
          error: error.message
        });
        return { success: false, error: error.message };
      }

      console.log('AuthViewModel: Sign up successful');
      this.updateState({
        ...this.state,
        loading: false,
        error: null
      });
      return { success: true };

    } catch (error) {
      console.error('AuthViewModel: Unexpected sign up error:', error);
      const errorMessage = 'An unexpected error occurred during registration';
      this.updateState({
        ...this.state,
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    console.log('AuthViewModel: Sign out attempt');
    
    this.updateState({ ...this.state, loading: true, error: null });

    try {
      const { error } = await this.authService.signOut();

      if (error) {
        console.error('AuthViewModel: Sign out failed:', error);
        this.updateState({
          ...this.state,
          loading: false,
          error: error.message
        });
        return { success: false, error: error.message };
      }

      console.log('AuthViewModel: Sign out successful');
      // Auth state change listener will update the state
      return { success: true };

    } catch (error) {
      console.error('AuthViewModel: Unexpected sign out error:', error);
      const errorMessage = 'An unexpected error occurred during sign out';
      this.updateState({
        ...this.state,
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check route access
   */
  canAccessRoute(path: string): { allowed: boolean; redirectTo?: string } {
    const guardResult = this.routeGuardService.canAccessProtectedRoute(this.state.user, path);
    const authPageResult = this.routeGuardService.shouldRedirectFromAuthPages(this.state.user, path);

    if (!guardResult.allowed) {
      return { allowed: false, redirectTo: guardResult.redirectTo };
    }

    if (!authPageResult.allowed) {
      return { allowed: false, redirectTo: authPageResult.redirectTo };
    }

    return { allowed: true };
  }

  /**
   * Get current state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    console.log('AuthViewModel: State updated:', this.state);
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('AuthViewModel: Error in state listener:', error);
      }
    });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('AuthViewModel: Destroying...');
    
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe.data.subscription.unsubscribe();
      this.authStateUnsubscribe = null;
    }
    
    this.listeners.clear();
  }
}
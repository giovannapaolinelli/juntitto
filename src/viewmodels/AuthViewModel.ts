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
    console.log('AuthViewModel: Constructor called');
    this.authService = AuthService.getInstance();
    this.routeGuardService = RouteGuardService.getInstance();
    this.state = {
      user: null,
      loading: true,
      initialized: false,
      error: null
    };

    console.log('AuthViewModel: Calling initialize()');
    this.initialize();
  }

  /**
   * Initialize authentication state
   */
  private async initialize(): Promise<void> {
    let initializationComplete = false;
    console.log('AuthViewModel: Initializing...');
    
    // Set timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      console.warn('AuthViewModel: Initialization timeout after 5 seconds, marking as initialized');
      this.updateState({
        user: null,
        loading: false,
        initialized: true,
        error: null
      });
      initializationComplete = true;
    }, 5000);

    try {
      // Set up auth state change listener
      this.authStateUnsubscribe = this.authService.onAuthStateChange((user) => {
        if (initializationComplete) return; // Ignore if already timed out
        
        console.log('AuthViewModel: Received auth state change from AuthService:', { userId: user?.id || 'No user' }); // NOVO LOG
        console.log('AuthViewModel: Auth state changed:', {
          userId: user?.id || 'No user',
          userEmail: user?.email || 'No email',
          hasUser: !!user,
          previousUser: this.state.user?.id || 'None',
          timestamp: new Date().toISOString()
        });
        clearTimeout(initTimeout);
        initializationComplete = true;
        this.updateState({
          user,
          loading: false,
          initialized: true,
          error: null
        });
      });

      // Get initial session
      const { session, error } = await this.authService.getCurrentSession();
      
      console.log('AuthViewModel: Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasAccessToken: !!session?.access_token,
        expiresAt: session?.expires_at,
        error: error?.message || 'None'
      });
      
      if (error) {
        console.error('AuthViewModel: Failed to get initial session:', error);
        clearTimeout(initTimeout);
        initializationComplete = true;
        this.updateState({
          user: null,
          loading: false,
          initialized: true,
          error: null
        });
        return;
      }

      // If no session, mark as initialized
      if (!session) {
        console.log('AuthViewModel: No initial session found');
        clearTimeout(initTimeout);
        initializationComplete = true;
        this.updateState({
          user: null,
          loading: false,
          initialized: true,
          error: null
        });
      }

      // If session exists, verify it's complete and valid
      if (session && session.user) {
        console.log('AuthViewModel: Valid session found, waiting for auth state change listener');
      }

    } catch (error) {
      console.error('AuthViewModel: Initialization error:', error);
      clearTimeout(initTimeout);
      initializationComplete = true;
      this.updateState({
        user: null,
        loading: false,
        initialized: true,
        error: null
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
      const { user, error } = await this.authService.signIn(credentials);
      
      if (error) {
        console.error('AuthViewModel: Sign in failed:', error);
        this.updateState({
          ...this.state,
          loading: false,
          error: error.message
        });
        return { success: false, error: error.message };
      }

      // Don't update loading state here - let the auth state change callback handle it
      // The user will be set by onAuthStateChange callback
      console.log('AuthViewModel: Sign in request successful, waiting for auth state change');

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
    console.log('AuthViewModel: New listener subscribed, total listeners:', this.listeners.size);
    console.log('AuthViewModel: Immediately calling new listener with current state:', this.getState());
    
    // Immediately call with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      console.log('AuthViewModel: Listener unsubscribed, remaining listeners:', this.listeners.size);
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    console.log('AuthViewModel: State updated:', this.state);
    console.log('AuthViewModel: Notifying', this.listeners.size, 'listeners of state change');
    console.log('AuthViewModel: Notifying', this.listeners.size, 'listeners');
    
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
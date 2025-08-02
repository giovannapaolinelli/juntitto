import { supabase } from '../data/supabase/client';
import { User, LoginCredentials, SignupCredentials, AuthError } from '../types/auth';
import { AuthResponse, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign in user with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      console.log('AuthService: Attempting sign in for:', credentials.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      // Enhanced authentication data logging
      console.log('AuthService: Complete Supabase response:', {
        session: data.session ? {
          access_token: data.session.access_token ? 'Present' : 'Missing',
          refresh_token: data.session.refresh_token ? 'Present' : 'Missing',
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in,
          token_type: data.session.token_type,
          user_id: data.session.user?.id
        } : 'Missing',
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          user_metadata: data.user.user_metadata
        } : 'Missing',
        error: error?.message || 'None'
      });

      if (error) {
        console.error('AuthService: Sign in error:', error);
        return {
          user: null,
          error: this.mapSupabaseError(error)
        };
      }

      // Comprehensive session validation
      if (!data.user || !data.session) {
        console.error('AuthService: Incomplete authentication data:', {
          hasUser: !!data.user,
          hasSession: !!data.session,
          hasAccessToken: !!data.session?.access_token,
          hasRefreshToken: !!data.session?.refresh_token
        });
        return {
          user: null,
          error: { code: 'INCOMPLETE_AUTH', message: 'Authentication incomplete - missing session data' }
        };
      }

      // Verify all required authentication data is present
      if (!data.session.access_token || !data.session.refresh_token) {
        console.error('AuthService: Missing required tokens:', {
          hasAccessToken: !!data.session.access_token,
          hasRefreshToken: !!data.session.refresh_token
        });
        return {
          user: null,
          error: { code: 'MISSING_TOKENS', message: 'Authentication tokens missing' }
        };
      }
      console.log('AuthService: Sign in successful for user:', data.user.id);
      
      return {
        user: null, // User will be set by onAuthStateChange callback
        error: null
      };

    } catch (error) {
      console.error('AuthService: Unexpected sign in error:', error);
      return {
        user: null,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred during sign in'
        }
      };
    }
  }

  /**
   * Sign up new user
   */
  async signUp(credentials: SignupCredentials): Promise<{ success: boolean; error: AuthError | null }> {
    try {
      console.log('AuthService: Attempting sign up for:', credentials.email);

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name
          }
        }
      });

      if (error) {
        console.error('AuthService: Sign up error:', error);
        return {
          success: false,
          error: this.mapSupabaseError(error)
        };
      }

      if (!data.user) {
        console.error('AuthService: No user returned from sign up');
        return {
          success: false,
          error: { code: 'NO_USER', message: 'Registration failed' }
        };
      }

      console.log('AuthService: Sign up successful for user:', data.user.id);
      
      return {
        success: true,
        error: null
      };

    } catch (error) {
      console.error('AuthService: Unexpected sign up error:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred during registration'
        }
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      console.log('AuthService: Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthService: Sign out error:', error);
        return { error: this.mapSupabaseError(error) };
      }

      console.log('AuthService: Sign out successful');
      return { error: null };

    } catch (error) {
      console.error('AuthService: Unexpected sign out error:', error);
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred during sign out'
        }
      };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('AuthService: Get session error:', error);
        return { session: null, error: this.mapSupabaseError(error) };
      }

      return { session, error: null };
    } catch (error) {
      console.error('AuthService: Unexpected get session error:', error);
      return {
        session: null,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Failed to get current session'
        }
      };
    }
  }

  /**
   * Get user profile from users table
   */
  private async getUserProfile(userId: string): Promise<User | null> {
    try {
      console.log('AuthService: Getting user profile from database for:', userId);
      
      // Ensure we have a valid session before querying
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('AuthService: Session error when getting user profile:', sessionError);
        return null;
      }
      
      if (!session) {
        console.error('AuthService: No session available for user profile query');
        return null;
      }
      
      console.log('AuthService: Session confirmed, executing database query...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('AuthService: Database query result:', {
        hasData: !!data,
        userData: data,
        error: error?.message || 'None'
      });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('AuthService: User profile not found in database, will need to create one');
          return null;
        }
        console.error('AuthService: Get user profile database error:', error);
        return null;
      }

      if (!data) {
        console.log('AuthService: No user profile found in database for:', userId);
      } else {
        console.log('AuthService: User profile found:', data);
      }

      return data;
    } catch (error) {
      console.error('AuthService: Unexpected get user profile error:', error);
      return null;
    }
  }

  /**
   * Create user profile in users table
   */
  async createUserProfile(authUser: any): Promise<User | null> {
    const queryTimeout = 15000; // 15 second timeout for creation
    try {
      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        plan: 'free' as const
      };

      console.log('AuthService: Creating user profile:', userData);
      console.log('AuthService: Executing user creation query...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User creation query timeout')), queryTimeout);
      });
      
      // Race the query against the timeout
      const queryPromise = supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('AuthService: User creation completed with:', { hasData: !!data, error: error?.message || 'None' });

      console.log('AuthService: User creation query completed:', {
        hasData: !!data,
        userData: data,
        error: error?.message || 'None',
        errorCode: error?.code || 'None'
      });

      if (error) {
        // If user already exists, try to fetch it instead
        console.log('AuthService: User creation failed, checking if user exists...');
        if (error.code === '23505') {
          console.log('AuthService: User already exists, fetching existing profile...');
          return this.getUserProfileDirect(authUser.id);
        }
        
        console.error('AuthService: Create user profile error:', error);
        return null;
      }

      console.log('AuthService: User profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('AuthService: Unexpected create user profile error:', error);
      throw error; // Re-throw to be handled by caller
    }
  }

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    let isProcessing = false; // Prevent duplicate processing
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthService: Auth state changed (EVENT):', event); // NOVO LOG
      console.log('AuthService: Auth state changed (SESSION):', session); // NOVO LOG
      console.log('AuthService: Auth state changed:', event, session?.user?.id || 'No user');
      
      // Prevent duplicate processing of the same event
      if (isProcessing) {
        console.log('AuthService: Already processing auth state change, skipping...');
        return;
      }
      
      if (session?.user) {
        isProcessing = true;
        console.log('AuthService: Session found, getting user profile for:', session.user.id);
        
        try {
          // Get or create user profile using the provided session
          let userProfile = await this.getUserProfileWithSession(session.user.id, session);
          
          if (!userProfile) {
            console.log('AuthService: No user profile found, creating one...');
            try {
              userProfile = await this.createUserProfile(session.user);
            } catch (createError) {
              console.error('AuthService: User creation failed:', createError);
              // If user creation fails, create a minimal user object from auth data
              console.log('AuthService: Using fallback user object');
              userProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                plan: 'free' as const,
                stripe_customer_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
          }
          
          console.log('AuthService: Calling callback with user profile:', userProfile?.id || 'No profile');
          callback(userProfile);
        } catch (error) {
          console.error('AuthService: Error processing user profile:', error);
          // Create fallback user object
          const fallbackUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            plan: 'free' as const,
            stripe_customer_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          console.log('AuthService: Using fallback user due to error:', fallbackUser);
          callback(fallbackUser);
        } finally {
          isProcessing = false;
        }
      } else {
        console.log('AuthService: No session, calling callback with null');
        callback(null);
        isProcessing = false;
      }
    });
  }

  /**
   * Get user profile using a specific session context
   */
  private async getUserProfileWithSession(userId: string, session: any): Promise<User | null> {
    const queryTimeout = 10000; // 10 second timeout
    try {
      console.log('AuthService: Getting user profile with session context for:', userId);
      console.log('AuthService: Session details:', { hasAccessToken: !!session?.access_token, expiresAt: session?.expires_at });
      
      console.log('AuthService: Executing database query...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), queryTimeout);
      });
      
      // Race the query against the timeout
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('AuthService: Database query completed with:', { hasData: !!data, error: error?.message || 'None' });

      console.log('AuthService: Database query completed:', {
        hasData: !!data,
        userData: data,
        error: error?.message || 'None',
        errorCode: error?.code || 'None'
      });

      if (error) {
        console.log('AuthService: Database error details:', error);
        if (error.code === 'PGRST116') {
          console.log('AuthService: User profile not found in database, will need to create one');
          return null;
        }
        console.error('AuthService: Database error when getting user profile:', error);
        return null;
      }

      if (!data) {
        console.log('AuthService: No user profile data returned from database');
        return null;
      }

      console.log('AuthService: User profile found successfully:', data);
      return data;
    } catch (error) {
      console.error('AuthService: Exception in getUserProfileWithSession:', error);
      return null;
    }
  }

  /**
   * Get user profile directly without session context
   */
  private async getUserProfileDirect(userId: string): Promise<User | null> {
    const queryTimeout = 10000; // 10 second timeout
    try {
      console.log('AuthService: Getting user profile directly for:', userId);
      
      console.log('AuthService: Executing direct database query...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), queryTimeout);
      });
      
      // Race the query against the timeout
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('AuthService: Direct query completed with:', { hasData: !!data, error: error?.message || 'None' });

      if (error || !data) return null;
      return data;
    } catch (error) {
      console.error('AuthService: Error getting user profile directly:', error);
      return null;
    }
  }

  /**
   * Map Supabase errors to our error format
   */
  private mapSupabaseError(error: SupabaseAuthError): AuthError {
    const errorMap: Record<string, string> = {
      'invalid_credentials': 'Email ou senha incorretos',
      'email_not_confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'signup_disabled': 'Cadastro temporariamente desabilitado',
      'email_address_invalid': 'Endereço de email inválido',
      'password_too_short': 'Senha deve ter pelo menos 6 caracteres',
      'user_already_registered': 'Este email já está cadastrado'
    };

    return {
      code: error.message || 'UNKNOWN_ERROR',
      message: errorMap[error.message] || error.message || 'Erro desconhecido',
      details: error
    };
  }
}
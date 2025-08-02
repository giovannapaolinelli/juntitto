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
      
      // Step 1: Proper await with diagnostic logging
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      // Step 2: Comprehensive session logging
      console.log('AuthService: Supabase raw response:', {
        session: data.session ? 'Present' : 'Missing',
        user: data.user ? data.user.id : 'Missing',
        accessToken: data.session?.access_token ? 'Present' : 'Missing',
        refreshToken: data.session?.refresh_token ? 'Present' : 'Missing',
        error: error?.message || 'None'
      });

      if (error) {
        console.error('AuthService: Sign in error:', error);
        return {
          user: null,
          error: this.mapSupabaseError(error)
        };
      }

      // Step 3: Enhanced session validation
      if (!data.user || !data.session) {
        console.error('AuthService: Incomplete authentication data:', {
          hasUser: !!data.user,
          hasSession: !!data.session
        });
        return {
          user: null,
          error: { code: 'INCOMPLETE_AUTH', message: 'Authentication incomplete - missing session data' }
        };
      }

      console.log('AuthService: Sign in successful for user:', data.user.id);
      
      // Get user profile from our users table
      const userProfile = await this.getUserProfile(data.user.id);
      
      if (!userProfile) {
        console.warn('AuthService: No user profile found, but authentication succeeded');
      }
      
      return {
        user: userProfile,
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('AuthService: Get user profile error:', error);
        return null;
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
    try {
      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        plan: 'free' as const
      };

      console.log('AuthService: Creating user profile:', userData);

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('AuthService: Create user profile error:', error);
        return null;
      }

      console.log('AuthService: User profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('AuthService: Unexpected create user profile error:', error);
      return null;
    }
  }

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthService: Auth state changed:', event, session?.user?.id || 'No user');
      
      if (session?.user) {
        // Get or create user profile
        let userProfile = await this.getUserProfile(session.user.id);
        
        if (!userProfile) {
          console.log('AuthService: No user profile found, creating one...');
          userProfile = await this.createUserProfile(session.user);
        }
        
        callback(userProfile);
      } else {
        callback(null);
      }
    });
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
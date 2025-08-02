import React, { createContext, useContext } from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../data/supabase/client';
import { User } from '../models/User';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthenticatedUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleAuthenticatedUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthenticatedUser = async (authUser: any) => {
    try {
      console.log('Handling authenticated user:', authUser.id);
      
      // First, try to fetch existing user profile
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data) {
        console.log('Found existing user profile:', data);
        setUser(data);
      } else {
        console.log('No user profile found, creating new one...');
        // Create user profile if it doesn't exist
        await createUserProfile(authUser);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (authUser: any) => {
    try {
      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        plan: 'free'
      };

      console.log('Creating user profile with data:', userData);

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      console.log('Successfully created user profile:', data);
      setUser(data);
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      console.log('Starting signup process...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to create user');

      console.log('Signup successful, user created:', data.user.id);
      
      // User profile will be handled by the auth state change listener
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Starting login process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to sign in');

      console.log('Login successful:', data.user.id);
      
      // User profile will be handled by the auth state change listener
      // which will trigger handleAuthenticatedUser
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
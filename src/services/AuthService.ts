import { supabase } from '../data/supabase/client';
import { UserRepository } from '../data/supabase/repositories/UserRepository';
import { User } from '../models/User';

export class AuthService {
  private userRepository = new UserRepository();

  async signUp(email: string, password: string, name: string): Promise<User> {
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

    // Create user profile
    const user = await this.userRepository.createUser({
      id: data.user.id,
      email: data.user.email!,
      name
    });

    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    const user = await this.userRepository.getCurrentUser();
    if (!user) throw new Error('User profile not found');

    return user;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.userRepository.getCurrentUser();
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    return this.userRepository.updateUser(user.id, updates);
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}
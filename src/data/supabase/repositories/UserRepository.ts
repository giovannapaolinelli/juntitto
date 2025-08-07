import { supabase } from '../client';
import { Database } from '../types';
import { User } from '../../../models/User';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserRepository {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return this.mapToUser(data);
  }

  async createUser(userData: {
    id: string;
    email: string;
    name: string;
  }): Promise<User> {
    const insertData: UserInsert = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      plan: 'free'
    };

    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapToUser(data);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const updateData: UserUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToUser(data);
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      console.log('UserRepository: Getting user by ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('UserRepository: User not found in database');
          return null;
        }
        console.error('UserRepository: Error getting user by ID:', error);
        throw error;
      }

      console.log('UserRepository: User found successfully');
      return this.mapToUser(data);
    } catch (error) {
      console.error('UserRepository: Exception in getUserById:', error);
      return null;
    }
  }

  async getUserUsage(userId: string): Promise<{
    quiz_count: number;
    total_guests: number;
  }> {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('guest_count')
      .eq('user_id', userId);

    if (error) throw error;

    const quiz_count = quizzes.length;
    const total_guests = quizzes.reduce((sum, quiz) => sum + quiz.guest_count, 0);

    return { quiz_count, total_guests };
  }

  private mapToUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      plan: row.plan as 'free' | 'starter' | 'pro' | 'premium',
      stripe_customer_id: row.stripe_customer_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
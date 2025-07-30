import { supabase } from '../client';
import { User } from '../../../models/User';

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
    return data;
  }

  async createUser(userData: {
    id: string;
    email: string;
    name: string;
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        plan: 'free'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
}
import { supabase } from '../client';
import { Theme } from '../../../models/Quiz';

export class ThemeRepository {
  async getAllThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('is_premium', { ascending: true })
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getFreeThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('is_premium', false)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getThemeById(id: string): Promise<Theme | null> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}
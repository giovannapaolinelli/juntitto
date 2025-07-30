import { supabase } from '../client';
import { Database } from '../types';
import { Theme } from '../../../models/Quiz';

type ThemeRow = Database['public']['Tables']['themes']['Row'];

export class ThemeRepository {
  async getAllThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('is_premium', { ascending: true })
      .order('name');

    if (error) throw error;
    return (data || []).map(this.mapToTheme);
  }

  async getFreeThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('is_premium', false)
      .order('name');

    if (error) throw error;
    return (data || []).map(this.mapToTheme);
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
    return this.mapToTheme(data);
  }

  private mapToTheme(row: ThemeRow): Theme {
    return {
      id: row.id,
      name: row.name,
      primary_color: row.primary_color,
      secondary_color: row.secondary_color,
      background_color: row.background_color,
      text_color: row.text_color,
      is_premium: row.is_premium,
      price: row.price
    };
  }
}
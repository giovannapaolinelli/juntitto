import { supabase } from '../client';
import { Database } from '../types';
import { Quiz, Question } from '../../../models/Quiz';

type QuizRow = Database['public']['Tables']['quizzes']['Row'];
type QuizInsert = Database['public']['Tables']['quizzes']['Insert'];
type QuizUpdate = Database['public']['Tables']['quizzes']['Update'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type QuestionUpdate = Database['public']['Tables']['questions']['Update'];

export class QuizRepository {
  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        theme:themes(*),
        questions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('QuizRepository: Error fetching user quizzes:', error);
      throw new Error(`Failed to fetch quizzes: ${error.message}`);
    }

    return (data || []).map(this.mapToQuiz);
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        theme:themes(*),
        questions(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapToQuiz(data);
  }

  async getQuizBySlug(slug: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        theme:themes(*),
        questions(*)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapToQuiz(data);
  }

  async createQuiz(quizData: {
    title: string;
    slug: string;
    description?: string;
    event_date: string;
    status?: string;
    user_id: string;
    theme_id: string;
    photo_url?: string;
    password?: string;
    max_guests?: number;
    guest_count?: number;
  }): Promise<Quiz> {
    const insertData: QuizInsert = {
      title: quizData.title,
      slug: quizData.slug,
      description: quizData.description,
      event_date: quizData.event_date,
      status: quizData.status || 'draft',
      user_id: quizData.user_id,
      theme_id: quizData.theme_id,
      photo_url: quizData.photo_url,
      password: quizData.password,
      max_guests: quizData.max_guests || 30,
      guest_count: quizData.guest_count || 0
    };

    const { data, error } = await supabase
      .from('quizzes')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapToQuiz(data);
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const updateData: QuizUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToQuiz(data);
  }

  async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async createQuestion(questionData: {
    quiz_id: string;
    text: string;
    type?: string;
    options?: string[];
    correct_answer?: number;
    order: number;
    photo_url?: string;
  }): Promise<Question> {
    const insertData: QuestionInsert = {
      quiz_id: questionData.quiz_id,
      text: questionData.text,
      type: questionData.type || 'multiple_choice',
      options: questionData.options || [],
      correct_answer: questionData.correct_answer || 0,
      order_index: questionData.order,
      photo_url: questionData.photo_url
    };

    const { data, error } = await supabase
      .from('questions')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapToQuestion(data);
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const updateData: QuestionUpdate = {
      text: updates.text,
      type: updates.type,
      options: updates.options,
      correct_answer: updates.correctAnswer,
      order_index: updates.order,
      photo_url: updates.photo_url
    };

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToQuestion(data);
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50); // Limita tamanho

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('slug', slug)
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('QuizRepository: Error checking slug uniqueness:', error);
        throw new Error('Failed to validate slug uniqueness');
      }

      if (!data || data.length === 0) break; // Slug é único
      
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Previne loop infinito
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    return slug;
  }

  async incrementGuestCount(quizId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_guest_count', {
      quiz_id: quizId
    });

    if (error) throw error;
  }

  private mapToQuiz(row: any): Quiz {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      event_date: row.event_date,
      status: row.status as 'draft' | 'active' | 'completed',
      user_id: row.user_id,
      theme_id: row.theme_id,
      photo_url: row.photo_url,
      password: row.password,
      max_guests: row.max_guests,
      guest_count: row.guest_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      theme: row.theme ? {
        id: row.theme.id,
        name: row.theme.name,
        primary_color: row.theme.primary_color,
        secondary_color: row.theme.secondary_color,
        background_color: row.theme.background_color,
        text_color: row.theme.text_color,
        is_premium: row.theme.is_premium,
        price: row.theme.price
      } : undefined,
      questions: row.questions ? row.questions.map(q => this.mapToQuestion(q)) : undefined
    };
  }

  private mapToQuestion(row: QuestionRow): Question {
    return {
      id: row.id,
      quiz_id: row.quiz_id,
      text: row.text,
      type: row.type as 'multiple_choice' | 'text',
      options: row.options as string[],
      correctAnswer: row.correct_answer,
      order: row.order_index,
      photo_url: row.photo_url,
      created_at: row.created_at
    };
  }
}
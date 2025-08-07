import { supabase } from '../data/supabase/client';
import { Quiz, Question, Answer, Theme } from '../models/Quiz';

export class QuizManagementService {
  private static instance: QuizManagementService;

  private constructor() {}

  public static getInstance(): QuizManagementService {
    if (!QuizManagementService.instance) {
      QuizManagementService.instance = new QuizManagementService();
    }
    return QuizManagementService.instance;
  }

  // Quiz CRUD Operations
  async createQuiz(quizData: {
    title: string;
    description?: string;
    event_date: string;
    user_id: string;
    theme_id: string;
  }): Promise<Quiz> {
    console.log('QuizManagementService: Creating quiz with data:', quizData);
    
    // Validação básica
    if (!quizData.title?.trim()) {
      throw new Error('Quiz title is required');
    }
    
    if (!quizData.user_id) {
      throw new Error('User ID is required');
    }
    
    if (!quizData.theme_id) {
      throw new Error('Theme ID is required');
    }

    const slug = await this.generateUniqueSlug(quizData.title);
    console.log('QuizManagementService: Generated unique slug:', slug);
    
    const insertData = {
      title: quizData.title.trim(),
      slug,
      description: quizData.description?.trim() || null,
      event_date: quizData.event_date,
      status: 'draft' as const,
      user_id: quizData.user_id,
      theme_id: quizData.theme_id,
      max_guests: 30,
      guest_count: 0
    };
    
    console.log('QuizManagementService: Inserting quiz data:', insertData);
    
    const { data, error } = await supabase
      .from('quizzes')
      .insert(insertData)
      .select(`
        *,
        theme:themes(*),
        questions(*)
      `)
      .single();

    if (error) {
      console.error('QuizManagementService: Error creating quiz:', error);
      if (error.code === '23505') {
        throw new Error('Quiz with this title already exists. Please choose a different title.');
      }
      throw new Error(`Failed to create quiz: ${error.message}`);
    }
    
    console.log('QuizManagementService: Quiz created successfully:', data);
    return this.mapToQuiz(data);
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    console.log('QuizManagementService: Updating quiz:', id, updates);
    
    if (!id) {
      throw new Error('Quiz ID is required');
    }
    
    // Limpa campos vazios
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    cleanUpdates.updated_at = new Date().toISOString();
    
    console.log('QuizManagementService: Clean updates:', cleanUpdates);
    
    const { data, error } = await supabase
      .from('quizzes')
      .update(cleanUpdates)
      .eq('id', id)
      .select(`
        *,
        theme:themes(*),
        questions(*)
      `)
      .single();

    if (error) {
      console.error('QuizManagementService: Error updating quiz:', error);
      throw new Error(`Failed to update quiz: ${error.message}`);
    }
    
    console.log('QuizManagementService: Quiz updated successfully:', data);
    return this.mapToQuiz(data);
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    console.log('QuizManagementService: Fetching quiz by ID:', id);
    
    if (!id) {
      console.warn('QuizManagementService: No ID provided');
      return null;
    }
    
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        theme:themes(*),
        questions(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('QuizManagementService: Error fetching quiz:', error);
      if (error.code === 'PGRST116') {
        console.log('QuizManagementService: Quiz not found');
        return null;
      }
      throw new Error(`Failed to fetch quiz: ${error.message}`);
    }
    
    if (!data) {
      console.log('QuizManagementService: Quiz not found');
      return null;
    }
    
    console.log('QuizManagementService: Quiz fetched successfully:', data);
    return this.mapToQuiz(data);
  }

  // Question CRUD Operations
  async addQuestion(quizId: string, questionData: {
    text: string;
    options: string[];
    correctAnswer: number;
  }): Promise<Question> {
    console.log('QuizManagementService: Adding question to quiz:', quizId, questionData);
    
    // Validação
    if (!questionData.text?.trim()) {
      throw new Error('Question text is required');
    }
    
    if (!questionData.options || questionData.options.length < 2) {
      throw new Error('Question must have at least 2 options');
    }
    
    if (questionData.correctAnswer < 0 || questionData.correctAnswer >= questionData.options.length) {
      throw new Error('Invalid correct answer index');
    }

    // Get current quiz to determine order
    const currentQuiz = await this.getQuizById(quizId);
    if (!currentQuiz) throw new Error('Quiz not found');

    const orderIndex = (currentQuiz.questions?.length || 0) + 1;
    
    const insertData = {
      quiz_id: quizId,
      text: questionData.text.trim(),
      type: 'multiple_choice' as const,
      order_index: orderIndex,
      options: questionData.options.filter(opt => opt.trim()),
      correct_answer: questionData.correctAnswer
    };
    
    console.log('QuizManagementService: Inserting question data:', insertData);

    const { data, error } = await supabase
      .from('questions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('QuizManagementService: Error adding question:', error);
      throw new Error(`Failed to add question: ${error.message}`);
    }
    
    console.log('QuizManagementService: Question added successfully:', data);
    return this.mapToQuestion(data);
  }

  async updateQuestion(id: string, updates: {
    text?: string;
    options?: string[];
    correctAnswer?: number;
  }): Promise<Question> {
    const updateData: any = {};
    
    if (updates.text) {
      updateData.text = updates.text;
    }
    
    if (updates.options) {
      updateData.options = updates.options;
    }
    
    if (updates.correctAnswer !== undefined) {
      updateData.correct_answer = updates.correctAnswer;
    }

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (questionError) throw questionError;

    return this.mapToQuestion(questionData);
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Theme Operations
  async getThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('is_premium', { ascending: true })
      .order('name');

    if (error) throw error;
    return (data || []).map(this.mapToTheme);
  }

  // Utility Methods
  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await supabase
        .from('quizzes')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!data) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Validation Methods
  validateQuiz(quiz: Quiz): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!quiz.title?.trim()) {
      errors.push('Quiz title is required');
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      errors.push('Quiz must have at least one question');
    }

    quiz.questions?.forEach((question, index) => {
      if (!question.text?.trim()) {
        errors.push(`Question ${index + 1} text is required`);
      }

      if (!question.options || question.options.length < 2) {
        errors.push(`Question ${index + 1} must have at least 2 answers`);
      }

      if (question.correct_answer < 0 || question.correct_answer >= (question.options?.length || 0)) {
        errors.push(`Question ${index + 1} must have one correct answer`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Mapping Methods
  private mapToQuiz(data: any): Quiz {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      event_date: data.event_date,
      status: data.status,
      user_id: data.user_id,
      theme_id: data.theme_id,
      photo_url: data.photo_url,
      password: data.password,
      max_guests: data.max_guests,
      guest_count: data.guest_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
      theme: data.theme ? this.mapToTheme(data.theme) : undefined,
      questions: data.questions ? data.questions.map(this.mapToQuestion) : []
    };
  }

  private mapToQuestion(data: any): Question {
    return {
      id: data.id,
      quiz_id: data.quiz_id,
      text: data.text,
      type: data.type,
      options: data.options || [],
      correct_answer: data.correct_answer,
      order_index: data.order_index,
      photo_url: data.photo_url,
      created_at: data.created_at
    };
  }

  private mapToTheme(data: any): Theme {
    return {
      id: data.id,
      name: data.name,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      background_color: data.background_color,
      text_color: data.text_color,
      is_premium: data.is_premium,
      price: data.price
    };
  }
}
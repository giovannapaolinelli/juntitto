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
    const slug = await this.generateUniqueSlug(quizData.title);
    
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.title,
        slug,
        description: quizData.description,
        event_date: quizData.event_date,
        status: 'draft',
        user_id: quizData.user_id,
        theme_id: quizData.theme_id,
        max_guests: 30,
        guest_count: 0
      })
      .select(`
        *,
        theme:themes(*),
        questions(
          *,
          answers(*)
        )
      `)
      .single();

    if (error) throw error;
    return this.mapToQuiz(data);
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        theme:themes(*),
        questions(
          *,
          answers(*)
        )
      `)
      .single();

    if (error) throw error;
    return this.mapToQuiz(data);
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        theme:themes(*),
        questions(
          *,
          answers(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapToQuiz(data);
  }

  // Question CRUD Operations
  async createQuestion(questionData: {
    quiz_id: string;
    text: string;
    type?: string;
    order_index: number;
    answers: { text: string; is_correct: boolean }[];
  }): Promise<Question> {
    const { data: questionData_result, error: questionError } = await supabase
      .from('questions')
      .insert({
        quiz_id: questionData.quiz_id,
        text: questionData.text,
        type: questionData.type || 'multiple_choice',
        order_index: questionData.order_index,
        options: questionData.answers.map(a => a.text),
        correct_answer: questionData.answers.findIndex(a => a.is_correct)
      })
      .select()
      .single();

    if (questionError) throw questionError;

    // Create answers
    const answersToInsert = questionData.answers.map((answer, index) => ({
      question_id: questionData_result.id,
      text: answer.text,
      is_correct: answer.is_correct,
      order_index: index
    }));

    const { data: answersData, error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert)
      .select();

    if (answersError) throw answersError;

    return {
      ...this.mapToQuestion(questionData_result),
      answers: answersData.map(this.mapToAnswer)
    };
  }

  async updateQuestion(id: string, updates: {
    text?: string;
    answers?: { text: string; is_correct: boolean }[];
  }): Promise<Question> {
    const updateData: any = {};
    
    if (updates.text) {
      updateData.text = updates.text;
    }
    
    if (updates.answers) {
      updateData.options = updates.answers.map(a => a.text);
      updateData.correct_answer = updates.answers.findIndex(a => a.is_correct);
    }

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (questionError) throw questionError;

    // Update answers if provided
    if (updates.answers) {
      // Delete existing answers
      await supabase
        .from('answers')
        .delete()
        .eq('question_id', id);

      // Create new answers
      const answersToInsert = updates.answers.map((answer, index) => ({
        question_id: id,
        text: answer.text,
        is_correct: answer.is_correct,
        order_index: index
      }));

      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert)
        .select();

      if (answersError) throw answersError;

      return {
        ...this.mapToQuestion(questionData),
        answers: answersData.map(this.mapToAnswer)
      };
    }

    return this.mapToQuestion(questionData);
  }

  async deleteQuestion(id: string): Promise<void> {
    // Delete answers first (cascade should handle this, but being explicit)
    await supabase
      .from('answers')
      .delete()
      .eq('question_id', id);

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

      if (!question.answers || question.answers.length < 2) {
        errors.push(`Question ${index + 1} must have at least 2 answers`);
      }

      const hasCorrectAnswer = question.answers?.some(a => a.is_correct);
      if (!hasCorrectAnswer) {
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
      questions: data.questions ? data.questions.map((q: any) => ({
        ...this.mapToQuestion(q),
        answers: q.answers ? q.answers.map(this.mapToAnswer) : []
      })) : []
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

  private mapToAnswer(data: any): Answer {
    return {
      id: data.id,
      question_id: data.question_id,
      text: data.text,
      is_correct: data.is_correct,
      order_index: data.order_index,
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
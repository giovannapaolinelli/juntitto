import { supabase } from '../client';
import { Database } from '../types';

type QuestionRow = Database['public']['Tables']['questions']['Row'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type QuestionUpdate = Database['public']['Tables']['questions']['Update'];

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  created_at: string;
}

export class QuestionRepository {
  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapToQuestion);
  }

  async createQuestion(questionData: {
    quiz_id: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
  }): Promise<Question> {
    // Validação antes de inserir
    this.validateQuestionData(questionData);

    const insertData: QuestionInsert = {
      quiz_id: questionData.quiz_id,
      question_text: questionData.question_text.trim(),
      options: questionData.options,
      correct_option_index: questionData.correct_option_index
    };

    const { data, error } = await supabase
      .from('questions')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapToQuestion(data);
  }

  async updateQuestion(id: string, updates: {
    question_text?: string;
    options?: string[];
    correct_option_index?: number;
  }): Promise<Question> {
    // Validação dos dados de atualização
    if (updates.question_text !== undefined && !updates.question_text.trim()) {
      throw new Error('Texto da pergunta não pode estar vazio');
    }

    if (updates.options !== undefined) {
      const validOptions = updates.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        throw new Error('Pergunta deve ter pelo menos 2 opções');
      }
      updates.options = validOptions;
    }

    if (updates.correct_option_index !== undefined && updates.options) {
      if (updates.correct_option_index < 0 || updates.correct_option_index >= updates.options.length) {
        throw new Error('Índice da resposta correta é inválido');
      }
    }

    const updateData: QuestionUpdate = {};
    if (updates.question_text !== undefined) {
      updateData.question_text = updates.question_text.trim();
    }
    if (updates.options !== undefined) {
      updateData.options = updates.options;
    }
    if (updates.correct_option_index !== undefined) {
      updateData.correct_option_index = updates.correct_option_index;
    }

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

  async deleteQuestionsByQuizId(quizId: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', quizId);

    if (error) throw error;
  }

  async upsertQuestions(quizId: string, questions: Array<{
    id?: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
  }>): Promise<Question[]> {
    // Validar todas as perguntas antes de salvar
    questions.forEach((q, index) => {
      try {
        this.validateQuestionData({
          quiz_id: quizId,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index
        });
      } catch (error) {
        throw new Error(`Pergunta ${index + 1}: ${error.message}`);
      }
    });

    const upsertData = questions.map(q => {
      const data: any = {
        quiz_id: quizId,
        question_text: q.question_text.trim(),
        options: q.options.filter(opt => opt.trim()),
        correct_option_index: q.correct_option_index
      };
      
      // Only include id for existing questions (updates)
      if (q.id) {
        data.id = q.id;
      }
      
      return data;
    });

    const { data, error } = await supabase
      .from('questions')
      .upsert(upsertData, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return (data || []).map(this.mapToQuestion);
  }

  private validateQuestionData(questionData: {
    quiz_id: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
  }): void {
    if (!questionData.quiz_id) {
      throw new Error('ID do quiz é obrigatório');
    }

    if (!questionData.question_text || !questionData.question_text.trim()) {
      throw new Error('Texto da pergunta é obrigatório');
    }

    if (!Array.isArray(questionData.options)) {
      throw new Error('Opções devem ser um array');
    }

    const validOptions = questionData.options.filter(opt => opt && opt.trim());
    if (validOptions.length < 2) {
      throw new Error('Pergunta deve ter pelo menos 2 opções válidas');
    }

    if (questionData.correct_option_index < 0 || questionData.correct_option_index >= validOptions.length) {
      throw new Error('Índice da resposta correta deve corresponder a uma opção válida');
    }
  }

  private mapToQuestion(row: QuestionRow): Question {
    return {
      id: row.id,
      quiz_id: row.quiz_id,
      question_text: row.question_text,
      options: Array.isArray(row.options) ? row.options as string[] : [],
      correct_option_index: row.correct_option_index,
      created_at: row.created_at
    };
  }
}
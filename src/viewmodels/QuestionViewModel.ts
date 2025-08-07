import { useState } from 'react';
import { QuestionService } from '../services/QuestionService';
import { Question } from '../data/supabase/repositories/QuestionRepository';

export class QuestionViewModel {
  private questionService = new QuestionService();

  constructor(
    private setQuestions: (questions: Question[]) => void,
    private setLoading: (loading: boolean) => void,
    private setError: (error: string | null) => void,
    private setSaving: (saving: boolean) => void
  ) {}

  async loadQuestions(quizId: string): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const questions = await this.questionService.getQuestionsByQuizId(quizId);
      this.setQuestions(questions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar perguntas';
      this.setError(errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  async saveQuestions(quizId: string, questions: Array<{
    id?: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
  }>): Promise<Question[]> {
    this.setSaving(true);
    this.setError(null);

    try {
      const savedQuestions = await this.questionService.saveQuestionsForQuiz(quizId, questions);
      this.setQuestions(savedQuestions);
      return savedQuestions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar perguntas';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  async createQuestion(questionData: {
    quiz_id: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
  }): Promise<Question> {
    this.setSaving(true);
    this.setError(null);

    try {
      const question = await this.questionService.createQuestion(questionData);
      return question;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar pergunta';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  async updateQuestion(id: string, updates: {
    question_text?: string;
    options?: string[];
    correct_option_index?: number;
  }): Promise<Question> {
    this.setSaving(true);
    this.setError(null);

    try {
      const question = await this.questionService.updateQuestion(id, updates);
      return question;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar pergunta';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    this.setSaving(true);
    this.setError(null);

    try {
      await this.questionService.deleteQuestion(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir pergunta';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }
}

export const useQuestionViewModel = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewModel] = useState(() => 
    new QuestionViewModel(setQuestions, setLoading, setError, setSaving)
  );

  return {
    questions,
    loading,
    saving,
    error,
    loadQuestions: viewModel.loadQuestions.bind(viewModel),
    saveQuestions: viewModel.saveQuestions.bind(viewModel),
    createQuestion: viewModel.createQuestion.bind(viewModel),
    updateQuestion: viewModel.updateQuestion.bind(viewModel),
    deleteQuestion: viewModel.deleteQuestion.bind(viewModel),
    clearError: () => setError(null)
  };
};
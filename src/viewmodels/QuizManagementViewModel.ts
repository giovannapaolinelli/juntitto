import { useState, useEffect } from 'react';
import { QuizManagementService } from '../services/QuizManagementService';
import { Quiz, Question, Theme } from '../models/Quiz';

export class QuizManagementViewModel {
  private quizService = QuizManagementService.getInstance();

  constructor(
    private setQuiz: (quiz: Quiz | null) => void,
    private setThemes: (themes: Theme[]) => void,
    private setLoading: (loading: boolean) => void,
    private setError: (error: string | null) => void,
    private setSaving: (saving: boolean) => void
  ) {}

  async loadQuiz(id: string): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const quiz = await this.quizService.getQuizById(id);
      this.setQuiz(quiz);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load quiz');
    } finally {
      this.setLoading(false);
    }
  }

  async loadThemes(): Promise<void> {
    try {
      const themes = await this.quizService.getThemes();
      this.setThemes(themes);
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  }

  async createQuiz(quizData: {
    title: string;
    description?: string;
    event_date: string;
    user_id: string;
    theme_id: string;
  }): Promise<Quiz> {
    this.setSaving(true);
    this.setError(null);

    try {
      const quiz = await this.quizService.createQuiz(quizData);
      this.setQuiz(quiz);
      return quiz;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create quiz';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    this.setSaving(true);
    this.setError(null);

    try {
      const quiz = await this.quizService.updateQuiz(id, updates);
      this.setQuiz(quiz);
      return quiz;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quiz';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  async addQuestion(quizId: string, questionData: {
    text: string;
    options: string[];
    correctAnswer: number;
  }): Promise<void> {
    this.setSaving(true);
    this.setError(null);

    try {
      await this.quizService.addQuestion(quizId, questionData);

      // Reload quiz to get updated data
      await this.loadQuiz(quizId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add question';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  async updateQuestion(questionId: string, updates: {
    text?: string;
    options?: string[];
    correctAnswer?: number;
  }): Promise<void> {
    this.setSaving(true);
    this.setError(null);

    try {
      await this.quizService.updateQuestion(questionId, updates);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update question';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  async deleteQuestion(questionId: string, quizId: string): Promise<void> {
    this.setSaving(true);
    this.setError(null);

    try {
      await this.quizService.deleteQuestion(questionId);
      // Reload quiz to get updated data
      await this.loadQuiz(quizId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete question';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setSaving(false);
    }
  }

  validateQuiz(quiz: Quiz): { isValid: boolean; errors: string[] } {
    return this.quizService.validateQuiz(quiz);
  }
}

export const useQuizManagementViewModel = (quizId?: string) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewModel] = useState(() => 
    new QuizManagementViewModel(setQuiz, setThemes, setLoading, setError, setSaving)
  );

  useEffect(() => {
    viewModel.loadThemes();
    if (quizId) {
      viewModel.loadQuiz(quizId);
    }
  }, [quizId, viewModel]);

  return {
    quiz,
    themes,
    loading,
    saving,
    error,
    createQuiz: viewModel.createQuiz.bind(viewModel),
    updateQuiz: viewModel.updateQuiz.bind(viewModel),
    addQuestion: viewModel.addQuestion.bind(viewModel),
    updateQuestion: viewModel.updateQuestion.bind(viewModel),
    deleteQuestion: viewModel.deleteQuestion.bind(viewModel),
    validateQuiz: viewModel.validateQuiz.bind(viewModel),
    loadQuiz: viewModel.loadQuiz.bind(viewModel)
  };
};
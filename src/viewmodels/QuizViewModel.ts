import { useState, useEffect } from 'react';
import { QuizService } from '../services/QuizService';
import { ResultService } from '../services/ResultService';
import { ThemeRepository } from '../data/supabase/repositories/ThemeRepository';
import { Quiz, Question, Theme, QuizStats } from '../models/Quiz';

export class QuizViewModel {
  private quizService = new QuizService();
  private resultService = new ResultService();
  private themeRepository = new ThemeRepository();

  constructor(
    private setQuizzes: (quizzes: Quiz[]) => void,
    private setLoading: (loading: boolean) => void,
    private setError: (error: string | null) => void
  ) {}

  async loadUserQuizzes(userId: string): Promise<void> {
    if (!userId) {
      console.error('QuizViewModel: No user ID provided');
      this.setError('User authentication required');
      this.setLoading(false);
      return;
    }

    console.log('QuizViewModel: Loading quizzes for user:', userId);
    this.setLoading(true);
    this.setError(null);

    try {
      const quizzes = await this.quizService.getUserQuizzes(userId);
      console.log('QuizViewModel: Loaded quizzes:', quizzes.length);
      this.setQuizzes(quizzes);
    } catch (error) {
      console.error('QuizViewModel: Error loading quizzes:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to load quizzes');
    } finally {
      this.setLoading(false);
    }
  }

  async createQuiz(userId: string, quizData: {
    title: string;
    description?: string;
    event_date: string;
    theme_id: string;
    questions: Omit<Question, 'id' | 'quiz_id' | 'created_at'>[];
  }): Promise<Quiz> {
    return this.quizService.createQuiz(userId, quizData);
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    return this.quizService.updateQuiz(id, updates);
  }

  async deleteQuiz(id: string): Promise<void> {
    return this.quizService.deleteQuiz(id);
  }

  async publishQuiz(id: string): Promise<Quiz> {
    return this.quizService.publishQuiz(id);
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    return this.quizService.getQuizById(id);
  }

  async getQuizBySlug(slug: string): Promise<Quiz | null> {
    return this.quizService.getQuizBySlug(slug);
  }

  async getThemes(): Promise<Theme[]> {
    return this.themeRepository.getAllThemes();
  }

  async getFreeThemes(): Promise<Theme[]> {
    return this.themeRepository.getFreeThemes();
  }

  async getQuizStats(quizId: string): Promise<QuizStats> {
    return this.resultService.getQuizStats(quizId);
  }

  async getLeaderboard(quizId: string, limit = 10) {
    return this.resultService.getLeaderboard(quizId, limit);
  }
}

export const useQuizViewModel = (userId?: string) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizViewModel] = useState(() => new QuizViewModel(setQuizzes, setLoading, setError));

  useEffect(() => {
    if (userId) {
      quizViewModel.loadUserQuizzes(userId);
    }
  }, [userId, quizViewModel]);

  return {
    quizzes,
    loading,
    error,
    createQuiz: quizViewModel.createQuiz.bind(quizViewModel),
    updateQuiz: quizViewModel.updateQuiz.bind(quizViewModel),
    deleteQuiz: quizViewModel.deleteQuiz.bind(quizViewModel),
    publishQuiz: quizViewModel.publishQuiz.bind(quizViewModel),
    getQuizById: quizViewModel.getQuizById.bind(quizViewModel),
    getQuizBySlug: quizViewModel.getQuizBySlug.bind(quizViewModel),
    getThemes: quizViewModel.getThemes.bind(quizViewModel),
    getFreeThemes: quizViewModel.getFreeThemes.bind(quizViewModel),
    getQuizStats: quizViewModel.getQuizStats.bind(quizViewModel),
    getLeaderboard: quizViewModel.getLeaderboard.bind(quizViewModel),
    refreshQuizzes: () => userId && quizViewModel.loadUserQuizzes(userId)
  };
};
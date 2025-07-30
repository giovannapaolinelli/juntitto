import { useState } from 'react';
import { ResultService } from '../services/ResultService';
import { QuizService } from '../services/QuizService';
import { Quiz, QuizResult } from '../models/Quiz';

export class GuestViewModel {
  private resultService = new ResultService();
  private quizService = new QuizService();

  constructor(
    private setQuiz: (quiz: Quiz | null) => void,
    private setLoading: (loading: boolean) => void,
    private setError: (error: string | null) => void
  ) {}

  async loadQuiz(slug: string): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const quiz = await this.quizService.getQuizBySlug(slug);
      if (!quiz) {
        this.setError('Quiz not found or not active');
        return;
      }
      this.setQuiz(quiz);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load quiz');
    } finally {
      this.setLoading(false);
    }
  }

  async validateGuestName(quizId: string, guestName: string): Promise<boolean> {
    return this.resultService.validateGuestName(quizId, guestName);
  }

  async submitResult(
    quizId: string,
    guestName: string,
    answers: number[],
    timeSpent: number
  ): Promise<QuizResult> {
    // Get guest IP (in production, this would be handled server-side)
    const guestIp = await this.getGuestIp();
    
    return this.resultService.submitQuizResult(
      quizId,
      guestName,
      guestIp,
      answers,
      timeSpent
    );
  }

  async getLeaderboard(quizId: string, limit = 10) {
    return this.resultService.getLeaderboard(quizId, limit);
  }

  private async getGuestIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

export const useGuestViewModel = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestViewModel] = useState(() => new GuestViewModel(setQuiz, setLoading, setError));

  return {
    quiz,
    loading,
    error,
    loadQuiz: guestViewModel.loadQuiz.bind(guestViewModel),
    validateGuestName: guestViewModel.validateGuestName.bind(guestViewModel),
    submitResult: guestViewModel.submitResult.bind(guestViewModel),
    getLeaderboard: guestViewModel.getLeaderboard.bind(guestViewModel)
  };
};
import { ResultRepository } from '../data/supabase/repositories/ResultRepository';
import { QuizRepository } from '../data/supabase/repositories/QuizRepository';
import { QuizResult, QuizStats } from '../models/Quiz';

export class ResultService {
  private resultRepository = new ResultRepository();
  private quizRepository = new QuizRepository();

  async submitQuizResult(
    quizId: string,
    guestName: string,
    guestIp: string,
    answers: number[],
    timeSpent: number
  ): Promise<QuizResult> {
    // Get quiz to calculate score
    const quiz = await this.quizRepository.getQuizById(quizId);
    if (!quiz) throw new Error('Quiz not found');

    if (quiz.status !== 'active') {
      throw new Error('Quiz is not active');
    }

    // Check guest limit
    if (quiz.guest_count >= quiz.max_guests) {
      throw new Error('Quiz has reached maximum number of guests');
    }

    // Calculate score
    const score = this.calculateScore(answers, quiz.questions || []);

    // Create result
    const result = await this.resultRepository.createResult({
      quiz_id: quizId,
      guest_name: guestName,
      guest_ip: guestIp,
      answers,
      score,
      time_spent: timeSpent
    });

    // Increment guest count
    await this.quizRepository.incrementGuestCount(quizId);

    return result;
  }

  async getQuizResults(quizId: string, page = 1, limit = 50): Promise<QuizResult[]> {
    return this.resultRepository.getQuizResults(quizId, page, limit);
  }

  async getQuizStats(quizId: string): Promise<QuizStats> {
    return this.resultRepository.getQuizStats(quizId);
  }

  async getLeaderboard(quizId: string, limit = 10): Promise<(QuizResult & { position: number })[]> {
    return this.resultRepository.getLeaderboard(quizId, limit);
  }

  private calculateScore(answers: number[], questions: any[]): number {
    if (questions.length === 0) return 0;

    let correct = 0;
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correct_answer) {
        correct++;
      }
    });

    return Math.round((correct / questions.length) * 100);
  }

  async validateGuestName(quizId: string, guestName: string): Promise<boolean> {
    try {
      const results = await this.resultRepository.getQuizResults(quizId);
      return !results.some(result => result.guest_name === guestName);
    } catch {
      return true;
    }
  }
}
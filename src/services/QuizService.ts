import { QuizRepository } from '../data/supabase/repositories/QuizRepository';
import { UserRepository } from '../data/supabase/repositories/UserRepository';
import { ThemeRepository } from '../data/supabase/repositories/ThemeRepository';
import { Quiz, Question } from '../models/Quiz';

export class QuizService {
  private quizRepository = new QuizRepository();
  private userRepository = new UserRepository();
  private themeRepository = new ThemeRepository();

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return this.quizRepository.getUserQuizzes(userId);
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    return this.quizRepository.getQuizById(id);
  }

  async getQuizBySlug(slug: string): Promise<Quiz | null> {
    return this.quizRepository.getQuizBySlug(slug);
  }

  async createQuiz(userId: string, quizData: {
    title: string;
    description?: string;
    event_date: string;
    theme_id: string;
    questions: Omit<Question, 'id' | 'quiz_id' | 'created_at'>[];
  }): Promise<Quiz> {
    // Check user limits
    const usage = await this.userRepository.getUserUsage(userId);
    const user = await this.userRepository.getCurrentUser();
    
    if (!user) throw new Error('User not found');

    const limits = this.getPlanLimits(user.plan);
    if (usage.quiz_count >= limits.max_quizzes) {
      throw new Error('Quiz limit exceeded for your plan');
    }

    // Generate unique slug
    const slug = await this.quizRepository.generateUniqueSlug(quizData.title);

    // Create quiz
    const quiz = await this.quizRepository.createQuiz({
      title: quizData.title,
      slug,
      description: quizData.description,
      event_date: quizData.event_date,
      status: 'draft',
      user_id: userId,
      theme_id: quizData.theme_id,
      max_guests: limits.max_guests,
      guest_count: 0
    });

    // Create questions
    for (const [index, questionData] of quizData.questions.entries()) {
      await this.quizRepository.createQuestion({
        ...questionData,
        quiz_id: quiz.id,
        order: index + 1
      });
    }

    return this.getQuizById(quiz.id)!;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    return this.quizRepository.updateQuiz(id, updates);
  }

  async deleteQuiz(id: string): Promise<void> {
    return this.quizRepository.deleteQuiz(id);
  }

  async publishQuiz(id: string): Promise<Quiz> {
    const quiz = await this.getQuizById(id);
    if (!quiz) throw new Error('Quiz not found');

    // Validate quiz has questions
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error('Quiz must have at least one question');
    }

    return this.updateQuiz(id, { status: 'active' });
  }

  async canUserAccessQuiz(userId: string, quizId: string): Promise<boolean> {
    const quiz = await this.getQuizById(quizId);
    return quiz?.user_id === userId;
  }

  private getPlanLimits(plan: string) {
    const limits = {
      free: { max_quizzes: 1, max_guests: 5 },
      starter: { max_quizzes: 3, max_guests: 30 },
      pro: { max_quizzes: 5, max_guests: 50 },
      premium: { max_quizzes: -1, max_guests: 100 }
    };

    return limits[plan as keyof typeof limits] || limits.free;
  }
}
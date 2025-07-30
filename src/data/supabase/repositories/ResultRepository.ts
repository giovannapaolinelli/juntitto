import { supabase } from '../client';
import { QuizResult, QuizStats } from '../../../models/Quiz';

export class ResultRepository {
  async getQuizResults(quizId: string, page = 1, limit = 50): Promise<QuizResult[]> {
    const offset = (page - 1) * limit;
    
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .order('time_spent', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  async createResult(result: Omit<QuizResult, 'id' | 'completed_at'>): Promise<QuizResult> {
    // Check for duplicate guest name
    const { data: existing } = await supabase
      .from('quiz_results')
      .select('id')
      .eq('quiz_id', result.quiz_id)
      .eq('guest_name', result.guest_name)
      .single();

    if (existing) {
      throw new Error('Guest name already exists for this quiz');
    }

    // Check for IP spam (max 3 submissions per IP per quiz)
    const { data: ipResults } = await supabase
      .from('quiz_results')
      .select('id')
      .eq('quiz_id', result.quiz_id)
      .eq('guest_ip', result.guest_ip);

    if (ipResults && ipResults.length >= 3) {
      throw new Error('Too many submissions from this IP address');
    }

    const { data, error } = await supabase
      .from('quiz_results')
      .insert(result)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getQuizStats(quizId: string): Promise<QuizStats> {
    const { data: results, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('quiz_id', quizId);

    if (error) throw error;

    if (!results || results.length === 0) {
      return {
        total_participants: 0,
        average_score: 0,
        average_time: 0,
        completion_rate: 100,
        question_stats: []
      };
    }

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalTime = results.reduce((sum, r) => sum + r.time_spent, 0);

    // Get quiz questions for question stats
    const { data: questions } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .eq('quiz_id', quizId)
      .order('order');

    const questionStats = questions?.map((question, index) => {
      const correctAnswers = results.filter(r => 
        r.answers[index] === question.correct_answer
      ).length;
      
      return {
        question_id: question.id,
        correct_answers: correctAnswers,
        total_answers: results.length,
        success_rate: Math.round((correctAnswers / results.length) * 100)
      };
    }) || [];

    return {
      total_participants: results.length,
      average_score: Math.round(totalScore / results.length),
      average_time: Math.round(totalTime / results.length),
      completion_rate: 100, // All results are completed
      question_stats: questionStats
    };
  }

  async getLeaderboard(quizId: string, limit = 10): Promise<(QuizResult & { position: number })[]> {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .order('time_spent', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((result, index) => ({
      ...result,
      position: index + 1
    }));
  }
}
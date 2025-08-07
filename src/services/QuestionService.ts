import { QuestionRepository, Question } from '../data/supabase/repositories/QuestionRepository';
import { QuizRepository } from '../data/supabase/repositories/QuizRepository';

export class QuestionService {
  private questionRepository = new QuestionRepository();
  private quizRepository = new QuizRepository();

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    console.log('QuestionService: Fetching questions for quiz:', quizId);
    
    if (!quizId) {
      throw new Error('ID do quiz é obrigatório');
    }

    try {
      const questions = await this.questionRepository.getQuestionsByQuizId(quizId);
      console.log('QuestionService: Questions fetched successfully:', questions.length);
      return questions;
    } catch (error) {
      console.error('QuestionService: Error fetching questions:', error);
      throw new Error(`Erro ao buscar perguntas: ${error.message}`);
    }
  }

  async createQuestion(questionData: {
    quiz_id: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
  }): Promise<Question> {
    console.log('QuestionService: Creating question for quiz:', questionData.quiz_id);

    // Verificar se o quiz existe
    await this.validateQuizExists(questionData.quiz_id);

    try {
      const question = await this.questionRepository.createQuestion(questionData);
      console.log('QuestionService: Question created successfully:', question.id);
      return question;
    } catch (error) {
      console.error('QuestionService: Error creating question:', error);
      throw new Error(`Erro ao criar pergunta: ${error.message}`);
    }
  }

  async updateQuestion(id: string, updates: {
    question_text?: string;
    options?: string[];
    correct_option_index?: number;
  }): Promise<Question> {
    console.log('QuestionService: Updating question:', id);

    if (!id) {
      throw new Error('ID da pergunta é obrigatório');
    }

    try {
      const question = await this.questionRepository.updateQuestion(id, updates);
      console.log('QuestionService: Question updated successfully:', question.id);
      return question;
    } catch (error) {
      console.error('QuestionService: Error updating question:', error);
      throw new Error(`Erro ao atualizar pergunta: ${error.message}`);
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    console.log('QuestionService: Deleting question:', id);

    if (!id) {
      throw new Error('ID da pergunta é obrigatório');
    }

    try {
      await this.questionRepository.deleteQuestion(id);
      console.log('QuestionService: Question deleted successfully');
    } catch (error) {
      console.error('QuestionService: Error deleting question:', error);
      throw new Error(`Erro ao excluir pergunta: ${error.message}`);
    }
  }

  async saveQuestionsForQuiz(quizId: string, questions: Array<{
    id?: string;
    question_text: string;
    options: string[];
    correct_option_index: number;
  }>): Promise<Question[]> {
    console.log('QuestionService: Saving questions for quiz:', quizId, 'Count:', questions.length);

    // Verificar se o quiz existe
    await this.validateQuizExists(quizId);

    // Validar todas as perguntas
    this.validateQuestions(questions);

    try {
      const savedQuestions = await this.questionRepository.upsertQuestions(quizId, questions);
      console.log('QuestionService: Questions saved successfully:', savedQuestions.length);
      return savedQuestions;
    } catch (error) {
      console.error('QuestionService: Error saving questions:', error);
      throw new Error(`Erro ao salvar perguntas: ${error.message}`);
    }
  }

  private async validateQuizExists(quizId: string): Promise<void> {
    try {
      const quiz = await this.quizRepository.getQuizById(quizId);
      if (!quiz) {
        throw new Error('Quiz não encontrado');
      }
    } catch (error) {
      console.error('QuestionService: Quiz validation failed:', error);
      throw new Error('Quiz não encontrado ou inacessível');
    }
  }

  private validateQuestions(questions: Array<{
    question_text: string;
    options: string[];
    correct_option_index: number;
  }>): void {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Pelo menos uma pergunta é obrigatória');
    }

    questions.forEach((question, index) => {
      if (!question.question_text || !question.question_text.trim()) {
        throw new Error(`Pergunta ${index + 1}: Texto da pergunta é obrigatório`);
      }

      if (!Array.isArray(question.options)) {
        throw new Error(`Pergunta ${index + 1}: Opções devem ser um array`);
      }

      const validOptions = question.options.filter(opt => opt && opt.trim());
      if (validOptions.length < 2) {
        throw new Error(`Pergunta ${index + 1}: Deve ter pelo menos 2 opções válidas`);
      }

      if (question.correct_option_index < 0 || question.correct_option_index >= validOptions.length) {
        throw new Error(`Pergunta ${index + 1}: Índice da resposta correta é inválido`);
      }
    });
  }
}
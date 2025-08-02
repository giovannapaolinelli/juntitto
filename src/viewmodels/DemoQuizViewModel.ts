import { useState, useEffect } from 'react';
import { DemoQuiz, DemoQuizState, DemoQuestion, DEMO_QUIZ } from '../models/DemoQuiz';

export class DemoQuizViewModel {
  private quiz: DemoQuiz;
  private state: DemoQuizState;
  private listeners: Set<(state: DemoQuizState) => void> = new Set();
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.quiz = DEMO_QUIZ;
    this.state = {
      currentQuestion: 0,
      answers: [],
      timeRemaining: 30,
      showResult: false,
      completed: false,
      score: 0
    };
  }

  getQuiz(): DemoQuiz {
    return this.quiz;
  }

  getState(): DemoQuizState {
    return { ...this.state };
  }

  getCurrentQuestion(): DemoQuestion {
    return this.quiz.questions[this.state.currentQuestion];
  }

  startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (this.state.timeRemaining > 0) {
        this.updateState({ timeRemaining: this.state.timeRemaining - 1 });
      } else {
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  answerQuestion(answerIndex: number): void {
    const newAnswers = [...this.state.answers];
    newAnswers[this.state.currentQuestion] = answerIndex;
    
    this.updateState({ 
      answers: newAnswers,
      showResult: true 
    });

    this.stopTimer();

    // Show result for 2 seconds, then move to next question
    setTimeout(() => {
      this.nextQuestion();
    }, 2000);
  }

  private handleTimeUp(): void {
    // Auto-answer with -1 (no answer)
    const newAnswers = [...this.state.answers];
    newAnswers[this.state.currentQuestion] = -1;
    
    this.updateState({ 
      answers: newAnswers,
      showResult: true 
    });

    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }

  private nextQuestion(): void {
    if (this.state.currentQuestion < this.quiz.questions.length - 1) {
      this.updateState({
        currentQuestion: this.state.currentQuestion + 1,
        timeRemaining: 30,
        showResult: false
      });
      this.startTimer();
    } else {
      this.completeQuiz();
    }
  }

  private completeQuiz(): void {
    const score = this.calculateScore();
    this.updateState({
      completed: true,
      score,
      showResult: false
    });
    this.stopTimer();
  }

  private calculateScore(): number {
    let correct = 0;
    this.state.answers.forEach((answer, index) => {
      if (answer === this.quiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / this.quiz.questions.length) * 100);
  }

  resetQuiz(): void {
    this.stopTimer();
    this.state = {
      currentQuestion: 0,
      answers: [],
      timeRemaining: 30,
      showResult: false,
      completed: false,
      score: 0
    };
    this.notifyListeners();
  }

  subscribe(listener: (state: DemoQuizState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(updates: Partial<DemoQuizState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('DemoQuizViewModel: Error in listener:', error);
      }
    });
  }

  destroy(): void {
    this.stopTimer();
    this.listeners.clear();
  }
}

export const useDemoQuizViewModel = () => {
  const [viewModel] = useState(() => new DemoQuizViewModel());
  const [state, setState] = useState(() => viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.subscribe(setState);
    return () => {
      unsubscribe();
      viewModel.destroy();
    };
  }, [viewModel]);

  return {
    quiz: viewModel.getQuiz(),
    state,
    getCurrentQuestion: () => viewModel.getCurrentQuestion(),
    startTimer: () => viewModel.startTimer(),
    answerQuestion: (index: number) => viewModel.answerQuestion(index),
    resetQuiz: () => viewModel.resetQuiz()
  };
};
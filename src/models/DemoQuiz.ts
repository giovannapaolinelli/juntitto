export interface DemoQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface DemoQuiz {
  id: string;
  title: string;
  description: string;
  questions: DemoQuestion[];
}

export interface DemoQuizState {
  currentQuestion: number;
  answers: number[];
  timeRemaining: number;
  showResult: boolean;
  completed: boolean;
  score: number;
}

export const DEMO_QUIZ: DemoQuiz = {
  id: 'demo',
  title: 'Nossa História de Amor - Demo',
  description: 'Um exemplo de como funciona um quiz do Juntitto',
  questions: [
    {
      id: '1',
      text: 'Onde João e Maria se conheceram?',
      options: ['Na faculdade', 'No trabalho', 'Em uma festa', 'No shopping'],
      correctAnswer: 0
    },
    {
      id: '2',
      text: 'Qual foi o primeiro filme que assistiram juntos?',
      options: ['Titanic', 'Vingadores', 'Harry Potter', 'Star Wars'],
      correctAnswer: 2
    },
    {
      id: '3',
      text: 'Em que cidade fizeram a primeira viagem juntos?',
      options: ['Paris', 'Nova York', 'Rio de Janeiro', 'Buenos Aires'],
      correctAnswer: 2
    },
    {
      id: '4',
      text: 'Qual é a comida favorita do casal?',
      options: ['Pizza', 'Sushi', 'Hambúrguer', 'Massa'],
      correctAnswer: 1
    },
    {
      id: '5',
      text: 'Em que mês eles começaram a namorar?',
      options: ['Janeiro', 'Março', 'Junho', 'Setembro'],
      correctAnswer: 2
    }
  ]
};
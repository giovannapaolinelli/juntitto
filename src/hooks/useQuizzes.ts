import { useState, useEffect } from 'react';
import { Quiz } from '../types';

// Mock data for development
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Nossa História de Amor',
    slug: 'nossa-historia-amor',
    eventDate: '2025-06-15',
    status: 'active',
    userId: '1',
    maxGuests: 30,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    theme: {
      id: 'romantic',
      name: 'Romântico',
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#fdf2f8',
      textColor: '#1f2937',
      isPremium: false
    },
    questions: [
      {
        id: '1',
        quizId: '1',
        text: 'Onde João e Maria se conheceram?',
        type: 'multiple_choice',
        options: ['Na faculdade', 'No trabalho', 'Em uma festa', 'No shopping'],
        correctAnswer: 0,
        order: 1
      },
      {
        id: '2',
        quizId: '1',
        text: 'Qual foi o primeiro filme que assistiram juntos?',
        type: 'multiple_choice',
        options: ['Titanic', 'Vingadores', 'Harry Potter', 'Star Wars'],
        correctAnswer: 2,
        order: 2
      },
      {
        id: '3',
        quizId: '1',
        text: 'Em que cidade fizeram a primeira viagem juntos?',
        type: 'multiple_choice',
        options: ['Paris', 'Nova York', 'Rio de Janeiro', 'Buenos Aires'],
        correctAnswer: 2,
        order: 3
      }
    ]
  },
  {
    id: '2',
    title: 'Conhece a Gente?',
    slug: 'conhece-a-gente',
    eventDate: '2025-08-20',
    status: 'draft',
    userId: '1',
    maxGuests: 30,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    theme: {
      id: 'elegant',
      name: 'Elegante',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      isPremium: false
    },
    questions: []
  }
];

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuizzes(mockQuizzes);
      setLoading(false);
    }, 500);
  }, []);

  const createQuiz = async (quizData: Partial<Quiz>): Promise<Quiz> => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: quizData.title || '',
      slug: quizData.title?.toLowerCase().replace(/\s+/g, '-') || '',
      eventDate: quizData.eventDate || '',
      status: 'draft',
      userId: '1',
      maxGuests: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: quizData.theme || mockQuizzes[0].theme,
      questions: []
    };

    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  };

  const updateQuiz = async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
    const updatedQuiz = quizzes.find(q => q.id === id);
    if (!updatedQuiz) throw new Error('Quiz not found');

    const updated = { ...updatedQuiz, ...updates, updatedAt: new Date().toISOString() };
    setQuizzes(prev => prev.map(q => q.id === id ? updated : q));
    return updated;
  };

  const deleteQuiz = async (id: string): Promise<void> => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const getQuizBySlug = (slug: string): Quiz | undefined => {
    return quizzes.find(q => q.slug === slug);
  };

  return {
    quizzes,
    loading,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizBySlug
  };
};
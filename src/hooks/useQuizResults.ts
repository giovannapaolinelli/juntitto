import { useState, useEffect } from 'react';
import { QuizResult } from '../types';

// Mock results data
const mockResults: QuizResult[] = [
  {
    id: '1',
    quizId: '1',
    guestName: 'Ana Silva',
    answers: [0, 2, 2],
    score: 100,
    timeSpent: 165,
    completedAt: '2025-01-15T14:30:00Z'
  },
  {
    id: '2',
    quizId: '1',
    guestName: 'Carlos Santos',
    answers: [0, 1, 2],
    score: 67,
    timeSpent: 192,
    completedAt: '2025-01-15T15:15:00Z'
  },
  {
    id: '3',
    quizId: '1',
    guestName: 'Lucia Oliveira',
    answers: [1, 2, 0],
    score: 33,
    timeSpent: 178,
    completedAt: '2025-01-15T16:00:00Z'
  }
];

export const useQuizResults = (quizId: string) => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const quizResults = mockResults.filter(r => r.quizId === quizId);
      setResults(quizResults);
      setLoading(false);
    }, 300);
  }, [quizId]);

  const submitResult = async (result: Omit<QuizResult, 'id' | 'completedAt'>): Promise<QuizResult> => {
    const newResult: QuizResult = {
      ...result,
      id: Date.now().toString(),
      completedAt: new Date().toISOString()
    };

    setResults(prev => [...prev, newResult]);
    return newResult;
  };

  const getLeaderboard = () => {
    return results
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.timeSpent - b.timeSpent;
      })
      .map((result, index) => ({
        ...result,
        position: index + 1
      }));
  };

  const getStats = () => {
    if (results.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        averageTime: 0,
        completionRate: 0
      };
    }

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);

    return {
      totalParticipants: results.length,
      averageScore: Math.round(totalScore / results.length),
      averageTime: Math.round(totalTime / results.length),
      completionRate: 100 // Assuming all results are completed
    };
  };

  return {
    results,
    loading,
    submitResult,
    getLeaderboard,
    getStats
  };
};
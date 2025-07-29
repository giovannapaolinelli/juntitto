export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'premium';
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  status: 'draft' | 'active' | 'completed';
  userId: string;
  theme: Theme;
  questions: Question[];
  maxGuests: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple_choice' | 'text';
  options: string[];
  correctAnswer: number;
  order: number;
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  isPremium: boolean;
}

export interface QuizResult {
  id: string;
  quizId: string;
  guestName: string;
  answers: number[];
  score: number;
  timeSpent: number;
  completedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  maxGuests: number;
  maxQuizzes: number;
  features: string[];
  isPopular?: boolean;
}
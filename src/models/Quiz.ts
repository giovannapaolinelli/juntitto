export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description?: string;
  event_date: string;
  status: 'draft' | 'active' | 'completed';
  user_id: string;
  theme_id: string;
  photo_url?: string;
  password?: string;
  max_guests: number;
  guest_count: number;
  created_at: string;
  updated_at: string;
  theme?: Theme;
  questions?: Question[];
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  type: 'multiple_choice' | 'text';
  options: string[];
  correct_answer: number;
  order_index: number;
  photo_url?: string;
  created_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export interface Theme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  is_premium: boolean;
  price?: number;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  guest_name: string;
  guest_ip: string;
  answers: number[];
  score: number;
  time_spent: number;
  completed_at: string;
}

export interface QuizStats {
  total_participants: number;
  average_score: number;
  average_time: number;
  completion_rate: number;
  question_stats: QuestionStats[];
}

export interface QuestionStats {
  question_id: string;
  correct_answers: number;
  total_answers: number;
  success_rate: number;
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          plan: string;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          plan?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          plan?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          event_date: string;
          status: string;
          user_id: string;
          theme_id: string;
          photo_url: string | null;
          password: string | null;
          max_guests: number;
          guest_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          event_date: string;
          status?: string;
          user_id: string;
          theme_id: string;
          photo_url?: string | null;
          password?: string | null;
          max_guests?: number;
          guest_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          event_date?: string;
          status?: string;
          theme_id?: string;
          photo_url?: string | null;
          password?: string | null;
          max_guests?: number;
          guest_count?: number;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          text: string;
          type: string;
          options: string[];
          correct_answer: number;
          order: number;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          text: string;
          type: string;
          options: string[];
          correct_answer: number;
          order: number;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          type?: string;
          options?: string[];
          correct_answer?: number;
          order?: number;
          photo_url?: string | null;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          quiz_id: string;
          guest_name: string;
          guest_ip: string;
          answers: number[];
          score: number;
          time_spent: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          guest_name: string;
          guest_ip: string;
          answers: number[];
          score: number;
          time_spent: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          answers?: number[];
          score?: number;
          time_spent?: number;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          primary_color: string;
          secondary_color: string;
          background_color: string;
          text_color: string;
          is_premium: boolean;
          price: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          primary_color: string;
          secondary_color: string;
          background_color: string;
          text_color: string;
          is_premium?: boolean;
          price?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          primary_color?: string;
          secondary_color?: string;
          background_color?: string;
          text_color?: string;
          is_premium?: boolean;
          price?: number | null;
        };
      };
    };
  };
}
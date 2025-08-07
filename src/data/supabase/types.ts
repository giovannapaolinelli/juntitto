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
          id: string;
          email: string;
          name: string;
          plan?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string;
          plan?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      user_plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          max_guests: number;
          max_quizzes: number;
          features: any[];
          stripe_price_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price?: number;
          max_guests?: number;
          max_quizzes?: number;
          features?: any[];
          stripe_price_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          price?: number;
          max_guests?: number;
          max_quizzes?: number;
          features?: any[];
          stripe_price_id?: string | null;
          is_active?: boolean;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          stripe_subscription_id: string | null;
          status: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_id?: string;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          updated_at?: string;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          primary_color?: string;
          secondary_color?: string;
          background_color?: string;
          text_color?: string;
          is_premium?: boolean;
          price?: number | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          primary_color?: string;
          secondary_color?: string;
          background_color?: string;
          text_color?: string;
          is_premium?: boolean;
          price?: number | null;
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
          question_text: string;
          options: any;
          correct_option_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          options?: any;
          correct_option_index?: number;
          created_at?: string;
        };
        Update: {
          question_text?: string;
          options?: any;
          correct_option_index?: number;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          text: string;
          is_correct: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          text: string;
          is_correct?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          text?: string;
          is_correct?: boolean;
          order_index?: number;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          quiz_id: string;
          guest_name: string;
          guest_ip: string;
          answers: any[];
          score: number;
          time_spent: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          guest_name: string;
          guest_ip: string;
          answers?: any[];
          score?: number;
          time_spent?: number;
          completed_at?: string;
        };
        Update: {
          answers?: any[];
          score?: number;
          time_spent?: number;
        };
      };
      quiz_stats: {
        Row: {
          id: string;
          quiz_id: string;
          total_participants: number;
          average_score: number;
          average_time: number;
          completion_rate: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          total_participants?: number;
          average_score?: number;
          average_time?: number;
          completion_rate?: number;
          updated_at?: string;
        };
        Update: {
          total_participants?: number;
          average_score?: number;
          average_time?: number;
          completion_rate?: number;
          updated_at?: string;
        };
      };
    };
    Functions: {
      increment_guest_count: {
        Args: {
          quiz_id: string;
        };
        Returns: void;
      };
    };
  };
}
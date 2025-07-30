export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'premium';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPlan {
  id: string;
  name: string;
  price: number;
  max_guests: number;
  max_quizzes: number;
  features: string[];
  stripe_price_id: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
}
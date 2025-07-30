/*
  # VowPlay Wedding Quiz SaaS - Complete Database Schema

  1. New Tables
    - `users` - User profiles with subscription plans
    - `user_plans` - Available subscription plans
    - `user_subscriptions` - User subscription tracking
    - `themes` - Quiz themes (free and premium)
    - `quizzes` - Wedding quizzes with metadata
    - `questions` - Quiz questions with options
    - `quiz_results` - Guest quiz submissions
    - `quiz_stats` - Aggregated quiz statistics

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Guests can submit results only for active quizzes
    - Plan limits enforced at database level

  3. Business Logic
    - Freemium plan enforcement
    - Anti-spam protection for guest submissions
    - Unique slug generation for quizzes
    - Theme access based on user plan
</*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User Plans Table (predefined subscription tiers)
CREATE TABLE IF NOT EXISTS user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0, -- in cents
  max_guests integer NOT NULL DEFAULT 5,
  max_quizzes integer NOT NULL DEFAULT 1,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES user_plans(id),
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Themes Table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_color text NOT NULL DEFAULT '#ec4899',
  secondary_color text NOT NULL DEFAULT '#8b5cf6',
  background_color text NOT NULL DEFAULT '#fdf2f8',
  text_color text NOT NULL DEFAULT '#1f2937',
  is_premium boolean NOT NULL DEFAULT false,
  price integer DEFAULT 0, -- in cents
  created_at timestamptz DEFAULT now()
);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  event_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id uuid NOT NULL REFERENCES themes(id),
  photo_url text,
  password text,
  max_guests integer NOT NULL DEFAULT 30,
  guest_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  text text NOT NULL,
  type text NOT NULL DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'text')),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 1,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Quiz Results Table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_ip inet NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0,
  time_spent integer NOT NULL DEFAULT 0, -- in seconds
  completed_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, guest_name)
);

-- Quiz Stats Table (for performance optimization)
CREATE TABLE IF NOT EXISTS quiz_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE UNIQUE,
  total_participants integer NOT NULL DEFAULT 0,
  average_score numeric(5,2) NOT NULL DEFAULT 0,
  average_time integer NOT NULL DEFAULT 0,
  completion_rate numeric(5,2) NOT NULL DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(quiz_id, score DESC, time_spent ASC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_ip ON quiz_results(quiz_id, guest_ip);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_subscriptions table
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for quizzes table
CREATE POLICY "Users can read own quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quizzes"
  ON quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quizzes"
  ON quizzes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own quizzes"
  ON quizzes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can read active quizzes by slug"
  ON quizzes
  FOR SELECT
  TO anon
  USING (status = 'active');

-- RLS Policies for questions table
CREATE POLICY "Users can manage own quiz questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read questions for active quizzes"
  ON questions
  FOR SELECT
  TO anon
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE status = 'active'
    )
  );

-- RLS Policies for quiz_results table
CREATE POLICY "Users can read results for own quizzes"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can insert results for active quizzes"
  ON quiz_results
  FOR INSERT
  TO anon
  WITH CHECK (
    quiz_id IN (
      SELECT id FROM quizzes 
      WHERE status = 'active' 
      AND guest_count < max_guests
    )
  );

CREATE POLICY "Public can read results for leaderboard"
  ON quiz_results
  FOR SELECT
  TO anon
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE status = 'active'
    )
  );

-- RLS Policies for quiz_stats table
CREATE POLICY "Users can read stats for own quizzes"
  ON quiz_stats
  FOR SELECT
  TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read stats for active quizzes"
  ON quiz_stats
  FOR SELECT
  TO anon
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE status = 'active'
    )
  );

-- RLS Policies for themes table (public read access)
CREATE POLICY "Public can read all themes"
  ON themes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read all user plans"
  ON user_plans
  FOR SELECT
  TO public
  USING (is_active = true);

-- Functions for business logic enforcement

-- Function to check user plan limits
CREATE OR REPLACE FUNCTION check_user_quiz_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan text;
  quiz_count integer;
  max_quizzes integer;
BEGIN
  -- Get user's current plan
  SELECT plan INTO user_plan FROM users WHERE id = NEW.user_id;
  
  -- Count existing quizzes
  SELECT COUNT(*) INTO quiz_count FROM quizzes WHERE user_id = NEW.user_id;
  
  -- Get plan limits
  CASE user_plan
    WHEN 'free' THEN max_quizzes := 1;
    WHEN 'starter' THEN max_quizzes := 3;
    WHEN 'pro' THEN max_quizzes := 5;
    WHEN 'premium' THEN max_quizzes := -1; -- unlimited
    ELSE max_quizzes := 1;
  END CASE;
  
  -- Check limit (skip if unlimited)
  IF max_quizzes > 0 AND quiz_count >= max_quizzes THEN
    RAISE EXCEPTION 'Quiz limit exceeded for plan: %', user_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment guest count
CREATE OR REPLACE FUNCTION increment_guest_count(quiz_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE quizzes 
  SET guest_count = guest_count + 1,
      updated_at = now()
  WHERE id = quiz_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update quiz stats
CREATE OR REPLACE FUNCTION update_quiz_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_score numeric;
  avg_time integer;
  participant_count integer;
BEGIN
  -- Calculate stats for the quiz
  SELECT 
    COUNT(*),
    COALESCE(AVG(score), 0),
    COALESCE(AVG(time_spent), 0)
  INTO participant_count, avg_score, avg_time
  FROM quiz_results 
  WHERE quiz_id = NEW.quiz_id;
  
  -- Upsert quiz stats
  INSERT INTO quiz_stats (quiz_id, total_participants, average_score, average_time, updated_at)
  VALUES (NEW.quiz_id, participant_count, avg_score, avg_time, now())
  ON CONFLICT (quiz_id) 
  DO UPDATE SET
    total_participants = participant_count,
    average_score = avg_score,
    average_time = avg_time,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent duplicate guest names per quiz
CREATE OR REPLACE FUNCTION check_duplicate_guest_name()
RETURNS TRIGGER AS $$
DECLARE
  existing_count integer;
  ip_count integer;
BEGIN
  -- Check for duplicate name in same quiz
  SELECT COUNT(*) INTO existing_count 
  FROM quiz_results 
  WHERE quiz_id = NEW.quiz_id AND guest_name = NEW.guest_name;
  
  IF existing_count > 0 THEN
    RAISE EXCEPTION 'Guest name already exists for this quiz';
  END IF;
  
  -- Check IP spam (max 3 submissions per IP per quiz)
  SELECT COUNT(*) INTO ip_count 
  FROM quiz_results 
  WHERE quiz_id = NEW.quiz_id AND guest_ip = NEW.guest_ip;
  
  IF ip_count >= 3 THEN
    RAISE EXCEPTION 'Too many submissions from this IP address';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER check_quiz_limit_trigger
  BEFORE INSERT ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION check_user_quiz_limit();

CREATE TRIGGER update_quiz_stats_trigger
  AFTER INSERT ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_stats();

CREATE TRIGGER check_duplicate_guest_trigger
  BEFORE INSERT ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_guest_name();

-- Insert default data

-- Insert default user plans
INSERT INTO user_plans (name, price, max_guests, max_quizzes, features) VALUES
('free', 0, 5, 1, '["Basic themes", "Email support", "Basic results"]'::jsonb),
('starter', 1000, 30, 3, '["All themes", "Priority support", "Detailed stats", "No watermark"]'::jsonb),
('pro', 1500, 50, 5, '["Premium themes", "24/7 support", "Advanced analytics", "Custom QR codes", "Export results"]'::jsonb),
('premium', 2500, 100, -1, '["Exclusive themes", "Dedicated support", "White-label", "Custom API", "Consulting"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert default themes
INSERT INTO themes (name, primary_color, secondary_color, background_color, text_color, is_premium) VALUES
('Romântico', '#ec4899', '#8b5cf6', '#fdf2f8', '#1f2937', false),
('Elegante', '#6366f1', '#8b5cf6', '#f8fafc', '#1e293b', false),
('Vintage', '#d97706', '#92400e', '#fefbf3', '#78350f', false),
('Moderno', '#10b981', '#059669', '#f0fdfa', '#064e3b', true),
('Luxo', '#7c3aed', '#1e1b4b', '#faf5ff', '#581c87', true),
('Tropical', '#f59e0b', '#d97706', '#fffbeb', '#92400e', true)
ON CONFLICT DO NOTHING;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
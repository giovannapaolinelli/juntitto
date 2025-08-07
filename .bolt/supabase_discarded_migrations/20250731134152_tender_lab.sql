/*
  # Initial VowPlay Schema Setup

  1. New Tables
    - `user_plans` - Subscription plan definitions
    - `themes` - Quiz theme options (free and premium)
    - `users` - User profiles linked to auth.users
    - `user_subscriptions` - Active user subscriptions
    - `quizzes` - Wedding quiz data
    - `questions` - Quiz questions with options
    - `quiz_results` - Guest quiz submissions
    - `quiz_stats` - Aggregated quiz statistics

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Guests can submit results for active quizzes
    - Public read access for active content

  3. Business Logic
    - Plan-based limits enforcement
    - Anti-spam protection for guests
    - Automatic statistics updates
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user plans table (predefined subscription tiers)
CREATE TABLE IF NOT EXISTS user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer DEFAULT 0,
  max_guests integer DEFAULT 5,
  max_quizzes integer DEFAULT 1,
  features jsonb DEFAULT '[]'::jsonb,
  stripe_price_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default plans
INSERT INTO user_plans (name, price, max_guests, max_quizzes, features, is_active) VALUES
('Free', 0, 5, 1, '["Basic themes", "Email support"]'::jsonb, true),
('Starter', 1000, 30, 3, '["Premium themes", "Custom branding", "Priority support"]'::jsonb, true),
('Pro', 1500, 50, 5, '["All themes", "Custom branding", "Analytics", "Priority support"]'::jsonb, true),
('Premium', 2500, 100, 999, '["All features", "White label", "Custom themes", "Dedicated support"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_color text DEFAULT '#ec4899',
  secondary_color text DEFAULT '#8b5cf6',
  background_color text DEFAULT '#fdf2f8',
  text_color text DEFAULT '#1f2937',
  is_premium boolean DEFAULT false,
  price integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default themes
INSERT INTO themes (name, primary_color, secondary_color, background_color, text_color, is_premium) VALUES
('Rose Garden', '#ec4899', '#8b5cf6', '#fdf2f8', '#1f2937', false),
('Ocean Breeze', '#0ea5e9', '#06b6d4', '#f0f9ff', '#1e293b', false),
('Sunset Glow', '#f97316', '#eab308', '#fffbeb', '#1c1917', false),
('Lavender Dreams', '#8b5cf6', '#a855f7', '#faf5ff', '#1f2937', true),
('Golden Hour', '#f59e0b', '#d97706', '#fffbeb', '#1c1917', true)
ON CONFLICT DO NOTHING;

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  plan text DEFAULT 'free',
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES user_plans(id),
  stripe_subscription_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  event_date date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id uuid NOT NULL REFERENCES themes(id),
  photo_url text,
  password text,
  max_guests integer DEFAULT 30,
  guest_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  text text NOT NULL,
  type text DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'text')),
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer integer DEFAULT 0,
  order_index integer DEFAULT 1,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_ip inet NOT NULL,
  answers jsonb DEFAULT '[]'::jsonb,
  score integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, guest_name)
);

-- Create quiz stats table
CREATE TABLE IF NOT EXISTS quiz_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid UNIQUE NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  total_participants integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0,
  average_time integer DEFAULT 0,
  completion_rate numeric(5,2) DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(quiz_id, score DESC, time_spent);
CREATE INDEX IF NOT EXISTS idx_quiz_results_ip ON quiz_results(quiz_id, guest_ip);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_plans
CREATE POLICY "Public can read all user plans" ON user_plans
  FOR SELECT TO public USING (is_active = true);

-- RLS Policies for themes
CREATE POLICY "Public can read all themes" ON themes
  FOR SELECT TO public USING (true);

-- RLS Policies for users
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS Policies for quizzes
CREATE POLICY "Users can read own quizzes" ON quizzes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quizzes" ON quizzes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quizzes" ON quizzes
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own quizzes" ON quizzes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Public can read active quizzes by slug" ON quizzes
  FOR SELECT TO anon USING (status = 'active');

-- RLS Policies for questions
CREATE POLICY "Users can manage own quiz questions" ON questions
  FOR ALL TO authenticated USING (
    quiz_id IN (SELECT id FROM quizzes WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can read questions for active quizzes" ON questions
  FOR SELECT TO anon USING (
    quiz_id IN (SELECT id FROM quizzes WHERE status = 'active')
  );

-- RLS Policies for quiz_results
CREATE POLICY "Users can read results for own quizzes" ON quiz_results
  FOR SELECT TO authenticated USING (
    quiz_id IN (SELECT id FROM quizzes WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can read results for leaderboard" ON quiz_results
  FOR SELECT TO anon USING (
    quiz_id IN (SELECT id FROM quizzes WHERE status = 'active')
  );

CREATE POLICY "Guests can insert results for active quizzes" ON quiz_results
  FOR INSERT TO anon WITH CHECK (
    quiz_id IN (
      SELECT id FROM quizzes 
      WHERE status = 'active' 
      AND guest_count < max_guests
    )
  );

-- RLS Policies for quiz_stats
CREATE POLICY "Users can read stats for own quizzes" ON quiz_stats
  FOR SELECT TO authenticated USING (
    quiz_id IN (SELECT id FROM quizzes WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can read stats for active quizzes" ON quiz_stats
  FOR SELECT TO anon USING (
    quiz_id IN (SELECT id FROM quizzes WHERE status = 'active')
  );

-- Create functions for business logic
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check user quiz limit
CREATE OR REPLACE FUNCTION check_user_quiz_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_quiz_count integer;
  user_plan_name text;
  max_allowed integer;
BEGIN
  -- Get user's current plan
  SELECT plan INTO user_plan_name FROM users WHERE id = NEW.user_id;
  
  -- Get max quizzes for the plan
  SELECT max_quizzes INTO max_allowed FROM user_plans WHERE name = user_plan_name;
  
  -- Count existing quizzes
  SELECT COUNT(*) INTO user_quiz_count FROM quizzes WHERE user_id = NEW.user_id;
  
  -- Check if limit exceeded
  IF user_quiz_count >= max_allowed THEN
    RAISE EXCEPTION 'Quiz limit exceeded for plan: %', user_plan_name;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for quiz limit checking
CREATE TRIGGER check_quiz_limit_trigger
  BEFORE INSERT ON quizzes
  FOR EACH ROW EXECUTE FUNCTION check_user_quiz_limit();

-- Function to check duplicate guest names
CREATE OR REPLACE FUNCTION check_duplicate_guest_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if guest name already exists for this quiz
  IF EXISTS (SELECT 1 FROM quiz_results WHERE quiz_id = NEW.quiz_id AND guest_name = NEW.guest_name) THEN
    RAISE EXCEPTION 'Guest name already exists for this quiz';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for duplicate guest checking
CREATE TRIGGER check_duplicate_guest_trigger
  BEFORE INSERT ON quiz_results
  FOR EACH ROW EXECUTE FUNCTION check_duplicate_guest_name();

-- Function to update quiz stats
CREATE OR REPLACE FUNCTION update_quiz_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update guest count in quizzes table
  UPDATE quizzes 
  SET guest_count = guest_count + 1 
  WHERE id = NEW.quiz_id;
  
  -- Insert or update quiz stats
  INSERT INTO quiz_stats (quiz_id, total_participants, average_score, average_time)
  VALUES (
    NEW.quiz_id,
    1,
    NEW.score,
    NEW.time_spent
  )
  ON CONFLICT (quiz_id) DO UPDATE SET
    total_participants = quiz_stats.total_participants + 1,
    average_score = (quiz_stats.average_score * quiz_stats.total_participants + NEW.score) / (quiz_stats.total_participants + 1),
    average_time = (quiz_stats.average_time * quiz_stats.total_participants + NEW.time_spent) / (quiz_stats.total_participants + 1),
    updated_at = now();
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating quiz stats
CREATE TRIGGER update_quiz_stats_trigger
  AFTER INSERT ON quiz_results
  FOR EACH ROW EXECUTE FUNCTION update_quiz_stats();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'free'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
/*
  # Fix User Authentication and RLS Policies

  1. Security Updates
    - Update RLS policies for proper user authentication flow
    - Allow authenticated users to insert and select their own records
    - Fix policy conditions for user profile creation

  2. Database Functions
    - Ensure proper user profile creation flow
    - Add logging for debugging authentication issues
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create comprehensive user policies
CREATE POLICY "Enable insert for authenticated users on own record" ON users
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users on own record" ON users
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Enable update for authenticated users on own record" ON users
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure the handle_new_user function exists and works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, plan)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'free'
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Migration: Initial RLS setup for authentication
-- Created: 2025-11-27
-- Description: Set up Row Level Security policies for authenticated users

-- Note: Supabase automatically creates the auth.users table
-- This migration is a placeholder for any custom tables or policies you may need

-- Example: If you create a custom user_profiles table, add RLS policies here
-- CREATE TABLE IF NOT EXISTS public.user_profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   beta_access BOOLEAN DEFAULT FALSE,
--   site_beta BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own profile"
--   ON public.user_profiles
--   FOR SELECT
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile"
--   ON public.user_profiles
--   FOR UPDATE
--   USING (auth.uid() = id);

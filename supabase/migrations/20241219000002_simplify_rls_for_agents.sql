-- Migration: Simplify RLS policies for demo/learning purposes
-- Created: 2024-12-19
-- Description: Replace strict ownership policies with authenticated-user policies
--              This allows agent users to access data without complex subqueries
--              Perfect for demo apps and learning environments

-- ============================================================================
-- RATIONALE
-- ============================================================================
-- This is a DEMO/LEARNING application, not a production multi-tenant system.
-- We still require authentication (secure from public), but remove ownership checks.
-- Benefits:
-- 1. Agent users can access ideas without complex RLS subqueries
-- 2. Simpler to understand for new developers
-- 3. Easier to debug and maintain
-- 4. Still secure (must be authenticated)

-- ============================================================================
-- DROP OLD RESTRICTIVE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view published ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can create own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can update own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can delete own ideas" ON public.ideas;

-- ============================================================================
-- CREATE SIMPLIFIED POLICIES - IDEAS TABLE
-- ============================================================================

-- Any authenticated user can SELECT any ideas
CREATE POLICY "Authenticated users can view all ideas"
ON public.ideas
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Any authenticated user can INSERT ideas
CREATE POLICY "Authenticated users can create ideas"
ON public.ideas
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Any authenticated user can UPDATE any ideas
CREATE POLICY "Authenticated users can update ideas"
ON public.ideas
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Any authenticated user can DELETE any ideas
CREATE POLICY "Authenticated users can delete ideas"
ON public.ideas
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFIED POLICIES - VOTES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can vote on published ideas" ON public.votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON public.votes;

CREATE POLICY "Authenticated users can view all votes"
ON public.votes
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create votes"
ON public.votes
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete votes"
ON public.votes
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SIMPLIFIED POLICIES - COMMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view comments on published ideas" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments on published ideas" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

CREATE POLICY "Authenticated users can view all comments"
ON public.comments
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update comments"
ON public.comments
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete comments"
ON public.comments
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.ideas IS 
'Ideas table with simplified RLS: any authenticated user has full CRUD access. Suitable for demo/learning environments where agent users need seamless access without complex ownership checks.';

COMMENT ON TABLE public.votes IS
'Votes table with simplified RLS: any authenticated user can vote and manage votes.';

COMMENT ON TABLE public.comments IS
'Comments table with simplified RLS: any authenticated user can comment and manage comments.';

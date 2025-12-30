-- Migration: Create tags and idea_tags tables for tag management
-- Created: 2025-12-30
-- Description: Initialize tags table with simplified RLS and idea_tags junction table for linking tags to ideas
--              RLS policies allow authenticated users (including agent users) to manage tags on behalf of users
--              This follows the demo/learning pattern established in 20241219000002_simplify_rls_for_agents.sql

-- ============================================================================
-- TAGS TABLE
-- ============================================================================
-- Stores user-created tags for organizing ideas
-- Tags are user-scoped via RLS

CREATE TABLE IF NOT EXISTS public.tags (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT tags_name_format CHECK (name ~ '^[a-z0-9-_]+$'),
  CONSTRAINT tags_name_length CHECK (LENGTH(name) <= 50),
  CONSTRAINT tags_user_name_unique UNIQUE (user_id, name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON public.tags(created_at DESC);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Simplified for demo/learning - allows agent users to operate on behalf of users
-- Any authenticated user (including agent users) can access tags
CREATE POLICY "Authenticated users can view all tags"
  ON public.tags
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tags"
  ON public.tags
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tags"
  ON public.tags
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Comment for documentation
COMMENT ON TABLE public.tags IS 'User-created tags for organizing ideas. Simplified RLS allows agent users to create tags on behalf of human users.';
COMMENT ON COLUMN public.tags.name IS 'Tag name (lowercase, alphanumeric with hyphens/underscores, max 50 chars)';

-- ============================================================================
-- IDEA_TAGS JUNCTION TABLE
-- ============================================================================
-- Many-to-many relationship between ideas and tags
-- Allows multiple tags per idea and reuse of tags across ideas
-- Simplified RLS allows agent users to link tags on behalf of human users

CREATE TABLE IF NOT EXISTS public.idea_tags (
  id BIGSERIAL PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate tag-idea associations
  CONSTRAINT idea_tags_unique UNIQUE (idea_id, tag_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_idea_tags_idea_id ON public.idea_tags(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_tags_tag_id ON public.idea_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_idea_tags_created_at ON public.idea_tags(created_at DESC);

-- Enable RLS
ALTER TABLE public.idea_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Simplified for demo/learning - allows agent users to link tags on behalf of users
-- Any authenticated user (including agent users) can manage idea-tag links
CREATE POLICY "Authenticated users can view all idea-tag links"
  ON public.idea_tags
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create idea-tag links"
  ON public.idea_tags
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete idea-tag links"
  ON public.idea_tags
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Comment for documentation
COMMENT ON TABLE public.idea_tags IS 'Junction table linking tags to ideas. Simplified RLS allows agent users to manage links on behalf of human users.';

-- ============================================================================
-- UPDATED_AT TRIGGER FOR TAGS
-- ============================================================================
-- Automatically update the updated_at timestamp when a tag is modified

CREATE OR REPLACE FUNCTION public.update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tags_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant necessary permissions to authenticated users

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.idea_tags TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.tags_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.idea_tags_id_seq TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Migration: Fix tags name format constraint regex
-- Created: 2026-01-06
-- Description: Fix invalid regex pattern in tags_name_format CHECK constraint
--              The hyphen in [a-z0-9-_] was interpreted as a range, causing
--              'invalid regular expression: invalid character range' error.
--              Moving hyphen to end of character class: [a-z0-9_-]

-- ============================================================================
-- FIX TAGS NAME FORMAT CONSTRAINT
-- ============================================================================

-- Drop the existing constraint
ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS tags_name_format;

-- Re-add with corrected regex (hyphen at end of character class)
ALTER TABLE public.tags ADD CONSTRAINT tags_name_format 
  CHECK (name ~ '^[a-z0-9_-]+$');

-- Verify: This regex correctly matches:
--   - Lowercase letters: a-z
--   - Digits: 0-9
--   - Underscore: _
--   - Hyphen: - (must be at start or end of character class)

COMMENT ON CONSTRAINT tags_name_format ON public.tags IS 
  'Tag names must be lowercase alphanumeric with underscores and hyphens only';

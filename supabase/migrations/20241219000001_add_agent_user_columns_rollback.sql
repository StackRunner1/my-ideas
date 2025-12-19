-- Rollback migration: Remove agent-user columns from user_profile table
-- Created: 2024-12-19
-- Description: Reverses 20241219000001_add_agent_user_columns.sql

-- Drop CHECK constraint
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS check_agent_credentials_length;

-- Drop index
DROP INDEX IF EXISTS idx_user_profiles_agent_user_id;

-- Drop RLS policy
DROP POLICY IF EXISTS "Users can read own agent metadata" ON user_profiles;

-- Drop columns
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS agent_user_id,
DROP COLUMN IF EXISTS agent_credentials_encrypted,
DROP COLUMN IF EXISTS agent_created_at,
DROP COLUMN IF EXISTS agent_last_used_at;

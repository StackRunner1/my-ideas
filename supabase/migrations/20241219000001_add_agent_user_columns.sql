-- Migration: Add agent-user columns to user_profile table
-- Created: 2024-12-19
-- Description: Extends user_profile to store encrypted agent-user credentials

-- Add agent-user columns to user_profile table
ALTER TABLE user_profiles
ADD COLUMN agent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN agent_credentials_encrypted TEXT,
ADD COLUMN agent_created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN agent_last_used_at TIMESTAMPTZ;

-- Add index for performant agent lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_agent_user_id 
ON user_profiles(agent_user_id);

-- Add NOT NULL constraint (will be enforced after backfilling existing users)
-- For now, allow NULL to support existing users without agents
-- ALTER TABLE user_profiles
-- ALTER COLUMN agent_user_id SET NOT NULL,
-- ALTER COLUMN agent_credentials_encrypted SET NOT NULL;

-- Add CHECK constraint validating encrypted credentials have minimum length
ALTER TABLE user_profiles
ADD CONSTRAINT check_agent_credentials_length 
CHECK (
    agent_credentials_encrypted IS NULL OR 
    LENGTH(agent_credentials_encrypted) >= 32
);

-- Update RLS policies

-- Policy: Users can read their own agent metadata (but not decrypt credentials)
CREATE POLICY "Users can read own agent metadata"
ON user_profiles
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Only service role can write agent credentials
-- (This is implicitly handled by existing RLS - service role bypasses RLS)
-- We document here that credential writes MUST use service role client

-- Add comment documenting security model
COMMENT ON COLUMN user_profiles.agent_credentials_encrypted IS 
'Fernet-encrypted agent password. Only service role can write. Users can read but cannot decrypt without encryption key.';

COMMENT ON COLUMN user_profiles.agent_user_id IS 
'Reference to agent auth.users account created for this user. Used for RLS-enforced AI operations.';

COMMENT ON COLUMN user_profiles.agent_last_used_at IS 
'Timestamp of last agent authentication. Updated on each chat interaction.';

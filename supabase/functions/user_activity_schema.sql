-- User Activity Tracking Table Schema
-- This table tracks user visits (successful logins and token validations)
-- 
-- To create this table in Supabase:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Run this SQL script
-- 3. The table will be created and ready to use

CREATE TABLE IF NOT EXISTS user_activity_93da04dc (
  email TEXT NOT NULL PRIMARY KEY,
  visits JSONB NOT NULL DEFAULT '[]'::jsonb,
  login_count INTEGER GENERATED ALWAYS AS (
    jsonb_array_length(jsonb_path_query_array(visits, '$[*] ? (@.event_type == "login")'))
  ) STORED,
  token_check_count INTEGER GENERATED ALWAYS AS (
    jsonb_array_length(jsonb_path_query_array(visits, '$[*] ? (@.event_type == "token_check")'))
  ) STORED,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on last_updated for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_activity_last_updated 
ON user_activity_93da04dc(last_updated);

-- Example query to view user activity:
-- SELECT email, login_count, token_check_count, jsonb_array_length(visits) as visit_count, last_updated 
-- FROM user_activity_93da04dc 
-- ORDER BY last_updated DESC;

-- Example query to get recent visits for a specific user:
-- SELECT visits, login_count, token_check_count
-- FROM user_activity_93da04dc 
-- WHERE email = 'user@example.com';

-- Migration script for existing tables (run this if table already exists):
-- First, drop the old columns if they exist
-- ALTER TABLE user_activity_93da04dc DROP COLUMN IF EXISTS login_count;
-- ALTER TABLE user_activity_93da04dc DROP COLUMN IF EXISTS token_check_count;
-- Then add the generated columns
-- ALTER TABLE user_activity_93da04dc 
-- ADD COLUMN login_count INTEGER GENERATED ALWAYS AS (
--   jsonb_array_length(jsonb_path_query_array(visits, '$[*] ? (@.event_type == "login")'))
-- ) STORED;
-- ALTER TABLE user_activity_93da04dc 
-- ADD COLUMN token_check_count INTEGER GENERATED ALWAYS AS (
--   jsonb_array_length(jsonb_path_query_array(visits, '$[*] ? (@.event_type == "token_check")'))
-- ) STORED;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on the table for defense in depth
-- Note: Edge functions use SERVICE_ROLE_KEY which bypasses RLS,
-- but RLS policies protect against accidental exposure via anon/authenticated roles

-- Enable RLS
ALTER TABLE user_activity_93da04dc ENABLE ROW LEVEL SECURITY;

-- Policy: Only service_role can access this table
-- This ensures that even if anon/authenticated keys are accidentally used,
-- users cannot access activity tracking data
CREATE POLICY "Service role only - user activity"
ON user_activity_93da04dc
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Alternative: If you want to be more explicit, you can deny all access
-- from non-service roles (this is redundant but explicit):
-- CREATE POLICY "Deny anon access - user activity"
-- ON user_activity_93da04dc
-- FOR ALL
-- TO anon
-- USING (false)
-- WITH CHECK (false);
--
-- CREATE POLICY "Deny authenticated access - user activity"
-- ON user_activity_93da04dc
-- FOR ALL
-- TO authenticated
-- USING (false)
-- WITH CHECK (false);


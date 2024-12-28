-- Add owner_user_id column to guilds table
ALTER TABLE guilds ADD COLUMN owner_user_id TEXT NOT NULL DEFAULT '';

-- Update existing rows to have a default value
UPDATE guilds SET owner_user_id = '' WHERE owner_user_id = ''; 
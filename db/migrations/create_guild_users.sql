CREATE TABLE guild_users (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL REFERENCES guilds(id),
  discord_user_id TEXT NOT NULL,
  supabase_user_id TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(guild_id, discord_user_id),
  UNIQUE(guild_id, supabase_user_id)
); 
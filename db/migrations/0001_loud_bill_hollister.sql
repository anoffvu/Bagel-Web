-- Custom SQL migration file, put your code below! --
CREATE TABLE IF NOT EXISTS summaries (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id text NOT NULL,
  start_date timestamp NOT NULL,
  end_date timestamp NOT NULL,
  summary text NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_summaries_guild_date ON summaries(guild_id, start_date, end_date); 
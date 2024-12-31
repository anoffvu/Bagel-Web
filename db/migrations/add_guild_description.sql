ALTER TABLE guilds
ADD COLUMN description text;

-- Update existing rows to have a null description
UPDATE guilds SET description = NULL WHERE description IS NULL; 
-- Custom SQL migration file, put your code below! --
-- Create the messages table with proper schema qualification
CREATE TABLE IF NOT EXISTS messages (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    username text NOT NULL,
    content text NOT NULL,
    channel_id text NOT NULL,
    guild_id text NOT NULL,
    created_at timestamp NOT NULL,
    created_at_local timestamp DEFAULT now() NOT NULL,
    embedding vector(768)
);

-- Grant table permissions
GRANT ALL ON messages TO postgres, authenticated;

-- Create the vector similarity search function
create or replace function match_messages (
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
returns table (
    id text,
    content text,
    username text,
    similarity float
)
language sql stable
as $$
    select
        messages.id,
        messages.content,
        messages.username,
        1 - (messages.embedding <=> query_embedding) as similarity
    from messages
    where 1 - (messages.embedding <=> query_embedding) > match_threshold
    order by (messages.embedding <=> query_embedding) asc
    limit match_count;
$$;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION match_messages(vector(768), float, int) TO postgres, authenticated;
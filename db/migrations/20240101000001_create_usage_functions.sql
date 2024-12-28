-- Function to track message usage in a transaction
create or replace function track_message_usage(
  p_user_id uuid,
  p_subscription_id uuid,
  p_message_type text,
  p_tokens_used integer
) returns void as $$
begin
  -- Insert message usage record
  insert into message_usage (
    user_id,
    subscription_id,
    message_type,
    tokens_used
  ) values (
    p_user_id,
    p_subscription_id,
    p_message_type,
    p_tokens_used
  );

  -- Update subscription usage
  update subscriptions
  set messages_used = messages_used + 1
  where id = p_subscription_id;

  -- Check if limit is exceeded after update
  if exists (
    select 1
    from subscriptions
    where id = p_subscription_id
    and messages_used > messages_limit
  ) then
    raise exception 'Message limit exceeded';
  end if;
end;
$$ language plpgsql; 
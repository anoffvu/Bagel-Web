-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create customers table
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  stripe_customer_id text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  status text not null,
  stripe_subscription_id text unique not null,
  current_period_end timestamp with time zone not null,
  trial_end timestamp with time zone,
  cancel_at_period_end boolean not null default false,
  messages_limit integer not null default 1000,
  messages_used integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create message_usage table for tracking individual message usage
create table if not exists message_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  subscription_id uuid references subscriptions(id) not null,
  message_type text not null, -- 'chat', 'summary', etc.
  tokens_used integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists customers_user_id_idx on customers(user_id);
create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists message_usage_user_id_idx on message_usage(user_id);
create index if not exists message_usage_subscription_id_idx on message_usage(subscription_id);
create index if not exists message_usage_created_at_idx on message_usage(created_at); 
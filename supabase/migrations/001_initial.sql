create extension if not exists "uuid-ossp";

create table if not exists user_credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  balance integer default 0 check (balance >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('purchase', 'usage', 'refund', 'bonus')),
  description text,
  stripe_payment_id text,
  audit_job_id uuid,
  created_at timestamptz default now()
);

create table if not exists audit_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  source_type text not null check (source_type in ('github', 'zip')),
  source_url text,
  source_name text not null,
  audit_type text not null check (audit_type in ('code', 'landing')),
  selected_modules text[] not null,
  credits_cost integer not null,
  progress jsonb default '{}',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists audit_results (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references audit_jobs(id) on delete cascade not null,
  module_id text not null,
  module_name text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  score integer check (score >= 0 and score <= 100),
  results jsonb,
  raw_response text,
  tokens_used integer,
  processing_time_ms integer,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pricing_packages (
  id text primary key,
  name text not null,
  price_cents integer not null,
  credits integer not null,
  stripe_price_id text,
  features jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into pricing_packages (id, name, price_cents, credits, features)
values
  ('starter', 'Starter', 1900, 30, '{"max_modules": 3, "description": "3 audit modules"}'),
  ('pro', 'Pro', 4900, 80, '{"max_modules": -1, "description": "Full audit"}'),
  ('advanced', 'Advanced', 9900, 150, '{"max_modules": -1, "reaudit": true, "description": "Full + re-audit"}')
on conflict (id) do nothing;

alter table user_credits enable row level security;
alter table credit_transactions enable row level security;
alter table audit_jobs enable row level security;
alter table audit_results enable row level security;
alter table pricing_packages enable row level security;

create policy "Users can view own credits"
  on user_credits for select
  using (auth.uid() = user_id);

create policy "Users can view own transactions"
  on credit_transactions for select
  using (auth.uid() = user_id);

create policy "Users can view own jobs"
  on audit_jobs for select
  using (auth.uid() = user_id);

create policy "Users can create own jobs"
  on audit_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can view results of own jobs"
  on audit_results for select
  using (
    exists (
      select 1 from audit_jobs
      where audit_jobs.id = audit_results.job_id
      and audit_jobs.user_id = auth.uid()
    )
  );

create policy "Anyone can view active packages"
  on pricing_packages for select
  using (is_active = true);

create or replace function deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_job_id uuid default null
)
returns boolean as $$
declare
  current_balance integer;
begin
  select balance into current_balance
  from user_credits
  where user_id = p_user_id
  for update;

  if current_balance is null or current_balance < p_amount then
    return false;
  end if;

  update user_credits
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into credit_transactions (user_id, amount, type, audit_job_id, description)
  values (p_user_id, -p_amount, 'usage', p_job_id, 'Audit job');

  return true;
end;
$$ language plpgsql security definer;

create or replace function add_credits(
  p_user_id uuid,
  p_amount integer,
  p_stripe_id text default null,
  p_description text default 'Credit purchase'
)
returns integer as $$
declare
  new_balance integer;
begin
  insert into user_credits (user_id, balance)
  values (p_user_id, p_amount)
  on conflict (user_id)
  do update set balance = user_credits.balance + p_amount, updated_at = now()
  returning balance into new_balance;

  insert into credit_transactions (user_id, amount, type, stripe_payment_id, description)
  values (p_user_id, p_amount, 'purchase', p_stripe_id, p_description);

  return new_balance;
end;
$$ language plpgsql security definer;

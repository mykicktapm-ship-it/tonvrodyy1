-- Core schema for users, activity, payments, lobbies and rounds
create extension if not exists pgcrypto;

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id text,
  app_id text unique not null,
  wallet_address text,
  created_at timestamptz not null default now()
);

-- Wallet history
create table if not exists public.wallet_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wallet_address text,
  connected_at timestamptz,
  disconnected_at timestamptz
);

-- User activity log
create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  timestamp timestamptz not null default now(),
  extra_data jsonb
);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('deposit','withdraw')),
  amount numeric not null,
  status text not null check (status in ('pending','confirmed','failed')),
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Lobbies
create table if not exists public.lobbies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.users(id) on delete set null,
  is_private boolean not null default false,
  password_hash text,
  status text not null default 'waiting' check (status in ('waiting','active','finished')),
  created_at timestamptz not null default now(),
  seats integer not null default 10,
  stake_ton numeric not null default 0,
  pool_ton numeric not null default 0
);

-- Lobby participants
create table if not exists public.lobby_participants (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz
);
create index if not exists idx_lobby_participants_lobby on public.lobby_participants(lobby_id);

-- Rounds
create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies(id) on delete cascade,
  winner_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Round bets
create table if not exists public.round_bets (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric not null,
  bet_hash text,
  submitted_at timestamptz not null default now()
);

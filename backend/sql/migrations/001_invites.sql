-- Invites table for tokenized lobby invitations
-- Requires pgcrypto for gen_random_uuid (available on Supabase)
create extension if not exists pgcrypto;

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  lobby_id uuid not null,
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone not null
);

create unique index if not exists invites_token_idx on public.invites(token);


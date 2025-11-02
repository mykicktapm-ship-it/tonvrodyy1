-- Create restricted role for invites access
create role invite_user noinherit login password 'example';

-- Ensure role can use public schema (required to access objects)
grant usage on schema public to invite_user;

-- Restrict invites table access to select/insert only for this role
grant select, insert on table public.invites to invite_user;


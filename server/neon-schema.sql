-- Run this once against your Neon database (Neon Console -> SQL Editor,
-- or any Postgres client / psql connected using your DATABASE_URL).

create table if not exists orders (
  id text primary key,
  customer jsonb not null,
  payment text not null,
  items jsonb not null,
  subtotal integer not null,
  shipping integer not null default 0,
  total integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists messages (
  id text primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

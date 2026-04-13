-- Supabase Schema for Chatfolio Connect
-- Run this in your Supabase SQL Editor

-- Projects table
create table projects (
  id text primary key,
  title text not null,
  avatar_url text,
  short_description text,
  link text,
  last_message text,
  last_updated timestamptz default now(),
  unread int default 0,
  tech_stack text[] default '{}',
  created_at timestamptz default now()
);

-- Reviews table
create table reviews (
  id text primary key,
  author_name text not null,
  author_photo text,
  rating int check (rating >= 1 and rating <= 5),
  text text,
  time text,
  created_at timestamptz default now()
);

-- Statuses table
create table statuses (
  id text primary key,
  project_id text references projects(id),
  title text,
  media_url text,
  timestamp timestamptz default now()
);

-- AI responses table
create table ai_responses (
  id text primary key,
  intent text not null,
  response text not null,
  category text
);

-- Profile table
create table profile (
  id text primary key default 'main',
  name text,
  email text,
  phone text,
  location text,
  headline text,
  about text,
  linkedin_url text
);

-- RLS policies (adjust as needed)
alter table projects enable row level security;
alter table reviews enable row level security;
alter table statuses enable row level security;
alter table ai_responses enable row level security;
alter table profile enable row level security;

-- Allow public read access
create policy "Public read projects" on projects for select using (true);
create policy "Public read reviews" on reviews for select using (true);
create policy "Public read statuses" on statuses for select using (true);
create policy "Public read ai_responses" on ai_responses for select using (true);
create policy "Public read profile" on profile for select using (true);

-- Admin only policies (create in Supabase Dashboard)
-- Go to Authentication > Users to create admin user
-- Then add their email to allowed_emails or use custom claim
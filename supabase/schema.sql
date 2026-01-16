-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- Note: Supabase automatically creates auth.users table

-- User preferences table
create table if not exists public.user_preferences (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    preferred_era text default 'pompeii',
    enable_audio boolean default true,
    enable_images boolean default true,
    text_only_mode boolean default false,
    model_quality text default 'balanced' check (model_quality in ('fast', 'balanced', 'quality')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Historical session logs
create table if not exists public.historical_sessions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    era text not null,
    character_id text,
    conversation_length integer default 0,
    session_duration integer, -- in seconds
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Era metadata
create table if not exists public.era_metadata (
    id text primary key,
    name text not null,
    description text,
    start_year integer,
    end_year integer,
    model_size_mb integer,
    status text default 'development' check (status in ('development', 'beta', 'stable', 'archived')),
    featured boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial era data
insert into public.era_metadata (id, name, description, start_year, end_year, model_size_mb, status, featured) values
('pompeii', 'Pompeii, 79 AD', 'Experience Roman life before Vesuvius eruption', 79, 79, 450, 'development', true),
('medieval', 'Medieval Paris, 1350', 'Walk through medieval streets and meet craftsmen', 1350, 1350, 520, 'development', false),
('renaissance', 'Florence, 1500', 'Meet artists and philosophers of the Renaissance', 1500, 1500, 480, 'development', false),
('victorian', 'London, 1890', 'Explore Victorian society and industrial revolution', 1890, 1890, 510, 'development', false)
on conflict (id) do nothing;

-- Community feedback
create table if not exists public.feedback (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    era_id text references public.era_metadata(id),
    rating integer check (rating >= 1 and rating <= 5),
    comment text,
    issue_type text check (issue_type in ('accuracy', 'performance', 'content', 'bug', 'suggestion')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Model download cache
create table if not exists public.model_cache (
    model_id text primary key,
    model_type text not null check (model_type in ('text', 'image', 'audio')),
    era_id text references public.era_metadata(id),
    version text not null,
    size_mb integer not null,
    download_count integer default 0,
    last_accessed timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.user_preferences enable row level security;
alter table public.historical_sessions enable row level security;
alter table public.era_metadata enable row level security;
alter table public.feedback enable row level security;
alter table public.model_cache enable row level security;

-- Create RLS policies
-- User preferences: users can only access their own
create policy "Users can view own preferences" on public.user_preferences
    for select using (auth.uid() = user_id);

create policy "Users can update own preferences" on public.user_preferences
    for update using (auth.uid() = user_id);

create policy "Users can insert own preferences" on public.user_preferences
    for insert with check (auth.uid() = user_id);

-- Historical sessions: users can only access their own
create policy "Users can view own sessions" on public.historical_sessions
    for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on public.historical_sessions
    for insert with check (auth.uid() = user_id);

-- Era metadata: public read access
create policy "Era metadata is viewable by everyone" on public.era_metadata
    for select using (true);

-- Feedback: users can submit feedback
create policy "Users can submit feedback" on public.feedback
    for insert with check (auth.uid() = user_id);

create policy "Users can view own feedback" on public.feedback
    for select using (auth.uid() = user_id);

-- Model cache: public read, admin write
create policy "Model cache is viewable by everyone" on public.model_cache
    for select using (true);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply trigger to user_preferences
create trigger handle_user_preferences_updated_at before update on public.user_preferences
    for each row execute procedure public.handle_updated_at();

-- Create indexes for performance
create index idx_user_preferences_user_id on public.user_preferences(user_id);
create index idx_historical_sessions_user_id on public.historical_sessions(user_id);
create index idx_historical_sessions_created_at on public.historical_sessions(created_at);
create index idx_feedback_era_id on public.feedback(era_id);
create index idx_model_cache_era_id on public.model_cache(era_id);
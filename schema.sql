-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  skills text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. IDEAS TABLE
create table public.ideas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text not null,
  category text not null,
  tags text[],
  image_url text,
  upvotes_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Ideas
alter table public.ideas enable row level security;
create policy "Ideas are viewable by everyone." on public.ideas for select using (true);
create policy "Authenticated users can create ideas." on public.ideas for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own ideas." on public.ideas for update using (auth.uid() = user_id);
create policy "Users can delete their own ideas." on public.ideas for delete using (auth.uid() = user_id);

-- 3. UPVOTES TABLE
create table public.upvotes (
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (idea_id, user_id)
);

-- RLS for Upvotes
alter table public.upvotes enable row level security;
create policy "Upvotes are viewable by everyone." on public.upvotes for select using (true);
create policy "Authenticated users can upvote." on public.upvotes for insert with check (auth.role() = 'authenticated');
create policy "Users can remove their own upvote." on public.upvotes for delete using (auth.uid() = user_id);

-- Trigger to handle upvote counts on ideas table
create or replace function public.handle_upvote()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.ideas set upvotes_count = upvotes_count + 1 where id = new.idea_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.ideas set upvotes_count = upvotes_count - 1 where id = old.idea_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_upvote_change
  after insert or delete on public.upvotes
  for each row execute procedure public.handle_upvote();

-- 4. COMMENTS TABLE
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Comments
alter table public.comments enable row level security;
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Authenticated users can comment." on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can delete their own comments." on public.comments for delete using (auth.uid() = user_id);

-- 5. COLLABORATIONS TABLE
create table public.collaborations (
  id uuid default uuid_generate_v4() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(idea_id, user_id)
);

-- RLS for Collaborations
alter table public.collaborations enable row level security;
create policy "Collaborations are viewable by everyone." on public.collaborations for select using (true);
create policy "Authenticated users can request collaboration." on public.collaborations for insert with check (auth.role() = 'authenticated');
-- Policy for idea owner to update status
create policy "Idea owners can update collaboration status." on public.collaborations for update using (
  exists (select 1 from public.ideas where id = collaborations.idea_id and user_id = auth.uid())
);

-- 6. COMMUNITIES TABLE
create table public.communities (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_by uuid references public.profiles(id) not null,
  members_count int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Communities
alter table public.communities enable row level security;
create policy "Communities are viewable by everyone." on public.communities for select using (true);
create policy "Authenticated users can create communities." on public.communities for insert with check (auth.role() = 'authenticated');

-- 7. COMMUNITY MEMBERS TABLE
create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (community_id, user_id)
);

-- RLS for Community Members
alter table public.community_members enable row level security;
create policy "Viewable by everyone" on public.community_members for select using (true);
create policy "Join community" on public.community_members for insert with check (auth.uid() = user_id);
create policy "Leave community" on public.community_members for delete using (auth.uid() = user_id);

-- STORAGE SETUP INSTRUCTION
-- 1. Create a public bucket named 'avatars'
-- 2. Create a public bucket named 'idea-images'
-- 3. Add policy to 'avatars': "Public Access" ( SELECT for role anon), "User Upload" (INSERT/UPDATE for role authenticated)
-- 4. Add policy to 'idea-images': "Public Access" ( SELECT for role anon), "User Upload" (INSERT/UPDATE for role authenticated)

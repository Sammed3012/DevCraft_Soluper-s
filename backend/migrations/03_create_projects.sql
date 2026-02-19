-- 3. create_projects_table.sql

-- Create Projects Table (Production-Level Architecture)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  required_skills text[], -- Array of skills required for the project
  image_url text, -- For project banner
  upvotes_count int DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Secure the table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view projects
CREATE POLICY "Projects are viewable by everyone." ON public.projects FOR SELECT USING (true);

-- Policy: Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects." ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only the creator can update their project
CREATE POLICY "Users can update their own projects." ON public.projects FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Only the creator can delete their project
CREATE POLICY "Users can delete their own projects." ON public.projects FOR DELETE USING (auth.uid() = created_by);

-- Start Migration: Move data from `ideas` to `projects`
-- Maps: user_id -> created_by, tags -> required_skills
INSERT INTO public.projects (id, created_by, title, description, category, required_skills, image_url, upvotes_count, created_at, updated_at)
SELECT 
    id, 
    user_id, 
    title, 
    description, 
    category, 
    tags, 
    image_url, 
    upvotes_count, 
    created_at, 
    created_at -- initially set updated_at to created_at
FROM public.ideas
ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors if run multiple times

-- Attach Trigger for updated_at
CREATE TRIGGER on_projects_updated
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add Indexes for Performance
-- GIN Index for array filtering (e.g. finding projects that require specific skills)
CREATE INDEX IF NOT EXISTS projects_required_skills_idx ON public.projects USING GIN (required_skills);

-- Standard Index for foreign key lookups (e.g. finding all projects by a user)
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON public.projects (created_by);

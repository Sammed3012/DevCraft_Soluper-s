-- 1. Add Social Links directly to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;

-- 2. Create Demos Table for Watch Demo Page
CREATE TABLE IF NOT EXISTS public.demos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Demos
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demos are viewable by everyone." ON public.demos FOR SELECT USING (true);
CREATE POLICY "Users can upload demos." ON public.demos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own demos." ON public.demos FOR DELETE USING (auth.uid() = user_id);

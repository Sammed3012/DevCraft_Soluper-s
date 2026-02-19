-- Add resume_url to profiles for resume uploading
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'resume_url') THEN
        ALTER TABLE public.profiles ADD COLUMN resume_url TEXT;
    END IF;
END $$;

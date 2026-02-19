-- Add updated_at if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Update existing rows to have updated_at match created_at (optional if default is now())
UPDATE public.profiles SET updated_at = created_at WHERE updated_at IS NULL;

-- Bind the trigger (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_profiles_updated') THEN
        CREATE TRIGGER on_profiles_updated
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    END IF;
END $$;

-- Add GIN Index on skills array
-- GIN (Generalized Inverted Index) is ideal for array matching as it indexes individual elements.
CREATE INDEX IF NOT EXISTS profiles_skills_idx ON public.profiles USING GIN (skills);

-- UPGRADE SCRIPT FOR INTELLIGENT FEATURES
-- Run this in your Supabase SQL Editor

-- 1. ADD COLUMNS FOR INTELLIGENT MATCHING
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS availability text DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS experience_years int DEFAULT 0,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'Developer';

-- 2. INDEXING FOR PERFORMANCE (GIN Indices for Array Matching)
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON public.ideas USING GIN (tags);

-- 3. UPGRADED MATCHING ENGINE (RPC V2)
-- Includes weighting: Skills (70%), Availability (15%), Experience (15%)
CREATE OR REPLACE FUNCTION match_users_to_idea_v2(target_idea_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  match_score float,
  matched_skills text[],
  missing_skills text[],
  availability text,
  experience_years int
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  idea_tags text[];
  idea_owner_id uuid;
  total_reqs int;
BEGIN
  -- Get Idea Info
  SELECT tags, user_id INTO idea_tags, idea_owner_id FROM ideas WHERE id = target_idea_id;
  
  -- Validation
  IF idea_tags IS NULL OR array_length(idea_tags, 1) IS NULL THEN
    RETURN;
  END IF;

  total_reqs := array_length(idea_tags, 1);

  -- Return Matches with Advanced Score Calc
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.role,
    
    -- COMPLEX SCORE FORMULA
    (
      -- 1. Skill Match (70%)
      (
        (SELECT count(*) FROM unnest(p.skills) as s WHERE s = ANY(idea_tags))::numeric 
        / total_reqs::numeric
      ) * 70
      +
      -- 2. Availability Bonus (15%) - 'Full-time' gets max, others less
      (CASE 
        WHEN p.availability = 'Full-time' THEN 15
        WHEN p.availability = 'Part-time' THEN 10
        ELSE 5 
       END)
      +
      -- 3. Experience Bonus (15%) - Cap at 5 years for max points
      (LEAST(p.experience_years, 5)::numeric / 5.0 * 15)
    )::float as match_score,
    
    -- Matched Skills
    ARRAY(SELECT s FROM unnest(p.skills) as s WHERE s = ANY(idea_tags)) as matched_skills,
    
    -- Missing Skills
    ARRAY(SELECT t FROM unnest(idea_tags) as t WHERE t != ALL(p.skills)) as missing_skills,

    p.availability,
    p.experience_years

  FROM profiles p
  WHERE 
    p.id != idea_owner_id
    AND EXISTS (SELECT 1 FROM unnest(p.skills) s WHERE s = ANY(idea_tags))
  ORDER BY match_score DESC
  LIMIT 5;
END;
$$;

-- 4. PROJECT HEALTH CHECK RPC
-- Returns stats about the project team and skill coverage
CREATE OR REPLACE FUNCTION get_project_health(target_idea_id uuid)
RETURNS TABLE (
  total_members int,
  skill_coverage_percent float,
  missing_roles text[],
  team_balance_score int
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  idea_tags text[];
  team_skills text[];
  covered_count int;
  total_reqs int;
  member_count int;
BEGIN
  -- Get Idea Requirements
  SELECT tags INTO idea_tags FROM ideas WHERE id = target_idea_id;
  total_reqs := COALESCE(array_length(idea_tags, 1), 0);

  -- Get Team Skills (Union of all approved members' skills)
  SELECT array_agg(DISTINCT s) INTO team_skills
  FROM collaborations c
  JOIN profiles p ON c.user_id = p.id
  CROSS JOIN unnest(p.skills) as s
  WHERE c.idea_id = target_idea_id AND c.status = 'approved';

  -- Calculate Coverage
  IF total_reqs > 0 THEN
    SELECT count(*) INTO covered_count 
    FROM unnest(idea_tags) t 
    WHERE t = ANY(team_skills);
    
    skill_coverage_percent := (covered_count::float / total_reqs::float) * 100;
  ELSE
    skill_coverage_percent := 100;
  END IF;

  -- Get Missing Roles (Tags not covered)
  SELECT array_agg(t) INTO missing_roles
  FROM unnest(idea_tags) t
  WHERE t != ALL(COALESCE(team_skills, ARRAY[]::text[]));

  -- Get Member Count
  SELECT count(*) INTO member_count 
  FROM collaborations 
  WHERE idea_id = target_idea_id AND status = 'approved';

  -- Mock Balance Score (logic could be complex, simple placeholder here)
  team_balance_score := LEAST(member_count * 20 + covered_count * 10, 100);

  RETURN QUERY SELECT 
    member_count as total_members,
    COALESCE(skill_coverage_percent, 0) as skill_coverage_percent,
    COALESCE(missing_roles, ARRAY[]::text[]) as missing_roles,
    team_balance_score;
END;
$$;

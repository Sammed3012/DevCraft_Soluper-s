-- AI Matching Algorithm RPC
-- Computes compatibility between an Idea (Requirements) and Users (Skills)

create or replace function match_users_to_idea(target_idea_id uuid)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  bio text,
  skills text[],
  match_score float,
  matched_skills text[],
  missing_skills text[]
)
language plpgsql
security definer
as $$
declare
  idea_tags text[];
  existing_member_ids uuid[];
  idea_owner_id uuid;
  total_reqs int;
begin
  -- 1. Get Idea Info
  select tags, user_id into idea_tags, idea_owner_id from ideas where id = target_idea_id;
  
  -- Validation
  if idea_tags is null or array_length(idea_tags, 1) is null then
    return;
  end if;

  total_reqs := array_length(idea_tags, 1);

  -- 2. Get Existing Team Members
  select array_agg(user_id) into existing_member_ids 
  from collaborations 
  where idea_id = target_idea_id and status = 'approved';

  -- 3. Compute Matches
  -- We calculate the intersection of User Skills and Idea Tags
  return query
  select 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.skills,
    -- Score Calculation: (Matching Skills / Total Required) * 100
    round((
      (select count(*) from unnest(p.skills) as s where s = any(idea_tags))::numeric 
      / 
      total_reqs::numeric
    ) * 100, 1)::float as match_score,
    
    -- Matched Skills List
    array(
        select s from unnest(p.skills) as s 
        where s = any(idea_tags)
    ) as matched_skills,
    
    -- Missing Skills List (What this user lacks for the project)
    array(
        select t from unnest(idea_tags) as t 
        where t != all(p.skills) -- t is NOT present in p.skills
    ) as missing_skills

  from profiles p
  where 
    -- Exclude Owner
    p.id != idea_owner_id
    -- Exclude Existing Team Members
    and (existing_member_ids is null or p.id != all(existing_member_ids))
    -- Filter: Must have at least 1 matching skill
    and exists (select 1 from unnest(p.skills) s where s = any(idea_tags))
  order by match_score desc
  limit 10;
end;
$$;

-- Remove duplicate functions that accept UUID (keeping only TEXT versions)
DROP FUNCTION IF EXISTS public.check_user_upvote(uuid, uuid);
DROP FUNCTION IF EXISTS public.add_upvote(uuid, uuid);
DROP FUNCTION IF EXISTS public.remove_upvote(uuid, uuid);
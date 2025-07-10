
-- Full data reset - Delete all reports and comments
DELETE FROM public.comments;
DELETE FROM public.reports;

-- Note: We cannot delete users from auth.users as it's managed by Supabase Auth
-- Users will need to be deleted manually from the Supabase dashboard if needed

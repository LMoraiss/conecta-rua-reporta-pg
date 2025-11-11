-- Alter report_upvotes table to support anonymous users
-- Change user_id from uuid to text to support both authenticated and anonymous users

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can view upvotes" ON public.report_upvotes;
DROP POLICY IF EXISTS "Authenticated users can create upvotes" ON public.report_upvotes;
DROP POLICY IF EXISTS "Users can delete their own upvotes" ON public.report_upvotes;

-- Drop the foreign key constraint if it exists
ALTER TABLE public.report_upvotes DROP CONSTRAINT IF EXISTS report_upvotes_user_id_fkey;

-- Change the user_id column type from uuid to text
ALTER TABLE public.report_upvotes ALTER COLUMN user_id TYPE TEXT;

-- Recreate RLS policies with text user_id
CREATE POLICY "Anyone can view upvotes"
ON public.report_upvotes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create upvotes"
ON public.report_upvotes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own upvotes"
ON public.report_upvotes
FOR DELETE
USING (true);

-- Update the database functions to work with text user_id
CREATE OR REPLACE FUNCTION public.check_user_upvote(report_id_param uuid, user_id_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.report_upvotes
    WHERE report_id = report_id_param AND user_id = user_id_param
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_upvote(report_id_param uuid, user_id_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.report_upvotes (report_id, user_id)
  VALUES (report_id_param, user_id_param)
  ON CONFLICT (report_id, user_id) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.remove_upvote(report_id_param uuid, user_id_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.report_upvotes
  WHERE report_id = report_id_param AND user_id = user_id_param;
END;
$function$;
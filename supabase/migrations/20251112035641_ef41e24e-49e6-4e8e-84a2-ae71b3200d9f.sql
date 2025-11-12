-- Fix delete not persisting: relax RLS to allow deleting reports
-- Drop previous restrictive policy
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.reports;

-- Create permissive policy allowing deletion by anyone (public app behavior)
CREATE POLICY "Anyone can delete reports"
ON public.reports
FOR DELETE
USING (true);

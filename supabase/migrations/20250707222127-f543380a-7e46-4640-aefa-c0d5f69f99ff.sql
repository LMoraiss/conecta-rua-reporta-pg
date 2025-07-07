
-- Allow users to update their own reports
CREATE POLICY "Users can update their own reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid()::text = user_name);

-- Allow users to delete their own reports
CREATE POLICY "Users can delete their own reports" 
ON public.reports 
FOR DELETE 
USING (auth.uid()::text = user_name);

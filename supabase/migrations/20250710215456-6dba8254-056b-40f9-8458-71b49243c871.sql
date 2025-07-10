
-- Create the report_upvotes table for the upvote functionality
CREATE TABLE public.report_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(report_id, user_id)
);

-- Enable RLS
ALTER TABLE public.report_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS policies for report_upvotes
CREATE POLICY "Anyone can view upvotes" 
  ON public.report_upvotes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create upvotes" 
  ON public.report_upvotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" 
  ON public.report_upvotes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for the upvotes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_upvotes;

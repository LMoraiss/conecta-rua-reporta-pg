
-- Create RPC functions for upvote functionality

-- Function to get upvote count for a report
CREATE OR REPLACE FUNCTION get_upvote_count(report_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.report_upvotes
    WHERE report_id = report_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has upvoted a report
CREATE OR REPLACE FUNCTION check_user_upvote(report_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.report_upvotes
    WHERE report_id = report_id_param AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add an upvote
CREATE OR REPLACE FUNCTION add_upvote(report_id_param UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.report_upvotes (report_id, user_id)
  VALUES (report_id_param, user_id_param)
  ON CONFLICT (report_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove an upvote
CREATE OR REPLACE FUNCTION remove_upvote(report_id_param UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.report_upvotes
  WHERE report_id = report_id_param AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

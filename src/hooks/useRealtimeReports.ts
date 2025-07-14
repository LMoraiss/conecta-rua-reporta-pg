
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Report = Tables<'reports'>;

export const useRealtimeReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      console.log('Fetching reports...');
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      console.log('Reports fetched:', data?.length || 0);
      setReports(data || []);
    } catch (error) {
      console.error('Error in fetchReports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useRealtimeReports: Setting up...');
    
    // Initial fetch
    fetchReports();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('reports_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'reports' 
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      console.log('useRealtimeReports: Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, []);

  return { reports, loading, refreshReports: fetchReports };
};

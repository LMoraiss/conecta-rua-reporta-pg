
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import SimpleMap from './SimpleMap';

type Report = Tables<'reports'>;

const ReportMap = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    console.log('ReportMap component mounted');
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      console.log('Fetching reports...');
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        toast.error('Erro ao carregar relatórios');
      } else {
        console.log('Reports loaded:', data?.length || 0);
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error in fetchReports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full">
      <SimpleMap />
      {reports.length > 0 && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          {reports.length} relatório(s) encontrado(s)
        </div>
      )}
    </div>
  );
};

export default ReportMap;

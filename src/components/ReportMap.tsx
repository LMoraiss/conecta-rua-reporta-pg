
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import InteractiveMap from './InteractiveMap';

type Report = Tables<'reports'>;

interface ReportMapProps {
  onReportEdit?: (report: Report) => void;
  currentUser?: string;
  userLocation?: {lat: number, lng: number} | null;
}

const ReportMap = ({ onReportEdit, currentUser, userLocation }: ReportMapProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ReportMap component mounted');
    fetchReports();
  }, [userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  };

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
        let filteredReports = data || [];
        
        // Filter reports within 5km radius if user location is available
        if (userLocation) {
          filteredReports = filteredReports.filter(report => {
            const distance = calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              report.latitude, 
              report.longitude
            );
            return distance <= 5; // 5km radius
          });
          console.log(`Filtered ${filteredReports.length} reports within 5km radius`);
        }
        
        console.log('Reports loaded:', filteredReports.length);
        setReports(filteredReports);
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
      <InteractiveMap 
        reports={reports} 
        onReportEdit={onReportEdit}
        currentUser={currentUser}
        userLocation={userLocation}
      />
      {reports.length > 0 && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          {reports.length} relatório(s) {userLocation ? 'próximo(s)' : 'encontrado(s)'}
        </div>
      )}
    </div>
  );
};

export default ReportMap;

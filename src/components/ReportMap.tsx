
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import InteractiveMap from './InteractiveMap';
import NearbyReportsList from './NearbyReportsList';

type Report = Tables<'reports'>;

interface ReportMapProps {
  onReportEdit?: (report: Report) => void;
  currentUser?: string;
  userLocation?: {lat: number, lng: number} | null;
  selectedReportId?: string;
}

const ReportMap = ({ onReportEdit, currentUser, userLocation, selectedReportId }: ReportMapProps) => {
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

  const handleReportView = (report: Report) => {
    // Scroll to map to show the selected report
    const mapElement = document.querySelector('[data-testid="interactive-map"]');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Carregando mapa...</p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-96 bg-white/70 dark:bg-gray-800/70 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="h-96 w-full" data-testid="interactive-map">
          <InteractiveMap 
            reports={reports} 
            onReportEdit={onReportEdit}
            currentUser={currentUser}
            userLocation={userLocation}
            selectedReportId={selectedReportId}
          />
        </div>
        {reports.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {reports.length} relatório(s) {userLocation ? 'próximo(s)' : 'encontrado(s)'}
          </div>
        )}
      </div>
      <div className="lg:col-span-1">
        <NearbyReportsList 
          reports={reports}
          onReportView={handleReportView}
        />
      </div>
    </div>
  );
};

export default ReportMap;

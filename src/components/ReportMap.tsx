
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import InteractiveMap from './InteractiveMap';
import NearbyReportsList from './NearbyReportsList';
import { Session } from '@supabase/supabase-js';

type Report = Tables<'reports'>;

interface ReportMapProps {
  onReportEdit?: (report: Report) => void;
  currentUser?: string;
  userLocation?: {lat: number, lng: number} | null;
  selectedReportId?: string;
  session?: Session | null;
}

const ReportMap = ({ onReportEdit, currentUser, userLocation, selectedReportId, session }: ReportMapProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [nearbyReports, setNearbyReports] = useState<Report[]>([]);
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
        let allReports = data || [];
        let filteredReports = allReports;
        let nearbyFilteredReports = [];
        
        // Filter reports within 5km radius if user location is available
        if (userLocation) {
          filteredReports = allReports.filter(report => {
            const distance = calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              report.latitude, 
              report.longitude
            );
            return distance <= 5; // 5km radius
          });
          
          // Sort nearby reports by distance
          nearbyFilteredReports = filteredReports.map(report => ({
            ...report,
            distance: calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              report.latitude, 
              report.longitude
            )
          })).sort((a, b) => a.distance - b.distance);
          
          console.log(`Filtered ${filteredReports.length} reports within 5km radius`);
        } else {
          // If no location, show recent reports from general area (fallback)
          nearbyFilteredReports = allReports.slice(0, 10);
        }
        
        console.log('Reports loaded:', filteredReports.length);
        setReports(filteredReports);
        setNearbyReports(nearbyFilteredReports);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2">
        <div className="h-96 w-full transition-all duration-300 hover:shadow-lg" data-testid="interactive-map">
          <InteractiveMap 
            reports={reports} 
            onReportEdit={onReportEdit}
            currentUser={currentUser}
            userLocation={userLocation}
            selectedReportId={selectedReportId}
            session={session}
          />
        </div>
        {reports.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center animate-fade-in">
            {reports.length} relatório(s) {userLocation ? 'próximo(s)' : 'encontrado(s)'}
          </div>
        )}
      </div>
      <div className="lg:col-span-1">
        <NearbyReportsList 
          reports={nearbyReports}
          onReportView={handleReportView}
          session={session}
        />
      </div>
    </div>
  );
};

export default ReportMap;

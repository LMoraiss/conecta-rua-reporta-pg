
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
  const [focusedReportId, setFocusedReportId] = useState<string | undefined>(selectedReportId);

  useEffect(() => {
    console.log('ReportMap component mounted');
    fetchReports();

    // Set up real-time subscription
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchReports(); // Refetch all reports on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation]);

  // Update focused report when selectedReportId changes
  useEffect(() => {
    console.log('selectedReportId changed to:', selectedReportId);
    setFocusedReportId(selectedReportId);
  }, [selectedReportId]);

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
        const allReports = data || [];
        let nearbyFilteredReports: Report[] = [];
        
        // Filter reports within 5km radius for the nearby list if user location is available
        if (userLocation) {
          const reportsWithDistance = allReports
            .map(report => ({
              ...report,
              distance: calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                report.latitude, 
                report.longitude
              )
            }))
            .filter(report => report.distance <= 5) // 5km radius for nearby list
            .sort((a, b) => a.distance - b.distance);
          
          nearbyFilteredReports = reportsWithDistance;
          console.log(`Found ${nearbyFilteredReports.length} reports within 5km radius for nearby list`);
        } else {
          // If no location, show 10 most recent reports in the nearby list
          nearbyFilteredReports = allReports.slice(0, 10);
        }
        
        console.log('All reports loaded for map:', allReports.length);
        // Show ALL reports on the map
        setReports(allReports);
        // Only show nearby reports in the list
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
    console.log('Focusing on report from list:', report.title, 'ID:', report.id);
    
    // Clear the previous selection first, then set the new one
    setFocusedReportId(undefined);
    
    // Use a small delay to ensure the previous selection is cleared
    setTimeout(() => {
      setFocusedReportId(report.id);
      console.log('Set focused report ID to:', report.id);
      
      // Scroll to map to show the selected report
      const mapElement = document.querySelector('[data-testid="interactive-map"]');
      if (mapElement) {
        mapElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 h-[50vh] sm:h-96 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">Carregando mapa...</p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-64 sm:h-96 bg-white/70 dark:bg-gray-800/70 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
      <div className="lg:col-span-2 order-1">
        <div className="h-[50vh] sm:h-[60vh] lg:h-96 w-full transition-all duration-300 hover:shadow-lg rounded-lg overflow-hidden" data-testid="interactive-map">
          <InteractiveMap 
            reports={reports} 
            onReportEdit={onReportEdit}
            currentUser={currentUser}
            userLocation={userLocation}
            selectedReportId={focusedReportId}
            session={session}
          />
        </div>
        {reports.length > 0 && (
          <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center animate-fade-in">
            {reports.length} relatório(s) exibido(s) no mapa
          </div>
        )}
      </div>
      <div className="lg:col-span-1 order-2">
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

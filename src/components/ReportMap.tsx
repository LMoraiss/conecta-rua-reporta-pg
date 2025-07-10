
import { useEffect, useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import InteractiveMap from './InteractiveMap';
import NearbyReportsList from './NearbyReportsList';
import { Session } from '@supabase/supabase-js';
import { useRealtimeReports } from '@/hooks/useRealtimeReports';

type Report = Tables<'reports'>;

interface ReportMapProps {
  onReportEdit?: (report: Report) => void;
  currentUser?: string;
  userLocation?: {lat: number, lng: number} | null;
  selectedReportId?: string;
  session?: Session | null;
  refreshTrigger?: number;
}

const ReportMap = ({ 
  onReportEdit, 
  currentUser = '', 
  userLocation = null, 
  selectedReportId, 
  session = null,
  refreshTrigger = 0
}: ReportMapProps) => {
  const [nearbyReports, setNearbyReports] = useState<Report[]>([]);
  const [focusedReportId, setFocusedReportId] = useState<string | undefined>(selectedReportId);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Use a callback function to handle reports updates safely
  const handleReportsUpdate = (updatedReports: Report[]) => {
    console.log('Reports updated in ReportMap:', updatedReports.length);
    // Process the reports here if needed
  };

  const { reports, loading } = useRealtimeReports(handleReportsUpdate);

  useEffect(() => {
    setFocusedReportId(selectedReportId);
  }, [selectedReportId]);

  // Calculate distance between two points
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

  // Filter and process reports based on user location
  useEffect(() => {
    if (!Array.isArray(reports)) {
      console.log('Reports is not an array:', reports);
      setNearbyReports([]);
      return;
    }

    let filteredReports = reports;
    let nearbyFilteredReports = [];
    
    if (userLocation && reports.length > 0) {
      // Filter reports within 5km radius
      filteredReports = reports.filter(report => {
        if (!report || typeof report.latitude !== 'number' || typeof report.longitude !== 'number') {
          return false;
        }
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
    } else if (reports.length > 0) {
      // If no location, show recent reports
      nearbyFilteredReports = reports.slice(0, 10);
    }
    
    setNearbyReports(nearbyFilteredReports);
  }, [reports, userLocation]);

  const handleReportView = (report: Report) => {
    if (!report || !report.latitude || !report.longitude) {
      console.error('Invalid report data:', report);
      return;
    }

    console.log('Focusing on report from list:', report.title);
    setFocusedReportId(report.id);
    
    // Set map center and zoom to focus on the report
    setMapCenter({ lat: report.latitude, lng: report.longitude });
    setMapZoom(17); // Zoom level 17 for detailed view
    
    // Scroll to map to show the selected report
    const mapElement = document.querySelector('[data-testid="interactive-map"]');
    if (mapElement) {
      mapElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
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

  // Ensure we have valid reports array for InteractiveMap
  const validReports = Array.isArray(reports) ? reports.filter(report => 
    report && 
    typeof report.latitude === 'number' && 
    typeof report.longitude === 'number' &&
    report.id &&
    report.title
  ) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2">
        <div className="h-96 w-full transition-all duration-300 hover:shadow-lg" data-testid="interactive-map">
          <InteractiveMap 
            reports={validReports} 
            onReportEdit={onReportEdit}
            currentUser={currentUser}
            userLocation={userLocation}
            selectedReportId={focusedReportId}
            session={session}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onMapCenterChange={setMapCenter}
            onMapZoomChange={setMapZoom}
          />
        </div>
        {validReports.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center animate-fade-in">
            {validReports.length} relatório(s) {userLocation ? 'próximo(s)' : 'encontrado(s)'}
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

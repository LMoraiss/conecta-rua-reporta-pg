
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Tables } from '@/integrations/supabase/types';
import { getProblemTypeIcon } from '@/utils/mapIcons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, Calendar, User, Trash2 } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { UpvoteButton } from './UpvoteButton';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Report = Tables<'reports'>;

interface InteractiveMapProps {
  reports: Report[];
  onReportEdit?: (report: Report) => void;
  currentUser?: string;
  userLocation?: {lat: number, lng: number} | null;
  selectedReportId?: string;
  session?: Session | null;
  mapCenter?: {lat: number, lng: number} | null;
  mapZoom?: number;
  onMapCenterChange?: (center: {lat: number, lng: number}) => void;
  onMapZoomChange?: (zoom: number) => void;
}

// Component to handle map center and zoom changes
const MapController = ({ 
  mapCenter, 
  mapZoom, 
  onMapCenterChange, 
  onMapZoomChange,
  selectedReportId,
  reports 
}: {
  mapCenter?: {lat: number, lng: number} | null;
  mapZoom?: number;
  onMapCenterChange?: (center: {lat: number, lng: number}) => void;
  onMapZoomChange?: (zoom: number) => void;
  selectedReportId?: string;
  reports: Report[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (mapCenter && mapZoom) {
      map.flyTo([mapCenter.lat, mapCenter.lng], mapZoom, {
        duration: 1.5,
        easeLinearity: 0.1
      });
    }
  }, [map, mapCenter, mapZoom]);

  useEffect(() => {
    if (selectedReportId) {
      const selectedReport = reports.find(r => r.id === selectedReportId);
      if (selectedReport) {
        map.flyTo([selectedReport.latitude, selectedReport.longitude], 17, {
          duration: 1.5,
          easeLinearity: 0.1
        });
      }
    }
  }, [map, selectedReportId, reports]);

  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapCenterChange?.({ lat: center.lat, lng: center.lng });
      onMapZoomChange?.(zoom);
    };

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map, onMapCenterChange, onMapZoomChange]);

  return null;
};

const InteractiveMap = ({ 
  reports, 
  onReportEdit, 
  currentUser, 
  userLocation,
  selectedReportId,
  session,
  mapCenter,
  mapZoom = 13,
  onMapCenterChange,
  onMapZoomChange
}: InteractiveMapProps) => {
  const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>({});

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [-25.0916, -50.1668]; // Ponta Grossa

  const handleDeleteReport = async (reportId: string) => {
    if (!session) {
      toast.error('Você precisa estar logado para deletar um relatório');
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('Erro ao deletar relatório');
      } else {
        toast.success('Relatório deletado com sucesso');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Erro ao deletar relatório');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  const createCustomIcon = (category: string, isSelected: boolean = false) => {
    const iconSvg = getProblemTypeIcon(category);
    const size = isSelected ? 40 : 30;
    const className = isSelected ? 'selected-marker' : '';
    
    return L.divIcon({
      html: `<div class="custom-marker ${className}" style="
        width: ${size}px; 
        height: ${size}px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        background: white;
        border: 3px solid #3b82f6;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        font-size: ${size * 0.6}px;
        ${isSelected ? 'border-color: #ef4444; transform: scale(1.2); z-index: 1000;' : ''}
      ">${iconSvg}</div>`,
      className: 'custom-div-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={mapZoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <MapController 
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMapCenterChange={onMapCenterChange}
          onMapZoomChange={onMapZoomChange}
          selectedReportId={selectedReportId}
          reports={reports}
        />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              html: '<div style="width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-medium">Sua localização</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCustomIcon(report.category, selectedReportId === report.id)}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2 max-w-sm">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{report.title}</h3>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {report.category}
                  </Badge>
                  <Badge className={`${getSeverityColor(report.severity || 'medium')} text-xs`}>
                    {getSeverityLabel(report.severity || 'medium')}
                  </Badge>
                </div>

                {report.description && (
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">{report.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {report.user_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {report.image_urls && report.image_urls.length > 0 && (
                  <div className="mb-3">
                    <img
                      src={report.image_urls[0]}
                      alt={report.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <UpvoteButton 
                    reportId={report.id} 
                    session={session}
                    onUpvoteChange={(count) => {
                      setUpvoteCounts(prev => ({ ...prev, [report.id]: count }));
                    }}
                  />
                  
                  <div className="flex gap-1">
                    {onReportEdit && currentUser === report.user_name && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReportEdit(report)}
                          className="h-7 px-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;

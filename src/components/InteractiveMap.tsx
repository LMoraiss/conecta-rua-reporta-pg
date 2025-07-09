import { useEffect, useRef, useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, User, Edit, X, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { getReportIcon, getSeverityColor } from '@/utils/mapIcons';
import { UpvoteButton } from './UpvoteButton';
import { Session } from '@supabase/supabase-js';

type Report = Tables<'reports'>;

interface InteractiveMapProps {
  reports: Report[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onReportEdit?: (report: Report) => void;
  isSelecting?: boolean;
  currentUser?: string;
  userLocation?: {lat: number, lng: number} | null;
  selectedReportId?: string;
  session?: Session | null;
}

const InteractiveMap = ({ 
  reports, 
  onLocationSelect, 
  onReportEdit, 
  isSelecting = false, 
  currentUser,
  userLocation,
  selectedReportId,
  session
}: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [modalClosing, setModalClosing] = useState(false);

  // Default to Ponta Grossa - PR, but use user location if available
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [-25.0916, -50.1668];

  // Auto-select report if selectedReportId is provided
  useEffect(() => {
    if (selectedReportId && reports.length > 0 && mapInstance) {
      const report = reports.find(r => r.id === selectedReportId);
      if (report) {
        console.log('Focusing on report:', report.title, 'at coordinates:', report.latitude, report.longitude);
        
        // Zoom to the report location with smooth animation
        mapInstance.flyTo([report.latitude, report.longitude], 17, {
          animate: true,
          duration: 1.5
        });
        
        // Set selected report and show modal after a brief delay
        setTimeout(() => {
          setSelectedReport(report);
          setModalClosing(false);
        }, 800);
      }
    }
  }, [selectedReportId, reports, mapInstance]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    import('leaflet').then((L) => {
      // Configure Leaflet icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map with custom style
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
      }).setView(mapCenter, userLocation ? 14 : 13);

      // Use smooth tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add user location marker if available
      if (userLocation) {
        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: L.divIcon({
            html: `<div style="
              background: #3b82f6;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            "></div>`,
            className: 'user-location-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map);

        userMarker.bindTooltip('Sua localização', {
          direction: 'top',
          offset: [0, -10],
          className: 'user-location-tooltip'
        });
      }

      // Custom zoom control
      const customZoomControl = L.Control.extend({
        onAdd: function() {
          const div = L.DomUtil.create('div', 'custom-zoom-control');
          div.innerHTML = `
            <div class="flex flex-col bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-glass-border overflow-hidden">
              <button id="zoom-in" class="p-2 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="21 21l-4.35-4.35"></path>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
              <button id="zoom-out" class="p-2 hover:bg-gray-100 transition-colors duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="21 21l-4.35-4.35"></path>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
            </div>
          `;
          
          L.DomEvent.on(div.querySelector('#zoom-in')!, 'click', () => map.zoomIn());
          L.DomEvent.on(div.querySelector('#zoom-out')!, 'click', () => map.zoomOut());
          
          return div;
        }
      });
      
      new (customZoomControl as any)({ position: 'topright' }).addTo(map);

      // Add markers for existing reports with enhanced animations
      reports.forEach((report, index) => {
        const isResolved = report.status === 'resolved';
        
        setTimeout(() => {
          const marker = L.marker([report.latitude, report.longitude], {
            icon: L.divIcon({
              html: isResolved 
                ? `<div style="
                    background: #10b981;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    animation: bounce-in 0.6s ease-out;
                    transition: all 0.3s ease;
                  " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">✓</div>`
                : getReportIcon(report.category, report.severity || 'medium'),
              className: 'custom-marker',
              iconSize: [36, 36],
              iconAnchor: [18, 18]
            }),
            riseOnHover: true
          }).addTo(map);

          marker.on('click', (e) => {
            console.log('Marker clicked for report:', report.title);
            const markerElement = marker.getElement();
            if (markerElement) {
              markerElement.style.animation = 'marker-pulse 0.3s ease-out';
              setTimeout(() => {
                markerElement.style.animation = '';
              }, 300);
            }
            
            // Focus on the clicked marker
            map.flyTo([report.latitude, report.longitude], Math.max(map.getZoom(), 16), {
              animate: true,
              duration: 0.8
            });
            
            setSelectedReport(report);
            setModalClosing(false);
            e.originalEvent.stopPropagation();
          });

          marker.bindTooltip(`
            <div class="p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
              <div class="font-semibold text-gray-900 dark:text-gray-100">${report.title}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Severidade: ${getSeverityLabel(report.severity || 'medium')}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Status: ${report.status === 'resolved' ? 'Resolvido' : 'Pendente'}</div>
            </div>
          `, {
            direction: 'top',
            offset: [0, -20],
            className: 'custom-tooltip'
          });
        }, index * 100);
      });

      // Map click for location selection
      if (isSelecting && onLocationSelect) {
        map.on('click', (e: any) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }

      setMapInstance(map);

      return () => {
        map.remove();
      };
    });
  }, [reports, onLocationSelect, isSelecting, userLocation]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Buraco na via': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Calçada danificada': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Problema de drenagem': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Sinalização': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Iluminação': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Limpeza': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Outros': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[category] || colors['Outros'];
  };

  const canEditReport = (report: Report) => {
    return currentUser && currentUser === report.user_name;
  };

  const handleCloseModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedReport(null);
      setModalClosing(false);
    }, 200);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-96 rounded-lg relative z-0 transition-all duration-300" />
      
      {/* Report details modal with upvote system */}
      {selectedReport && (
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40 transition-all duration-300 ${modalClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <Card className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-glass transition-all duration-300 ${modalClosing ? 'animate-modal-out scale-95 opacity-0' : 'animate-modal-in'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl pr-4 text-gray-900 dark:text-gray-100 transition-colors duration-200">{selectedReport.title}</CardTitle>
              <div className="flex gap-2 flex-shrink-0">
                {onReportEdit && canEditReport(selectedReport) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Edit button clicked for report:', selectedReport.title);
                      onReportEdit(selectedReport);
                      handleCloseModal();
                    }}
                    className="flex items-center gap-1 transition-all duration-200 hover:scale-105 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="transition-all duration-200 hover:scale-105 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="transition-all duration-300">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge className={`${getCategoryColor(selectedReport.category)} transition-all duration-200`}>
                    {selectedReport.category}
                  </Badge>
                  <Badge 
                    style={{ 
                      backgroundColor: getSeverityColor(selectedReport.severity || 'medium'),
                      color: 'white'
                    }}
                    className="transition-all duration-200"
                  >
                    Severidade: {getSeverityLabel(selectedReport.severity || 'medium')}
                  </Badge>
                  <Badge 
                    className={`${selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'} transition-all duration-300`}
                  >
                    {selectedReport.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  </Badge>
                  
                  {/* Upvote Button */}
                  <UpvoteButton 
                    reportId={selectedReport.id} 
                    session={session}
                  />
                </div>

                {selectedReport.description && (
                  <div className="transition-all duration-200">
                    <h4 className="font-semibold mb-2">Descrição:</h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedReport.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedReport.user_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedReport.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                  </div>
                </div>

                {selectedReport.image_urls && selectedReport.image_urls.length > 0 && (
                  <div className="space-y-2 transition-all duration-200">
                    <h4 className="font-semibold">Imagens:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.image_urls.map((url, index) => (
                        <div 
                          key={index} 
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <img
                            src={url}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-all duration-200 shadow-soft"
                            onClick={() => window.open(url, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;

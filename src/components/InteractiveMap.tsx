import { useEffect, useRef, useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, User, Edit, X, ZoomIn, ZoomOut, Locate } from 'lucide-react';

type Report = Tables<'reports'>;

interface InteractiveMapProps {
  reports: Report[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onReportEdit?: (report: Report) => void;
  isSelecting?: boolean;
  currentUser?: string;
}

const InteractiveMap = ({ reports, onLocationSelect, onReportEdit, isSelecting = false, currentUser }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Centro de Ponta Grossa - PR
  const PONTA_GROSSA: [number, number] = [-25.0916, -50.1668];

  useEffect(() => {
    if (!mapRef.current) return;

    // Carregar Leaflet dinamicamente
    import('leaflet').then((L) => {
      // Configurar ícones do Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Criar mapa com estilo customizado
      const map = L.map(mapRef.current!, {
        zoomControl: false, // Remover controles padrão para adicionar customizados
      }).setView(PONTA_GROSSA, 13);

      // Usar tiles com estilo mais suave
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Adicionar controles de zoom customizados
      const customZoomControl = L.control({ position: 'topright' });
      customZoomControl.onAdd = function() {
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
      };
      customZoomControl.addTo(map);

      // Adicionar botão de localização
      const locationControl = L.control({ position: 'topright' });
      locationControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'custom-location-control');
        div.innerHTML = `
          <div class="mt-2">
            <button id="locate-btn" class="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-glass-border hover:bg-gray-100 transition-all duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
            </button>
          </div>
        `;
        
        L.DomEvent.on(div.querySelector('#locate-btn')!, 'click', () => {
          setIsLocating(true);
          map.locate({ setView: true, maxZoom: 16 });
        });
        
        return div;
      };
      locationControl.addTo(map);

      // Adicionar marcadores para relatórios existentes com animação
      reports.forEach((report, index) => {
        const severityColor = getSeverityColor(report.severity || 'medium');
        const isResolved = report.status === 'resolved';
        
        // Criar marcador com animação de entrada
        setTimeout(() => {
          const marker = L.marker([report.latitude, report.longitude], {
            icon: L.divIcon({
              html: `<div style="
                background: ${isResolved ? '#10b981' : severityColor};
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                animation: bounce-in 0.6s ease-out;
                transition: all 0.2s ease;
              ">
                ${isResolved ? '✓' : '!'}
              </div>`,
              className: 'custom-marker',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            })
          }).addTo(map);

          // Adicionar evento de clique com animação
          marker.on('click', (e) => {
            console.log('Marker clicked for report:', report.title);
            // Adicionar efeito de pulso
            const markerElement = marker.getElement();
            if (markerElement) {
              markerElement.style.animation = 'marker-pulse 0.3s ease-out';
              setTimeout(() => {
                markerElement.style.animation = '';
              }, 300);
            }
            setSelectedReport(report);
            e.originalEvent.stopPropagation();
          });

          // Adicionar tooltip aprimorado
          marker.bindTooltip(`
            <div class="p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
              <div class="font-semibold text-gray-900">${report.title}</div>
              <div class="text-sm text-gray-600">Severidade: ${getSeverityLabel(report.severity || 'medium')}</div>
              <div class="text-sm text-gray-600">Status: ${report.status === 'resolved' ? 'Resolvido' : 'Pendente'}</div>
            </div>
          `, {
            direction: 'top',
            offset: [0, -15],
            className: 'custom-tooltip'
          });
        }, index * 100); // Animação escalonada
      });

      // Adicionar evento de clique no mapa para seleção de localização
      if (isSelecting && onLocationSelect) {
        map.on('click', (e: any) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }

      // Eventos de localização
      map.on('locationfound', () => {
        setIsLocating(false);
      });

      map.on('locationerror', () => {
        setIsLocating(false);
      });

      setMapInstance(map);

      return () => {
        map.remove();
      };
    });
  }, [reports, onLocationSelect, isSelecting]);

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
      'Buraco na via': 'bg-red-100 text-red-800',
      'Calçada danificada': 'bg-orange-100 text-orange-800',
      'Problema de drenagem': 'bg-blue-100 text-blue-800',
      'Sinalização': 'bg-yellow-100 text-yellow-800',
      'Iluminação': 'bg-purple-100 text-purple-800',
      'Limpeza': 'bg-green-100 text-green-800',
      'Outros': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Outros'];
  };

  const canEditReport = (report: Report) => {
    return currentUser && currentUser === report.user_name;
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-96 rounded-lg relative z-0" />
      
      {/* Modal de detalhes do relatório com animações aprimoradas */}
      {selectedReport && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-modal-in bg-white/95 backdrop-blur-sm shadow-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl pr-4 animate-fade-in">{selectedReport.title}</CardTitle>
              <div className="flex gap-2 flex-shrink-0">
                {onReportEdit && canEditReport(selectedReport) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Edit button clicked for report:', selectedReport.title);
                      onReportEdit(selectedReport);
                      setSelectedReport(null);
                    }}
                    className="flex items-center gap-1 hover:scale-105 transition-transform bg-white/80 backdrop-blur-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  className="hover:scale-105 transition-transform bg-white/80 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${getCategoryColor(selectedReport.category)} animate-fade-in`}>
                    {selectedReport.category}
                  </Badge>
                  <Badge 
                    style={{ 
                      backgroundColor: getSeverityColor(selectedReport.severity || 'medium'),
                      color: 'white'
                    }}
                    className="animate-fade-in"
                    style={{ animationDelay: '0.1s' }}
                  >
                    Severidade: {getSeverityLabel(selectedReport.severity || 'medium')}
                  </Badge>
                  <Badge 
                    className={`${selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} animate-fade-in`}
                    style={{ animationDelay: '0.2s' }}
                  >
                    {selectedReport.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  </Badge>
                </div>

                {selectedReport.description && (
                  <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <h4 className="font-semibold mb-2">Descrição:</h4>
                    <p className="text-gray-700">{selectedReport.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <h4 className="font-semibold">Imagens:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.image_urls.map((url, index) => (
                        <div 
                          key={index} 
                          className="animate-fade-in hover:scale-105 transition-transform duration-200"
                          style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                        >
                          <img
                            src={url}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity shadow-soft"
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

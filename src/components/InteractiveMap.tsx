
import { useEffect, useRef, useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, User, Edit, X } from 'lucide-react';

type Report = Tables<'reports'>;

interface InteractiveMapProps {
  reports: Report[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onReportEdit?: (report: Report) => void;
  isSelecting?: boolean;
}

const InteractiveMap = ({ reports, onLocationSelect, onReportEdit, isSelecting = false }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

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

      // Criar mapa
      const map = L.map(mapRef.current!).setView(PONTA_GROSSA, 13);

      // Adicionar tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Adicionar marcadores para relatórios existentes
      reports.forEach((report) => {
        const severityColor = getSeverityColor(report.severity || 'medium');
        const isResolved = report.status === 'resolved';
        
        const marker = L.marker([report.latitude, report.longitude], {
          icon: L.divIcon({
            html: `<div style="
              background: ${isResolved ? '#10b981' : severityColor};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            ">
              ${isResolved ? '✓' : '!'}
            </div>`,
            className: 'custom-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map);

        marker.on('click', () => {
          setSelectedReport(report);
        });
      });

      // Adicionar evento de clique no mapa para seleção de localização
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-96 rounded-lg" />
      
      {/* Modal de detalhes do relatório */}
      {selectedReport && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">{selectedReport.title}</CardTitle>
              <div className="flex gap-2">
                {onReportEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onReportEdit(selectedReport);
                      setSelectedReport(null);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(selectedReport.category)}>
                    {selectedReport.category}
                  </Badge>
                  <Badge 
                    style={{ 
                      backgroundColor: getSeverityColor(selectedReport.severity || 'medium'),
                      color: 'white'
                    }}
                  >
                    Severidade: {getSeverityLabel(selectedReport.severity || 'medium')}
                  </Badge>
                  <Badge 
                    className={selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {selectedReport.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  </Badge>
                </div>

                <p className="text-gray-700">{selectedReport.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedReport.user_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedReport.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                  </div>
                </div>

                {selectedReport.image_urls && selectedReport.image_urls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Imagens:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
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

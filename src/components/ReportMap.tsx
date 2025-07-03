
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurar ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Report = Tables<'reports'>;

const ReportMap = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Centro de Ponta Grossa - PR
  const PONTA_GROSSA = [-25.0916, -50.1668] as [number, number];

  useEffect(() => {
    fetchReports();
    
    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reports'
      }, () => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar relatórios');
        console.error('Error fetching reports:', error);
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Buraco na via': '#ef4444',
      'Calçada danificada': '#f97316',
      'Problema de drenagem': '#3b82f6',
      'Sinalização': '#eab308',
      'Iluminação': '#8b5cf6',
      'Limpeza': '#10b981',
      'Outros': '#6b7280'
    };
    return colors[category] || colors['Outros'];
  };

  const createCategoryIcon = (category: string) => {
    const color = getCategoryColor(category);
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });
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
      <MapContainer
        center={PONTA_GROSSA}
        zoom={13}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCategoryIcon(report.category)}
          >
            <Popup className="custom-popup">
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span className="font-medium">{report.category}</span>
                  <span>{new Date(report.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-xs text-gray-500">Por: {report.user_name}</p>
                
                {report.image_urls && report.image_urls.length > 0 && (
                  <div className="mt-2">
                    <img
                      src={report.image_urls[0]}
                      alt="Imagem do relatório"
                      className="w-full h-20 object-cover rounded"
                    />
                    {report.image_urls.length > 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{report.image_urls.length - 1} imagem(ns)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ReportMap;

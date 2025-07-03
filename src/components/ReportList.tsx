
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

type Report = Tables<'reports'>;

const ReportList = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    
    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('reports-list-changes')
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

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Nenhum relatório encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-h-96 overflow-y-auto space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <Badge className={getCategoryColor(report.category)}>
                {report.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-3">{report.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {report.user_name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(report.created_at).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </div>
            </div>
            
            {report.image_urls && report.image_urls.length > 0 && (
              <div className="mt-3">
                <div className="flex gap-2 overflow-x-auto">
                  {report.image_urls.slice(0, 3).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  ))}
                  {report.image_urls.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                      +{report.image_urls.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportList;

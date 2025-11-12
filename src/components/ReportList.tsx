
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';

type Report = Tables<'reports'>;

interface ReportListProps {
  onReportEdit?: (report: Report) => void;
  onReportView?: (report: Report) => void;
  currentUser?: string;
}

const ReportList = ({ onReportEdit, onReportView, currentUser }: ReportListProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ReportList component mounted');
    fetchReports();

    // Set up real-time subscription
    const channel = supabase
      .channel('reports-list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('Real-time update received in list:', payload);
          fetchReports(); // Refetch all reports on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    try {
      console.log('Fetching reports for list...');
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        toast.error('Erro ao carregar relatórios');
      } else {
        console.log('Reports for list loaded:', data?.length || 0);
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error in fetchReports:', error);
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
        <div className="text-6xl mb-4">📋</div>
        <p className="text-gray-500 text-lg">Nenhum relatório encontrado.</p>
        <p className="text-gray-400 text-sm mt-2">
          Seja o primeiro a reportar um problema!
        </p>
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
              <div className="flex gap-2">
                {onReportView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReportView(report)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onReportEdit && currentUser === report.user_name && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReportEdit(report)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(report.category)}>
                  {report.category}
                </Badge>
                <Badge 
                  style={{ 
                    backgroundColor: getSeverityColor(report.severity || 'medium'),
                    color: 'white'
                  }}
                >
                  {getSeverityLabel(report.severity || 'medium')}
                </Badge>
                <Badge 
                  className={report.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {report.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                </Badge>
              </div>

              <p className="text-gray-600 line-clamp-2">{report.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {report.user_name}
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportList;

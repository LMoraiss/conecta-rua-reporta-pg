
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, User, Eye } from 'lucide-react';

type Report = Tables<'reports'>;

interface NearbyReportsListProps {
  reports: Report[];
  onReportView?: (report: Report) => void;
}

const NearbyReportsList = ({ reports, onReportView }: NearbyReportsListProps) => {
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

  if (reports.length === 0) {
    return (
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">📍</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum relatório encontrado próximo à sua localização.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Seja o primeiro a reportar um problema na sua região!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <MapPin className="h-5 w-5 text-accent-blue" />
          Relatórios Próximos ({reports.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/50">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{report.title}</h4>
              {onReportView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReportView(report)}
                  className="ml-2 flex-shrink-0"
                >
                  <Eye className="h-4 w-4" />
                  Ver no mapa
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
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
                className={report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
              >
                {report.status === 'resolved' ? 'Resolvido' : 'Pendente'}
              </Badge>
            </div>

            {report.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{report.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
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
              <div className="mt-3">
                <div className="flex gap-2 overflow-x-auto">
                  {report.image_urls.slice(0, 2).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                  ))}
                  {report.image_urls.length > 2 && (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      +{report.image_urls.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NearbyReportsList;

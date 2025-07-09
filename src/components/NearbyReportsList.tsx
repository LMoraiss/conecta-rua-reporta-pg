import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, User, Eye } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { UpvoteButton } from './UpvoteButton';
import { Session } from '@supabase/supabase-js';

type Report = Tables<'reports'> & { distance?: number };

interface NearbyReportsListProps {
  reports: Report[];
  onReportView: (report: Report) => void;
  session?: Session | null;
}

const NearbyReportsList = ({ reports, onReportView, session }: NearbyReportsListProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  const handleViewOnMap = (report: Report) => {
    console.log('View on map clicked for report:', report.title);
    
    // Trigger the view callback
    if (onReportView) {
      onReportView(report);
    }
    
    // Focus on the map element and scroll to it
    const mapElement = document.querySelector('[data-testid="interactive-map"]');
    if (mapElement) {
      mapElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
      
      // Add a subtle highlight effect
      mapElement.classList.add('ring-2', 'ring-accent-blue', 'ring-opacity-50');
      setTimeout(() => {
        mapElement.classList.remove('ring-2', 'ring-accent-blue', 'ring-opacity-50');
      }, 2000);
    }
  };

  if (reports.length === 0) {
    return (
      <Card className="h-96 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-glass transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <MapPin className="h-5 w-5 text-accent-blue" />
            Relatórios Próximos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum relatório encontrado na região</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-glass border border-glass-border p-4 h-96 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent-blue" />
          Relatórios Próximos
        </h3>
        <Badge variant="secondary" className="text-xs">
          {reports.length} encontrado{reports.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-soft border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleViewOnMap(report)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 flex-1">
                {getProblemTypeIcon(report.category)} {report.title}
              </h4>
              {report.image_urls && report.image_urls[0] && (
                <img
                  src={report.image_urls[0]}
                  alt="Preview"
                  className="w-12 h-12 rounded object-cover ml-2 flex-shrink-0"
                />
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className={getCategoryColor(report.category)} size="sm">
                {report.category}
              </Badge>
              <Badge 
                style={{ 
                  backgroundColor: getSeverityColor(report.severity || 'medium'),
                  color: 'white'
                }}
                size="sm"
              >
                {getSeverityLabel(report.severity || 'medium')}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(report.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </div>
              {'distance' in report && typeof report.distance === 'number' && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {report.distance.toFixed(1)}km
                </span>
              )}
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <UpvoteButton reportId={report.id} session={session} />
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewOnMap(report);
                }}
                className="text-xs h-7 px-2 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border-accent-blue/30"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Ver no mapa
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NearbyReportsList;

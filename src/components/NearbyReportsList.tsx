
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, User, Eye } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { UpvoteButton } from './UpvoteButton';
import { Session } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getProblemTypeIcon } from '@/utils/mapIcons';

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

  const handleViewOnMap = (report: Report, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('View on map clicked for report:', report.title, 'ID:', report.id);
    
    // Trigger the view callback which will pass the selectedReportId to the map
    if (onReportView) {
      onReportView(report);
    }
    
    // Add visual feedback
    const button = event.currentTarget as HTMLElement;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
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
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-glass border border-glass-border p-3 sm:p-4 h-64 sm:h-80 lg:h-96 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="hidden sm:inline">Relatórios Próximos</span>
          <span className="sm:hidden">Próximos</span>
        </h3>
        <Badge variant="secondary" className="text-xs">
          {reports.length}
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {reports.map((report, index) => (
          <motion.div
            key={`${report.id}-${index}`} // Ensure unique key
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-2 sm:p-3 shadow-soft border border-gray-100 dark:border-gray-600 active:shadow-md transition-all duration-200 group touch-manipulation"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm line-clamp-2 flex-1 group-hover:text-primary transition-colors duration-200">
                {getProblemTypeIcon(report.category)} {report.title}
              </h4>
              {report.image_urls && report.image_urls[0] && (
                <img
                  src={report.image_urls[0]}
                  alt="Preview"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover ml-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                />
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className={`${getCategoryColor(report.category)} text-xs`}>
                {report.category}
              </Badge>
              <Badge 
                className={`${getSeverityColor(report.severity || 'medium')} text-xs`}
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
            
            <div className="mt-2 flex items-center justify-between gap-2">
              <UpvoteButton reportId={report.id} session={session} />
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleViewOnMap(report, e)}
                className="text-xs h-8 sm:h-7 px-2 sm:px-3 bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 transition-all duration-200 active:scale-95 touch-manipulation flex-shrink-0"
              >
                <MapPin className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Ver no mapa</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NearbyReportsList;

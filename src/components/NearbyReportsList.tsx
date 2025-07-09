
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
    <Card className="h-96 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-glass transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <MapPin className="h-5 w-5 text-accent-blue" />
          Relatórios Próximos
          <Badge variant="secondary" className="ml-auto">
            {reports.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto space-y-3 px-6 pb-6">
          {reports.map((report, index) => (
            <div
              key={report.id}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 animate-fade-in hover-lift cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 flex-1 pr-2">
                    {report.title}
                  </h4>
                  {report.distance !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                      {report.distance < 1 
                        ? `${Math.round(report.distance * 1000)}m` 
                        : `${report.distance.toFixed(1)}km`
                      }
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge className={`${getCategoryColor(report.category)} text-xs`}>
                    {report.category}
                  </Badge>
                  <Badge className={`${getSeverityColor(report.severity || 'medium')} text-xs`}>
                    {getSeverityLabel(report.severity || 'medium')}
                  </Badge>
                  <Badge 
                    className={`text-xs ${
                      report.status === 'resolved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {report.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  </Badge>
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {report.description}
                  </p>
                )}

                {report.image_urls && report.image_urls.length > 0 && (
                  <div className="w-full h-20 rounded overflow-hidden">
                    <img
                      src={report.image_urls[0]}
                      alt="Preview"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-20">{report.user_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <UpvoteButton 
                    reportId={report.id}
                    session={session}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReportView(report);
                    }}
                    className="flex items-center gap-1 text-xs bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  >
                    <Eye className="h-3 w-3" />
                    Ver no mapa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyReportsList;


import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { MapPin, Trash2, CheckCircle2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Report = Tables<'reports'>;

const MyReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      // Get anonymous user ID from localStorage
      const anonymousUserId = localStorage.getItem('anonymous_user_id');
      
      if (!anonymousUserId) {
        setReports([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_name', 'Anônimo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user reports:', error);
        toast.error('Erro ao carregar seus relatórios');
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error in fetchUserReports:', error);
      toast.error('Erro ao carregar seus relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportToDelete);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('Erro ao excluir relatório');
        return;
      }

      toast.success('Relatório excluído com sucesso');
      setReports(reports.filter(r => r.id !== reportToDelete));
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error('Erro ao excluir relatório');
    } finally {
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const handleMarkAsResolved = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId);

      if (error) {
        console.error('Error updating report status:', error);
        toast.error('Erro ao marcar como resolvido');
        return;
      }

      toast.success('Relatório marcado como resolvido');
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'resolved' } : r
      ));
    } catch (error) {
      console.error('Error in handleMarkAsResolved:', error);
      toast.error('Erro ao marcar como resolvido');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Buraco na via': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Calçada danificada': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Problema de drenagem': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Sinalização': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Iluminação': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Limpeza': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Outros': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[category] || colors['Outros'];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      case 'low': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
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
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 pb-20 md:pb-0">
          <TopBar />
          <div className="flex-1 p-6">
            <Breadcrumb />
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      
      <SidebarInset className="flex-1 pb-20 md:pb-0">
        <TopBar />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Meus Relatórios</h1>
            
            {reports.length === 0 ? (
              <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum relatório encontrado
                  </h2>
                  <p className="text-muted-foreground">
                    Você ainda não criou nenhum relatório.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <div className="flex gap-2 flex-shrink-0">
                          {report.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsResolved(report.id)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReportToDelete(report.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getCategoryColor(report.category)}>
                            {report.category}
                          </Badge>
                          <Badge className={getSeverityColor(report.severity || 'medium')}>
                            {getSeverityLabel(report.severity || 'medium')}
                          </Badge>
                          <Badge 
                            className={report.status === 'resolved' 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-secondary text-secondary-foreground'
                            }
                          >
                            {report.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground">{report.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                                />
                              ))}
                              {report.image_urls.length > 3 && (
                                <div className="w-20 h-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
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
            )}
          </div>
        </div>
      </SidebarInset>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyReports;


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Trash2, MapPin, Calendar, User, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AuthModal from '@/components/AuthModal';
import ReportForm from '@/components/ReportForm';

type Report = Tables<'reports'>;

const MyReports = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchMyReports(session.user.email!);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchMyReports(session.user.email!);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMyReports = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_name', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar seus relatórios');
      } else {
        setReports(data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar seus relatórios');
    }
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setReportFormOpen(true);
  };

  const handleCreateReport = () => {
    setEditingReport(null);
    setReportFormOpen(true);
  };

  const handleReportUpdated = () => {
    if (session) {
      fetchMyReports(session.user.email!);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        toast.error('Erro ao excluir relatório');
      } else {
        toast.success('Relatório excluído com sucesso');
        setReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (error) {
      toast.error('Erro ao excluir relatório');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex w-full">
        <AppSidebar session={session} />
        
        <SidebarInset className="flex-1">
          <TopBar 
            session={session} 
            onAuthClick={() => setAuthModalOpen(true)}
          />
          
          <div className="flex-1 p-6">
            <Breadcrumb />
            
            <div className="flex items-center justify-center h-96">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <CardTitle>Acesso Necessário</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Você precisa estar logado para ver seus relatórios.
                  </p>
                  <Button onClick={() => setAuthModalOpen(true)}>
                    Fazer Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>

        <AuthModal 
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex w-full">
      <AppSidebar session={session} />
      
      <SidebarInset className="flex-1">
        <TopBar 
          session={session} 
          onAuthClick={() => setAuthModalOpen(true)}
        />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Relatórios</h1>
                <p className="text-gray-600">
                  {reports.length} relatório{reports.length !== 1 ? 's' : ''} encontrado{reports.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button onClick={handleCreateReport} className="bg-accent-blue hover:bg-accent-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>

            {reports.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum relatório encontrado
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Você ainda não criou nenhum relatório. Que tal começar agora?
                  </p>
                  <Button onClick={handleCreateReport} className="bg-accent-blue hover:bg-accent-blue/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Relatório
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{report.title}</CardTitle>
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
                              className={report.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            >
                              {report.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditReport(report)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {report.description && (
                        <p className="text-gray-700 mb-4">{report.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </div>
                      </div>

                      {report.image_urls && report.image_urls.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {report.image_urls.slice(0, 4).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Imagem ${index + 1}`}
                              className="w-20 h-20 object-cover rounded flex-shrink-0"
                            />
                          ))}
                          {report.image_urls.length > 4 && (
                            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                              +{report.image_urls.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      <ReportForm 
        open={reportFormOpen}
        onOpenChange={setReportFormOpen}
        session={session}
        editingReport={editingReport}
        onReportUpdated={handleReportUpdated}
      />
    </div>
  );
};

export default MyReports;


import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import AuthModal from '@/components/AuthModal';
import ReportForm from '@/components/ReportForm';
import ReportMap from '@/components/ReportMap';
import ReportList from '@/components/ReportList';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, List } from 'lucide-react';
import { toast } from 'sonner';
import { SidebarInset } from '@/components/ui/sidebar';

type Report = Tables<'reports'>;

const Index = () => {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Determine active tab based on route
  const activeTab = location.pathname === '/list' ? 'list' : 'map';

  useEffect(() => {
    console.log('Index component mounted');
    
    setTimeout(() => setPageLoaded(true), 100);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session loaded:', session);
      setSession(session);
      setLoading(false);
    }).catch((error) => {
      console.error('Error loading session:', error);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreateReport = () => {
    if (!session) {
      toast.error('Você precisa fazer login para criar um relatório');
      setAuthModalOpen(true);
      return;
    }
    setEditingReport(null);
    setReportFormOpen(true);
  };

  const handleEditReport = (report: Report) => {
    if (!session) {
      toast.error('Você precisa fazer login para editar um relatório');
      setAuthModalOpen(true);
      return;
    }
    
    if (session.user.email !== report.user_name) {
      toast.error('Você só pode editar seus próprios relatórios');
      return;
    }
    
    setEditingReport(report);
    setReportFormOpen(true);
  };

  const handleReportUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-accent-blue/30 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 transition-all duration-700 ${pageLoaded ? 'animate-fade-in' : 'opacity-0'} flex w-full`}>
      <AppSidebar session={session} />
      
      <SidebarInset className="flex-1">
        <TopBar 
          session={session} 
          onAuthClick={() => setAuthModalOpen(true)}
        />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          {/* Hero Section */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-accent-blue to-accent-orange p-8 rounded-2xl text-white mb-6">
              <h1 className="text-4xl font-bold mb-4">
                Conecta Rua
              </h1>
              <p className="text-xl opacity-90">
                Reporte problemas nas vias públicas de Ponta Grossa - PR
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Tabs value={activeTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
                <TabsTrigger 
                  value="map" 
                  className="flex items-center gap-2"
                  onClick={() => window.history.pushState({}, '', '/')}
                >
                  <MapPin className="h-4 w-4" />
                  Mapa
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="flex items-center gap-2"
                  onClick={() => window.history.pushState({}, '', '/list')}
                >
                  <List className="h-4 w-4" />
                  Lista
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="animate-fade-in">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-glass border border-glass-border overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <ReportMap 
                    key={refreshKey}
                    onReportEdit={handleEditReport}
                    currentUser={session?.user?.email || ''}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="list" className="animate-fade-in">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-glass border border-glass-border overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <ReportList 
                    key={refreshKey}
                    onReportEdit={handleEditReport}
                    currentUser={session?.user?.email || ''}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreateReport} />

      {/* Modals */}
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
      
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

export default Index;

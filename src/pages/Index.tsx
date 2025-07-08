
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import ReportForm from '@/components/ReportForm';
import ReportMap from '@/components/ReportMap';
import ReportList from '@/components/ReportList';
import FloatingActionButton from '@/components/FloatingActionButton';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { MapPin, List } from 'lucide-react';
import { toast } from 'sonner';

type Report = Tables<'reports'>;

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    console.log('Index component mounted');
    
    // Add page load animation
    setTimeout(() => setPageLoaded(true), 100);
    
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session loaded:', session);
      setSession(session);
      setLoading(false);
    }).catch((error) => {
      console.error('Error loading session:', error);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
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
    console.log('Showing loading state');
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

  console.log('Rendering main interface');

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 transition-all duration-700 ${pageLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <Header 
        session={session} 
        onAuthClick={() => setAuthModalOpen(true)}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 relative overflow-hidden">
            <span className="inline-block animate-typewriter">
              Conecta Rua
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Reporte problemas nas vias públicas de Ponta Grossa - PR
          </p>
          
          {/* View Mode Toggle */}
          <div className="flex justify-center items-center mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-soft border border-glass-border">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'map' 
                    ? 'bg-accent-blue text-white shadow-md' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Mapa
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-accent-blue text-white shadow-md' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4" />
                Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-glass border border-glass-border overflow-hidden transition-all duration-300 hover:shadow-xl">
            {viewMode === 'map' ? (
              <ReportMap 
                key={refreshKey}
                onReportEdit={handleEditReport}
                currentUser={session?.user?.email || ''}
              />
            ) : (
              <ReportList 
                key={refreshKey}
                onReportEdit={handleEditReport}
                currentUser={session?.user?.email || ''}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreateReport} />

      {/* Modais */}
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

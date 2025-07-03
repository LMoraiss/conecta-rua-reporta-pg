
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import ReportForm from '@/components/ReportForm';
import ReportMap from '@/components/ReportMap';
import ReportList from '@/components/ReportList';
import { Button } from '@/components/ui/button';
import { MapPin, List, Plus } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    console.log('Index component mounted');
    
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
    setReportFormOpen(true);
  };

  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main interface');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        session={session} 
        onAuthClick={() => setAuthModalOpen(true)}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conecta Rua
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Reporte problemas nas vias públicas de Ponta Grossa - PR
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button 
              onClick={handleCreateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Criar Relatório
            </Button>
            
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Mapa
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {viewMode === 'map' ? (
            <ReportMap />
          ) : (
            <ReportList />
          )}
        </div>
      </div>

      {/* Modais */}
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
      
      <ReportForm 
        open={reportFormOpen}
        onOpenChange={setReportFormOpen}
        session={session}
      />
    </div>
  );
};

export default Index;

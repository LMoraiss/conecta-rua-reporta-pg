
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import AuthModal from '@/components/AuthModal';
import ReportForm from '@/components/ReportForm';
import ReportMap from '@/components/ReportMap';
import FloatingActionButton from '@/components/FloatingActionButton';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';
import { SidebarInset } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';

type Report = Tables<'reports'>;

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    console.log('Index component mounted');
    
    // Apply saved dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    
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

  // Handle geolocation with better error handling and caching
  useEffect(() => {
    const getUserLocation = () => {
      // Check if location is cached in session storage
      const cachedLocation = sessionStorage.getItem('userLocation');
      if (cachedLocation) {
        const location = JSON.parse(cachedLocation);
        setUserLocation(location);
        console.log('Using cached location:', location);
        return;
      }

      if (navigator.geolocation) {
        console.log('Requesting geolocation permission...');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            // Cache location for this session
            sessionStorage.setItem('userLocation', JSON.stringify(location));
            console.log('User location obtained:', location);
            toast.success('Localização obtida! Mostrando relatórios próximos.');
          },
          (error) => {
            console.log('Location access denied or failed:', error);
            // Fallback to Ponta Grossa center
            const fallbackLocation = { lat: -25.0916, lng: -50.1668 };
            setUserLocation(fallbackLocation);
            sessionStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
            
            if (error.code === error.PERMISSION_DENIED) {
              toast.info('Localização negada. Mostrando relatórios de Ponta Grossa - PR.');
            } else {
              toast.warning('Erro ao obter localização. Usando localização padrão.');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      } else {
        console.log('Geolocation not supported');
        const fallbackLocation = { lat: -25.0916, lng: -50.1668 };
        setUserLocation(fallbackLocation);
        sessionStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
        toast.info('Geolocalização não suportada. Usando localização padrão.');
      }
    };

    getUserLocation();
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

  const handleReportView = (report: Report) => {
    setSelectedReport(report);
    // Scroll to map to show the selected report
    const mapElement = document.querySelector('[data-testid="map-container"]');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReportUpdated = () => {
    // Trigger refresh by incrementing the key
    setRefreshKey(prev => prev + 1);
    setReportFormOpen(false);
    setEditingReport(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-accent-blue/30 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700 ${pageLoaded ? 'animate-fade-in' : 'opacity-0'} flex w-full`}>
      <AppSidebar session={session} onAuthClick={() => setAuthModalOpen(true)} />
      
      <SidebarInset className="flex-1 pb-16 md:pb-0">
        <TopBar 
          session={session} 
          onAuthClick={() => setAuthModalOpen(true)}
        />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          {/* Hero Section */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-accent-blue to-accent-orange p-8 rounded-2xl text-white mb-6 transition-all duration-300 hover:shadow-xl">
              <h1 className="text-4xl font-bold mb-4">
                Conecta Rua
              </h1>
              <p className="text-xl opacity-90">
                Reporte problemas nas vias públicas de Ponta Grossa - PR
              </p>
              {userLocation && (
                <p className="text-sm opacity-75 mt-2 animate-fade-in">
                  📍 Mostrando relatórios próximos à sua localização
                </p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-glass border border-glass-border overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div data-testid="map-container">
                <ReportMap 
                  key={refreshKey}
                  onReportEdit={handleEditReport}
                  currentUser={session?.user?.email || ''}
                  userLocation={userLocation}
                  selectedReportId={selectedReport?.id}
                  session={session}
                  refreshTrigger={refreshKey}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation 
        session={session} 
        onAuthClick={() => setAuthModalOpen(true)} 
      />

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
    </PageTransition>
  );
};

export default Index;

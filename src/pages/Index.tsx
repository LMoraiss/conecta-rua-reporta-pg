import { useState, useEffect } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import ReportForm from '@/components/ReportForm';
import ReportMap from '@/components/ReportMap';
import FloatingActionButton from '@/components/FloatingActionButton';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';
import { SidebarInset } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';

type Report = Tables<'reports'>;

const Index = () => {
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
    setEditingReport(null);
    setReportFormOpen(true);
  };

  const handleEditReport = (report: Report) => {
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
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PageTransition className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700 ${pageLoaded ? 'animate-fade-in' : 'opacity-0'} flex w-full`}>
      <AppSidebar />
      
      <SidebarInset className="flex-1 pb-16 md:pb-0">
        <TopBar />
        
        <div className="flex-1 p-3 sm:p-6">
          <Breadcrumb />
          
          {/* Hero Section */}
          <div className="mb-4 sm:mb-8 animate-fade-in px-2 sm:px-0" style={{ animationDelay: '0.2s' }}>
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent p-4 sm:p-8 rounded-2xl sm:rounded-3xl text-white mb-4 sm:mb-6 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] sm:hover:scale-[1.02] group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-lg leading-tight">
                  Conecta Rua
                </h1>
                <p className="text-base sm:text-xl opacity-95 font-medium">
                  Reporte problemas nas vias públicas de Ponta Grossa - PR
                </p>
                {userLocation && (
                  <div className="inline-flex items-center gap-2 mt-3 sm:mt-4 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium animate-fade-in">
                    <span className="text-base sm:text-lg">📍</span>
                    <span className="hidden sm:inline">Mostrando relatórios próximos à sua localização</span>
                    <span className="sm:hidden">Localização ativa</span>
                  </div>
                )}
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-8 -top-8 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glassmorphism overflow-hidden">
              <div data-testid="map-container">
                <ReportMap 
                  key={`${refreshKey}-${selectedReport?.id || ''}`}
                  onReportEdit={handleEditReport}
                  currentUser=""
                  userLocation={userLocation}
                  selectedReportId={selectedReport?.id}
                  session={null}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreateReport} />

      {/* Modals */}
      <ReportForm 
        open={reportFormOpen}
        onOpenChange={setReportFormOpen}
        session={null}
        editingReport={editingReport}
        onReportUpdated={handleReportUpdated}
      />
    </PageTransition>
  );
};

export default Index;

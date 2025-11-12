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
import { useLocation } from 'react-router-dom';

type Report = Tables<'reports'>;

const Index = () => {
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const location = useLocation();

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
    <PageTransition className={`min-h-screen bg-background dark:bg-background transition-all duration-700 ${pageLoaded ? 'animate-fade-in' : 'opacity-0'} flex w-full`}>
      <AppSidebar />
      
      <SidebarInset className="flex-1 pb-20 md:pb-0">
        <TopBar />
        
        <div className="flex-1 p-3 sm:p-6">
          <Breadcrumb />

          {/* Main Content */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="glassmorphism overflow-hidden">
              <div data-testid="map-container">
                <ReportMap 
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

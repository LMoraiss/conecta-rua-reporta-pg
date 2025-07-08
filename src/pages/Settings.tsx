
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Bell, Moon, Globe } from 'lucide-react';
import { toast } from 'sonner';
import AuthModal from '@/components/AuthModal';

const Settings = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [emailUpdates, setEmailUpdates] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Load saved preferences
    const savedNotifications = localStorage.getItem('notifications');
    const savedEmailUpdates = localStorage.getItem('emailUpdates');
    
    if (savedNotifications !== null) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedEmailUpdates !== null) {
      setEmailUpdates(JSON.parse(savedEmailUpdates));
    }

    return () => subscription.unsubscribe();
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('notifications', JSON.stringify(checked));
    toast.success(checked ? 'Notificações ativadas' : 'Notificações desativadas');
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    toast.success(checked ? 'Modo escuro ativado' : 'Modo claro ativado');
  };

  const handleEmailUpdatesChange = (checked: boolean) => {
    setEmailUpdates(checked);
    localStorage.setItem('emailUpdates', JSON.stringify(checked));
    toast.success(checked ? 'Atualizações por email ativadas' : 'Atualizações por email desativadas');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex w-full">
        <AppSidebar session={session} />
        
        <SidebarInset className="flex-1">
          <TopBar 
            session={session} 
            onAuthClick={() => setAuthModalOpen(true)}
          />
          
          <div className="flex-1 p-6">
            <Breadcrumb />
            
            <div className="flex items-center justify-center h-96">
              <Card className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Acesso Necessário</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Você precisa estar logado para acessar as configurações.
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex w-full">
      <AppSidebar session={session} />
      
      <SidebarInset className="flex-1">
        <TopBar 
          session={session} 
          onAuthClick={() => setAuthModalOpen(true)}
        />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Configurações</h1>
              <p className="text-gray-600 dark:text-gray-400">Personalize sua experiência no Conecta Rua</p>
            </div>

            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="text-gray-900 dark:text-gray-100">Notificações Push</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receba notificações sobre atualizações dos seus relatórios
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={handleNotificationsChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailUpdates" className="text-gray-900 dark:text-gray-100">Atualizações por Email</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receba resumos semanais por email
                    </p>
                  </div>
                  <Switch
                    id="emailUpdates"
                    checked={emailUpdates}
                    onCheckedChange={handleEmailUpdatesChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Moon className="h-5 w-5" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode" className="text-gray-900 dark:text-gray-100">Modo Escuro</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Alternar entre tema claro e escuro
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={handleDarkModeChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Globe className="h-5 w-5" />
                  Informações do App
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100">Versão</Label>
                    <p className="text-gray-600 dark:text-gray-400">1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100">Última Atualização</Label>
                    <p className="text-gray-600 dark:text-gray-400">Janeiro 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default Settings;


import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Bell, Moon, Globe } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [emailUpdates, setEmailUpdates] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedNotifications = localStorage.getItem('notifications');
    const savedEmailUpdates = localStorage.getItem('emailUpdates');
    
    if (savedNotifications !== null) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedEmailUpdates !== null) {
      setEmailUpdates(JSON.parse(savedEmailUpdates));
    }
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

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      
      <SidebarInset className="flex-1 pb-20 md:pb-0">
        <TopBar />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
              <p className="text-muted-foreground">Personalize sua experiência no Conecta Rua</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
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
                    <Label htmlFor="emailUpdates">Atualizações por Email</Label>
                    <p className="text-sm text-muted-foreground">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Informações do App
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Versão</Label>
                    <p className="text-muted-foreground">1.0.0</p>
                  </div>
                  <div>
                    <Label>Última Atualização</Label>
                    <p className="text-muted-foreground">Janeiro 2024</p>
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

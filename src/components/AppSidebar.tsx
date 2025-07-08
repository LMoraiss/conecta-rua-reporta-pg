
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, FileText, User, Settings, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  session: Session | null;
  onAuthClick?: () => void;
}

const menuItems = [
  { title: 'Mapa', url: '/', icon: MapPin },
  { title: 'Meus Relatórios', url: '/my-reports', icon: FileText },
];

const userItems = [
  { title: 'Perfil', url: '/profile', icon: User },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar({ session, onAuthClick }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao fazer logout');
    } else {
      toast.success('Logout realizado com sucesso');
    }
    setIsLoggingOut(false);
  };

  const handleProtectedRoute = (path: string) => {
    if (!session && (path === '/profile' || path === '/settings' || path === '/my-reports')) {
      toast.error('Você precisa fazer login para acessar esta página');
      if (onAuthClick) onAuthClick();
      return;
    }
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r border-border bg-background transition-all duration-300">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-orange rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">CR</span>
          </div>
          {state === 'expanded' && (
            <div className="transition-opacity duration-200">
              <h2 className="text-base font-bold text-foreground">Sistema</h2>
              <p className="text-xs text-muted-foreground">Conecta Rua</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <button
                  onClick={() => handleProtectedRoute(item.url)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left ${
                    isActive(item.url)
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {state === 'expanded' && <span>{item.title}</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-4" />
        
        {/* Always show user items, but handle authentication */}
        <SidebarMenu>
          {userItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <button
                  onClick={() => handleProtectedRoute(item.url)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left ${
                    isActive(item.url)
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {state === 'expanded' && <span>{item.title}</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {session && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-destructive/10 text-destructive w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  {state === 'expanded' && (
                    <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
                  )}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

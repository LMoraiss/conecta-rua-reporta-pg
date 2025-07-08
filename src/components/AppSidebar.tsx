
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, List, User, FileText, Settings, LogOut } from 'lucide-react';
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
}

const menuItems = [
  { title: 'Mapa', url: '/', icon: MapPin },
  { title: 'Lista', url: '/list', icon: List },
  { title: 'Meus Relatórios', url: '/my-reports', icon: FileText },
];

const userItems = [
  { title: 'Perfil', url: '/profile', icon: User },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar({ session }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
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

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/list';
    }
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-orange rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CR</span>
          </div>
          {state === 'expanded' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">Conecta Rua</h2>
              <p className="text-xs text-gray-500">Ponta Grossa - PR</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-blue text-white shadow-md'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {state === 'expanded' && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {session && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-accent-blue text-white shadow-md'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {state === 'expanded' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    {state === 'expanded' && (
                      <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

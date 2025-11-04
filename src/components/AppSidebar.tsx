
import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, FileText, Settings } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Mapa', url: '/', icon: MapPin },
  { title: 'Meus Relatórios', url: '/my-reports', icon: FileText },
];

const userItems = [
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <Sidebar 
      collapsible="icon"
      className="border-r border-border bg-background"
    >
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <img src={logoImg} alt="Conecta Rua" className="w-8 h-8 object-contain flex-shrink-0" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-base font-bold text-foreground">Sistema</h2>
            <p className="text-xs text-muted-foreground">Conecta Rua</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.url)
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-4" />
        
        <SidebarMenu>
          {userItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.url)
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}


import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Mapa', url: '/', icon: MapPin },
  { title: 'Meus Relatórios', url: '/my-reports', icon: FileText },
];

const userItems = [
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <Sidebar 
      className={`border-r border-border bg-background transition-all duration-300 ${
        isExpanded ? 'w-60' : 'w-16'
      }`}
    >
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            <img src={logoImg} alt="Conecta Rua" className="w-8 h-8 object-contain" />
            <div>
              <h2 className="text-base font-bold text-foreground">Sistema</h2>
              <p className="text-xs text-muted-foreground">Conecta Rua</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`h-8 w-8 transition-all duration-300 ${!isExpanded && 'mx-auto'}`}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
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
                  } ${!isExpanded && 'justify-center'}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span>{item.title}</span>}
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
                  } ${!isExpanded && 'justify-center'}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

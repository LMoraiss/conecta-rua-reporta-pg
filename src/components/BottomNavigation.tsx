
import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, FileText, Settings } from 'lucide-react';

const navigationItems = [
  {
    path: '/',
    icon: MapPin,
    label: 'Mapa',
  },
  {
    path: '/my-reports',
    icon: FileText,
    label: 'Relatórios',
  },
  {
    path: '/settings',
    icon: Settings,
    label: 'Config.',
  }
];

export const BottomNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <nav 
      role="navigation" 
      aria-label="Navegação inferior" 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 safe-area-inset-bottom"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-200 min-w-[64px] h-12 select-none touch-manipulation ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
            >
              <Icon className={`h-6 w-6 mb-0.5 transition-colors ${active ? 'text-primary' : ''}`} aria-hidden="true" />
              <span className={`text-[11px] font-medium leading-none ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

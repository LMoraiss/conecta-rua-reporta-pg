
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
    <nav role="navigation" aria-label="Navegação inferior" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center py-2 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all duration-200 min-w-[56px] select-none touch-manipulation ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground active:text-primary active:bg-muted'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'text-primary' : ''}`} aria-hidden="true" />
              <span className={`text-[10px] font-medium leading-tight ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

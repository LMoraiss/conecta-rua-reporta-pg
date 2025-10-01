
import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, FileText, Settings, User } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface BottomNavigationProps {
  session: Session | null;
  onAuthClick?: () => void;
}

const navigationItems = [
  {
    path: '/',
    icon: MapPin,
    label: 'Mapa',
    requiresAuth: false
  },
  {
    path: '/my-reports',
    icon: FileText,
    label: 'Relatórios',
    requiresAuth: true
  },
  {
    path: '/profile',
    icon: User,
    label: 'Perfil',
    requiresAuth: true
  },
  {
    path: '/settings',
    icon: Settings,
    label: 'Config.',
    requiresAuth: true
  }
];

export const BottomNavigation = ({ session, onAuthClick }: BottomNavigationProps) => {
  const location = useLocation();

  const handleProtectedRoute = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !session) {
      toast.error('Você precisa fazer login para acessar esta página');
      if (onAuthClick) onAuthClick();
      return;
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => {
                if (item.requiresAuth && !session) {
                  e.preventDefault();
                  handleProtectedRoute(item.path, item.requiresAuth);
                }
              }}
              className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all duration-200 min-w-[56px] touch-manipulation ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 dark:text-gray-400 active:text-primary active:bg-gray-50 dark:active:bg-gray-800'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'text-primary' : ''}`} />
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

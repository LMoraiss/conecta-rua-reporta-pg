
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Início' }],
  '/list': [{ label: 'Início', href: '/' }, { label: 'Lista' }],
  '/my-reports': [{ label: 'Início', href: '/' }, { label: 'Meus Relatórios' }],
  '/profile': [{ label: 'Início', href: '/' }, { label: 'Perfil' }],
  '/settings': [{ label: 'Início', href: '/' }, { label: 'Configurações' }],
};

export function Breadcrumb() {
  const location = useLocation();
  const items = routeMap[location.pathname] || [{ label: 'Início' }];

  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      <Home className="h-4 w-4" />
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-accent-blue transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

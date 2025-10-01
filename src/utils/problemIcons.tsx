import { 
  Construction, 
  Droplets, 
  Footprints, 
  AlertTriangle, 
  Lightbulb, 
  Trash2, 
  TrafficCone,
  Waves,
  LucideIcon
} from 'lucide-react';

export const problemIcons: Record<string, LucideIcon> = {
  'Buraco na via': Construction,
  'Bueiro aberto': Droplets,
  'Calçada danificada': Footprints,
  'Sinalização': TrafficCone,
  'Alagamento': Waves,
  'Problema de drenagem': Droplets,
  'Iluminação': Lightbulb,
  'Limpeza': Trash2,
  'Outros': AlertTriangle,
};

export const getProblemIcon = (category: string): LucideIcon => {
  return problemIcons[category] || AlertTriangle;
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'high': 
      return 'hsl(0, 84%, 60%)'; // destructive
    case 'medium': 
      return 'hsl(38, 92%, 50%)'; // warning orange
    case 'low': 
      return 'hsl(142, 76%, 36%)'; // accent green
    default: 
      return 'hsl(215, 16%, 47%)'; // muted
  }
};

export const getSeverityBadgeClass = (severity: string): string => {
  switch (severity) {
    case 'high':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'medium':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    case 'low':
      return 'bg-accent/10 text-accent border-accent/20';
    default:
      return 'bg-muted/10 text-muted-foreground border-muted/20';
  }
};

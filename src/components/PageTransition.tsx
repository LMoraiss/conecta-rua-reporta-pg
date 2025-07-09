
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <div className={`animate-fade-in transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export const LoadingSkeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 mb-2"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-1/2"></div>
    </div>
  );
};

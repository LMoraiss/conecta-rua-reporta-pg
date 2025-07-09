
import { ReactNode } from 'react';
import { motion, Variants, Transition } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const LoadingSkeleton = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div 
      className={`animate-pulse ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 mb-2"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-4 w-1/2"></div>
    </motion.div>
  );
};

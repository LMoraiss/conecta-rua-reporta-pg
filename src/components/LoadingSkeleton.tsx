
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'map';
  count?: number;
}

const LoadingSkeleton = ({ type = 'card', count = 3 }: LoadingSkeletonProps) => {
  const renderCardSkeleton = () => (
    <Card className="hover:shadow-soft transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-200 rounded animate-skeleton w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-skeleton"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-skeleton"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-200 rounded-full animate-skeleton w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full animate-skeleton w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full animate-skeleton w-24"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded animate-skeleton w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-skeleton w-2/3"></div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="h-4 bg-gray-200 rounded animate-skeleton w-20"></div>
            <div className="h-4 bg-gray-200 rounded animate-skeleton w-24"></div>
            <div className="h-4 bg-gray-200 rounded animate-skeleton w-28"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMapSkeleton = () => (
    <div className="h-96 bg-gray-200 rounded-lg animate-skeleton relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[slide-in-right_1.5s_ease-in-out_infinite]"></div>
    </div>
  );

  if (type === 'map') {
    return renderMapSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
          {renderCardSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;

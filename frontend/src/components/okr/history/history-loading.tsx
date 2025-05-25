
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HistoryLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      
      <Skeleton className="h-80 w-full" />
    </div>
  );
};

export default HistoryLoading;

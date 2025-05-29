import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  expected?: number;
  total?: number;
  showPercentage?: boolean;
  showComparison?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  expected,
  total = 100,
  showPercentage = true,
  showComparison = false,
  className,
  size = 'md',
  variant = 'default'
}) => {
  const currentPercentage = Math.min((current / total) * 100, 100);
  const expectedPercentage = expected ? Math.min((expected / total) * 100, 100) : 0;
  
  const getVariantColor = () => {
    if (variant !== 'default') {
      switch (variant) {
        case 'success':
          return 'bg-green-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'danger':
          return 'bg-red-500';
      }
    }
    
    // Auto color based on performance vs expected
    if (expected && current < expected * 0.8) {
      return 'bg-red-500';
    } else if (expected && current < expected * 0.95) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      {/* Header with percentage and comparison */}
      {(showPercentage || showComparison) && (
        <div className="flex items-center justify-between">
          {showPercentage && (
            <span className={cn('font-medium text-gray-900', getTextSize())}>
              {currentPercentage.toFixed(1)}%
            </span>
          )}
          
          {showComparison && expected && (
            <div className="flex items-center gap-2">
              <span className={cn('text-gray-500', getTextSize())}>
                Meta: {expectedPercentage.toFixed(1)}%
              </span>
              {currentPercentage !== expectedPercentage && (
                <span className={cn(
                  'font-medium',
                  currentPercentage >= expectedPercentage ? 'text-green-600' : 'text-red-600',
                  getTextSize()
                )}>
                  {currentPercentage >= expectedPercentage ? '+' : ''}
                  {(currentPercentage - expectedPercentage).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div className={cn('relative w-full bg-gray-200 rounded-full overflow-hidden', getHeight())}>
        {/* Expected progress (background) */}
        {showComparison && expected && (
          <div
            className="absolute top-0 left-0 h-full bg-gray-300 rounded-full transition-all duration-300"
            style={{ width: `${expectedPercentage}%` }}
          />
        )}
        
        {/* Current progress */}
        <div
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-500',
            getVariantColor()
          )}
          style={{ width: `${currentPercentage}%` }}
        />
      </div>

      {/* Values display */}
      {(current !== undefined || expected !== undefined) && (
        <div className={cn('flex items-center justify-between text-gray-600', getTextSize())}>
          <span>Atual: {current.toFixed(1)}</span>
          {expected && <span>Meta: {expected.toFixed(1)}</span>}
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 
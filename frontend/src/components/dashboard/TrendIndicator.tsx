import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendDirection } from '@/types/dashboard';

interface TrendIndicatorProps {
  direction: TrendDirection;
  percentage?: number;
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  direction,
  percentage,
  className,
  showPercentage = true,
  size = 'md'
}) => {
  const getIcon = () => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    switch (direction) {
      case TrendDirection.UP:
        return <TrendingUp className={cn(iconSize, 'text-green-600')} />;
      case TrendDirection.DOWN:
        return <TrendingDown className={cn(iconSize, 'text-red-600')} />;
      case TrendDirection.STABLE:
        return <Minus className={cn(iconSize, 'text-gray-500')} />;
      default:
        return <Minus className={cn(iconSize, 'text-gray-500')} />;
    }
  };

  const getTextColor = () => {
    switch (direction) {
      case TrendDirection.UP:
        return 'text-green-600';
      case TrendDirection.DOWN:
        return 'text-red-600';
      case TrendDirection.STABLE:
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getBackgroundColor = () => {
    switch (direction) {
      case TrendDirection.UP:
        return 'bg-green-50';
      case TrendDirection.DOWN:
        return 'bg-red-50';
      case TrendDirection.STABLE:
        return 'bg-gray-50';
      default:
        return 'bg-gray-50';
    }
  };

  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : size === 'lg' ? 'px-2 py-1' : 'px-2 py-0.5';

  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full',
      getBackgroundColor(),
      padding,
      className
    )}>
      {getIcon()}
      {showPercentage && percentage !== undefined && (
        <span className={cn('font-medium', getTextColor(), textSize)}>
          {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
};

export default TrendIndicator; 
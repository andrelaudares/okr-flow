import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StatusColor } from '@/types/dashboard';

interface StatusColorBadgeProps {
  status: StatusColor;
  text?: string;
  className?: string;
  variant?: 'default' | 'outline';
}

const StatusColorBadge: React.FC<StatusColorBadgeProps> = ({
  status,
  text,
  className,
  variant = 'default'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case StatusColor.GREEN:
        return {
          text: text || 'No Prazo',
          className: variant === 'outline' 
            ? 'border-green-200 text-green-700 bg-green-50' 
            : 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case StatusColor.YELLOW:
        return {
          text: text || 'Atenção',
          className: variant === 'outline'
            ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case StatusColor.RED:
        return {
          text: text || 'Atrasado',
          className: variant === 'outline'
            ? 'border-red-200 text-red-700 bg-red-50'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      default:
        return {
          text: text || 'Indefinido',
          className: variant === 'outline'
            ? 'border-gray-200 text-gray-700 bg-gray-50'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={variant}
      className={cn(config.className, className)}
    >
      {config.text}
    </Badge>
  );
};

export default StatusColorBadge; 
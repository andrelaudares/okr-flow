
import React from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { darkTheme, lightTheme } from '../../chart-utils/chart-theme';

interface ChartHeaderProps {
  title: string;
  color?: string;
  currentValue: number;
  projectedValue: number;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({ 
  title, 
  color,
  currentValue, 
  projectedValue 
}) => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Use theme color or fallback to the theme's progress color
  const chartColor = color || theme.progressColor;
  
  return (
    <>
      <h3 
        className="text-lg font-semibold mb-2 flex items-center gap-2"
        style={{ color: theme.textColor }}
      >
        <span 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: chartColor }}
        />
        {title}
      </h3>
      
      <p 
        className="text-sm mb-4"
        style={{ color: theme.subtextColor }}
      >
        Progresso atual: <span className="font-medium" style={{ color: chartColor }}>
          {currentValue}%
        </span> | 
        Previsto: <span className="font-medium" style={{ color: theme.projectedColor }}>
          {projectedValue}%
        </span>
      </p>
    </>
  );
};

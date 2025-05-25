
import React from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { darkTheme, lightTheme } from '../../chart-utils/chart-theme';

export const ComparativeChartHeader: React.FC = () => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <span 
        className="h-3 w-3 rounded-full" 
        style={{ backgroundColor: theme.projectedColor }}
      />
      <h3 
        className="text-lg font-semibold"
        style={{ color: theme.textColor }}
      >
        Comparativo de Objetivos
      </h3>
    </div>
  );
};

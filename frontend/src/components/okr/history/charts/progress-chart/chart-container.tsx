
import React, { PropsWithChildren } from 'react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { darkTheme, lightTheme } from '../../chart-utils/chart-theme';

export const ChartContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <div 
      className="relative p-6 rounded-xl border transition-all hover:shadow-md"
      style={{
        backgroundColor: theme.cardBackground,
        borderColor: theme.cardBorder,
        boxShadow: theme.cardShadow,
      }}
    >
      {children}
    </div>
  );
};

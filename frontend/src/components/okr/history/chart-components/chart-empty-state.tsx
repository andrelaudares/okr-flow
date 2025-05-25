
import React from 'react';
import { ChartTheme, lightTheme } from '../chart-utils/chart-theme';

interface ChartEmptyStateProps {
  theme?: ChartTheme;
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({ theme = lightTheme }) => {
  return (
    <div 
      className="flex items-center justify-center h-full w-full absolute inset-0 backdrop-blur-sm rounded-xl"
      style={{
        backgroundColor: `${theme.cardBackground}90`,
        color: theme.textColor
      }}
    >
      <div className="text-center">
        <p className="mb-2" style={{ color: theme.subtextColor }}>Sem dados disponíveis</p>
        <p className="text-sm" style={{ color: theme.subtextColor }}>Registre progresso para visualizar o histórico</p>
      </div>
    </div>
  );
};

export default ChartEmptyState;

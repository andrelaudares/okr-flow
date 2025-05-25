
import React from 'react';
import { ChartTheme, lightTheme } from '../chart-utils/chart-theme';

interface ChartGradientsProps {
  theme?: ChartTheme;
}

const ChartGradients: React.FC<ChartGradientsProps> = ({ theme = lightTheme }) => {
  return (
    <defs>
      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={theme.progressColor} stopOpacity={0.3}/>
        <stop offset="95%" stopColor={theme.progressColor} stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={theme.projectedColor} stopOpacity={0.2}/>
        <stop offset="95%" stopColor={theme.projectedColor} stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={theme.progressColor} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={theme.progressColor} stopOpacity={0.6}/>
      </linearGradient>
      <linearGradient id="secondaryBarGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={theme.projectedColor} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={theme.projectedColor} stopOpacity={0.6}/>
      </linearGradient>
    </defs>
  );
};

export default ChartGradients;

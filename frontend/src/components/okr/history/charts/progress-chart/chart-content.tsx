
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DataPoint } from '../../types/chart-types';
import { generateProjectedData } from '../../chart-utils/progress-calculations';
import { useChartMargins, useChartDimensions, lightTheme, darkTheme } from '../../chart-utils/chart-theme';
import ChartEmptyState from '../../chart-components/chart-empty-state';
import CustomTooltip from '../../chart-components/custom-tooltip';
import ChartGradients from '../../chart-components/chart-gradients';

interface ProgressChartContentProps {
  data: DataPoint[];
  color?: string;
  showAverage: boolean;
  showProjected: boolean;
  average: number;
}

export const ProgressChartContent: React.FC<ProgressChartContentProps> = ({
  data,
  color,
  showAverage,
  showProjected,
  average
}) => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const margins = useChartMargins();
  const dimensions = useChartDimensions();
  
  // Use theme color or fallback to the theme's progress color
  const chartColor = color || theme.progressColor;
  
  // Format dates for X-axis and add projected data
  const enhancedData = generateProjectedData(data).map(item => ({
    ...item,
    formattedDate: format(new Date(item.date), 'dd/MM', { locale: ptBR })
  }));
  
  // Check if we should connect dots in the line
  // If we have one data point, there's nothing to connect
  const shouldConnectDots = data.length > 1;
  
  // If we only have one data point, create a chart with that point
  const chartData = enhancedData.length === 1 
    ? [
        { 
          ...enhancedData[0], 
          value: 0, 
          projected: 0,
          formattedDate: format(new Date(data[0].date), 'dd/MM', { locale: ptBR })
        }, // Start at 0
        { ...enhancedData[0] } // End at actual value
      ]
    : enhancedData;
  
  return (
    <div style={{ height: dimensions.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={margins}
        >
          <ChartGradients theme={theme} />
          
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke={theme.gridColor} />
          <XAxis 
            dataKey="formattedDate" 
            angle={-45} 
            textAnchor="end" 
            height={60} 
            tick={{ fontSize: dimensions.fontSize, fill: theme.axisColor }} 
            stroke={theme.axisColor}
          />
          <YAxis 
            domain={[0, 100]} 
            tickCount={6} 
            tick={{ fontSize: dimensions.fontSize, fill: theme.axisColor }} 
            tickFormatter={(value) => `${value}%`}
            stroke={theme.axisColor}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
          />
          
          {showAverage && average > 0 && (
            <ReferenceLine 
              y={average} 
              label={{ 
                value: `Média: ${average}%`, 
                position: 'insideBottomRight',
                fill: theme.subtextColor,
                fontSize: dimensions.fontSize
              }} 
              stroke={theme.subtextColor} 
              strokeDasharray="3 3" 
            />
          )}
          
          {showProjected && (
            <>
              <Area 
                type="monotone" 
                dataKey="projected" 
                fill="url(#colorProjected)" 
                stroke="none" 
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke={theme.projectedColor} 
                strokeWidth={dimensions.lineWidth * 0.8}
                name="% Previsto"
                dot={{ r: dimensions.dotSize, strokeWidth: 1, stroke: theme.cardBackground, fill: theme.projectedColor }}
                activeDot={{ r: dimensions.activeDotSize }}
                strokeDasharray="5 5" 
              />
            </>
          )}
          
          <Area 
            type="monotone" 
            dataKey="value" 
            fill="url(#colorValue)" 
            stroke="none" 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={chartColor}
            strokeWidth={dimensions.lineWidth}
            name="Progresso Real"
            dot={{ r: dimensions.dotSize, strokeWidth: 2, stroke: theme.cardBackground, fill: chartColor }}
            activeDot={{ r: dimensions.activeDotSize, stroke: chartColor }}
            strokeDasharray={shouldConnectDots ? "0" : "5 5"}
          />
          
          {/* Current date reference line */}
          {showProjected && (
            <ReferenceLine 
              x={chartData[chartData.length - 1].formattedDate} 
              stroke={theme.subtextColor} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Atual', 
                position: 'insideTopLeft',
                fill: theme.subtextColor,
                fontSize: dimensions.fontSize - 1
              }} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {data.length === 0 && <ChartEmptyState theme={theme} />}
    </div>
  );
};

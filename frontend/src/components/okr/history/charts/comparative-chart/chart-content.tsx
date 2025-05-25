
import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';
import { Objective } from '@/types/okr';
import { ComparativeChartProps } from '../../history-props';
import { useChartMargins, useChartDimensions, lightTheme, darkTheme, ChartTheme } from '../../chart-utils/chart-theme';
import ChartGradients from '../../chart-components/chart-gradients';
import ChartEmptyState from '../../chart-components/chart-empty-state';
import CustomTooltip from '../../chart-components/custom-tooltip';
import { useDarkMode } from '@/hooks/use-dark-mode';

export const ComparativeChartContent: React.FC<ComparativeChartProps> = ({ data, objectives = [] }) => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const margins = useChartMargins();
  const dimensions = useChartDimensions();
  
  // Generate an array of distinct colors for bars
  const barColors = useMemo(() => [
    '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#EF4444'
  ], []);
  
  // Prepare data for the chart
  const chartData = useMemo(() => {
    // Determine the limit based on screen size
    const limit = dimensions.height < 300 ? 4 : 6;
    
    if (objectives && objectives.length > 0) {
      return objectives
        .slice(0, limit) // Limit to top N objectives for readability
        .map(obj => ({
          name: obj.title.length > (dimensions.height < 300 ? 10 : 20) ? 
            obj.title.substring(0, dimensions.height < 300 ? 10 : 20) + '...' : 
            obj.title,
          progresso: obj.progress,
          atividades: obj.activities.length,
          id: obj.id
        }));
    }

    // Fallback to creating data from the history points if available
    return data
      .slice(0, limit) // Limit to top N points
      .map(point => ({
        name: point.objectiveTitle || `Objetivo ${point.objectiveId?.substring(0, 4) || ''}`,
        progresso: point.value || 0,
        atividades: Math.floor(Math.random() * 10) + 1, // Random number of activities for demo
        id: point.objectiveId || ''
      }));
  }, [objectives, data, dimensions.height]);

  const isEmpty = chartData.length === 0;

  return (
    <div style={{ height: dimensions.height, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={margins}
          barGap={5}
          barCategoryGap={15}
        >
          <ChartGradients theme={theme} />
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} opacity={0.1} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: theme.axisColor, fontSize: dimensions.fontSize }}
            tickLine={{ stroke: theme.gridColor }}
            angle={-45}
            textAnchor="end"
            height={60}
            stroke={theme.axisColor}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            stroke={theme.progressColor}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: theme.axisColor, fontSize: dimensions.fontSize }}
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke={theme.projectedColor}
            tick={{ fill: theme.axisColor, fontSize: dimensions.fontSize }}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} />
          <Legend wrapperStyle={{ paddingTop: 15 }} />
          <Bar 
            yAxisId="left" 
            dataKey="progresso" 
            name="Progresso" 
            radius={[4, 4, 0, 0]} 
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={barColors[index % barColors.length]} 
              />
            ))}
            {dimensions.height > 300 && (
              <LabelList 
                dataKey="progresso" 
                position="top" 
                formatter={(value: number) => `${value}%`}
                style={{ 
                  fontSize: dimensions.fontSize - 2, 
                  fill: theme.textColor,
                  fontWeight: "500" 
                }}
              />
            )}
          </Bar>
          <Bar 
            yAxisId="right" 
            dataKey="atividades" 
            fill="url(#secondaryBarGradient)" 
            name="Atividades" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
      
      {isEmpty && <ChartEmptyState theme={theme} />}
    </div>
  );
};

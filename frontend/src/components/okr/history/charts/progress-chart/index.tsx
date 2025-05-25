
import React from 'react';
import { ChartContainer } from './chart-container';
import { ChartHeader } from './chart-header';
import { ProgressChartContent } from './chart-content';
import { DataPoint } from '../../types/chart-types';
import { calculateAverage, calculateCurrentYearPercentage } from '../../chart-utils/progress-calculations';

export interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  showAverage?: boolean;
  showProjected?: boolean;
  usePercentageProjection?: boolean;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  data, 
  title, 
  color,
  showAverage = true,
  showProjected = true,
  usePercentageProjection = true
}) => {  
  // Calculate average progress
  const average = calculateAverage(data);
  
  // Calculate the current percentage based on day of year
  const currentProjectedPercentage = calculateCurrentYearPercentage();
  
  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;

  return (
    <ChartContainer>
      <ChartHeader 
        title={title} 
        color={color}
        currentValue={latestValue} 
        projectedValue={currentProjectedPercentage}
      />
      
      <ProgressChartContent
        data={data}
        color={color}
        showAverage={showAverage}
        showProjected={showProjected}
        average={average}
      />
    </ChartContainer>
  );
};

export default ProgressChart;

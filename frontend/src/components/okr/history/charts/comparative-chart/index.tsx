
import React from 'react';
import { ComparativeChartProps } from '../../history-props';
import { ChartContainer } from '../progress-chart/chart-container';
import { ComparativeChartHeader } from './chart-header';
import { ComparativeChartContent } from './chart-content';

const ComparativeChart: React.FC<ComparativeChartProps> = ({ data, objectives = [] }) => {
  return (
    <ChartContainer>
      <ComparativeChartHeader />
      <ComparativeChartContent data={data} objectives={objectives} />
    </ChartContainer>
  );
};

export default ComparativeChart;

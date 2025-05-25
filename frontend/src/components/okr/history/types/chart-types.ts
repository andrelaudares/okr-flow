
export interface DataPoint {
  date: string;
  value: number;
  projected?: number;
  formattedDate?: string;
}

export interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  showAverage?: boolean;
  showProjected?: boolean;
  usePercentageProjection?: boolean;
}

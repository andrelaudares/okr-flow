
import { useIsMobile } from '@/hooks/use-mobile';

export type ChartTheme = {
  axisColor: string;
  gridColor: string; 
  tooltipBackground: string;
  tooltipBorder: string;
  textColor: string;
  subtextColor: string;
  progressColor: string;
  projectedColor: string;
  backgroundStart: string;
  backgroundEnd: string;
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
  cardHoverShadow: string;
};

export const lightTheme: ChartTheme = {
  axisColor: '#9CA3AF',
  gridColor: 'rgba(243, 244, 246, 0.8)',
  tooltipBackground: '#FFFFFF',
  tooltipBorder: '#E5E7EB',
  textColor: '#111827',
  subtextColor: '#6B7280',
  progressColor: '#8B5CF6',
  projectedColor: '#10B981',
  backgroundStart: 'rgba(139, 92, 246, 0.3)',
  backgroundEnd: 'rgba(139, 92, 246, 0)',
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(243, 244, 246, 1)',
  cardShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHoverShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

export const darkTheme: ChartTheme = {
  axisColor: '#6B7280',
  gridColor: 'rgba(55, 65, 81, 0.3)',
  tooltipBackground: '#1F2937',
  tooltipBorder: '#374151',
  textColor: '#F3F4F6',
  subtextColor: '#9CA3AF',
  progressColor: '#A78BFA',
  projectedColor: '#34D399', 
  backgroundStart: 'rgba(167, 139, 250, 0.2)',
  backgroundEnd: 'rgba(167, 139, 250, 0)',
  cardBackground: '#111827',
  cardBorder: '#1F2937',
  cardShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  cardHoverShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
};

// Hook to get responsive chart margins
export const useChartMargins = () => {
  const isMobile = useIsMobile();
  
  return {
    top: 10,
    right: isMobile ? 10 : 30,
    left: isMobile ? 0 : 10,
    bottom: isMobile ? 70 : 25
  };
};

// Hook to get responsive chart dimensions
export const useChartDimensions = () => {
  const isMobile = useIsMobile();
  
  return {
    height: isMobile ? 250 : 300,
    barSize: isMobile ? 15 : 20,
    fontSize: isMobile ? 10 : 12,
    dotSize: isMobile ? 3 : 4,
    activeDotSize: isMobile ? 5 : 7,
    lineWidth: isMobile ? 2 : 2.5,
  };
};

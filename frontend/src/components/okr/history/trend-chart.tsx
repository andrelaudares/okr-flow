
import React, { useState, useEffect, useMemo } from 'react';
import { HistoryDataPoint, TrendData } from '@/hooks/history/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { format, subDays, eachWeekOfInterval, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomTooltip from './chart-components/custom-tooltip';
import { useChartMargins, useChartDimensions, lightTheme, darkTheme, ChartTheme } from './chart-utils/chart-theme';

interface TrendChartProps {
  historyData: HistoryDataPoint[];
}

const TrendChart: React.FC<TrendChartProps> = ({ historyData }) => {
  const [theme, setTheme] = useState<ChartTheme>(lightTheme);
  const margins = useChartMargins();
  const dimensions = useChartDimensions();
  const isMobile = useIsMobile();

  // Listen for dark mode changes
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setTheme(e.matches ? darkTheme : lightTheme);
    };
    
    // Set initial theme
    updateTheme(darkModeMediaQuery);
    
    // Listen for changes
    darkModeMediaQuery.addEventListener('change', updateTheme);
    return () => darkModeMediaQuery.removeEventListener('change', updateTheme);
  }, []);

  // Calculate weekly averages and target values
  const trendData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    const now = new Date();
    const oldestDate = historyData.reduce(
      (oldest, point) => {
        const date = new Date(point.date);
        return date < oldest ? date : oldest;
      }, 
      now
    );

    // Create a range of weeks from oldest data to now
    const weeks = eachWeekOfInterval({
      start: oldestDate,
      end: now,
    });

    // Calculate weekly averages
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekPoints = historyData.filter(point => {
        const date = new Date(point.date);
        return date >= weekStart && date <= weekEnd;
      });

      const averageProgress = weekPoints.length 
        ? Math.round(weekPoints.reduce((sum, point) => sum + point.value, 0) / weekPoints.length)
        : null;
        
      // Calculate target based on percentage of year completed
      const yearStart = new Date(weekStart.getFullYear(), 0, 1);
      const yearEnd = new Date(weekStart.getFullYear(), 11, 31);
      const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 3600 * 24);
      const daysPassed = (weekStart.getTime() - yearStart.getTime()) / (1000 * 3600 * 24);
      const targetProgress = Math.round((daysPassed / totalDays) * 100);
      
      return {
        period: format(weekStart, 'dd/MM', { locale: ptBR }),
        average: averageProgress,
        target: targetProgress,
        difference: averageProgress !== null ? averageProgress - targetProgress : null
      };
    }).filter(week => week.average !== null);
  }, [historyData]);

  // Calculate if we're ahead or behind schedule overall
  const overallStatus = useMemo(() => {
    if (trendData.length === 0) return { status: 'neutral', value: 0 };
    
    const latestWeek = trendData[trendData.length - 1];
    return {
      status: latestWeek.difference > 0 ? 'ahead' : latestWeek.difference < 0 ? 'behind' : 'on-track',
      value: latestWeek.difference
    };
  }, [trendData]);

  // If no data, show a message
  if (trendData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">
          Não há dados suficientes para análise de tendências.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-xl border transition-all hover:shadow-md"
        style={{
          backgroundColor: theme.cardBackground,
          borderColor: theme.cardBorder,
          boxShadow: theme.cardShadow
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h3 
              className="text-lg font-semibold mb-1"
              style={{ color: theme.textColor }}
            >
              Análise de Tendência de Progresso
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.subtextColor }}
            >
              Comparação entre progresso real e esperado ao longo do tempo
            </p>
          </div>
          
          <div 
            className={`mt-2 md:mt-0 px-4 py-2 rounded-lg ${
              overallStatus.status === 'ahead' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : overallStatus.status === 'behind'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}
          >
            <p className="text-sm font-medium">
              {overallStatus.status === 'ahead' 
                ? `${Math.abs(overallStatus.value)}% à frente do esperado` 
                : overallStatus.status === 'behind'
                ? `${Math.abs(overallStatus.value)}% atrás do esperado`
                : 'Progresso conforme esperado'}
            </p>
          </div>
        </div>

        <div style={{ height: dimensions.height + 50 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={margins}
            >
              <defs>
                <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke={theme.gridColor} />
              <XAxis 
                dataKey="period" 
                tick={{ fill: theme.axisColor, fontSize: dimensions.fontSize }}
                stroke={theme.axisColor}
              />
              <YAxis 
                domain={[0, 100]} 
                tickCount={5} 
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: theme.axisColor, fontSize: dimensions.fontSize }}
                stroke={theme.axisColor}
              />
              <Tooltip content={<CustomTooltip theme={theme} />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              
              <Area 
                type="monotone" 
                dataKey="target" 
                name="Meta Esperada" 
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorTarget)" 
              />
              
              <Area 
                type="monotone" 
                dataKey="average" 
                name="Progresso Real" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorAverage)" 
              />
              
              <ReferenceLine 
                y={0} 
                stroke={theme.axisColor} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <p 
          className="text-sm mt-4 text-center"
          style={{ color: theme.subtextColor }}
        >
          Análise semanal de progresso vs. meta esperada conforme progressão anual
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trendData.slice(-3).reverse().map((week, index) => (
          <div 
            key={index}
            className="border rounded-lg p-4"
            style={{
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
            }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: theme.subtextColor }}>
              Semana de {week.period}
            </p>
            <p className="text-lg font-bold" style={{ color: theme.textColor }}>
              {week.average}% de progresso
            </p>
            <div 
              className={`mt-2 text-sm ${
                week.difference > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : week.difference < 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {week.difference > 0 
                ? `${week.difference}% à frente da meta` 
                : week.difference < 0
                ? `${Math.abs(week.difference)}% atrás da meta`
                : 'Conforme a meta'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;


import React from 'react';
import SummaryMetrics from './summary-metrics';
import ExportReportButton from '@/components/okr/export-report-button';
import { HistoryStatsProps } from './history-props';

const HistoryStats: React.FC<HistoryStatsProps> = ({ 
  data, 
  objectives, 
  overallProgress,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-0">
        <h2 className="text-xl font-bold">Métricas do Projeto</h2>
        <ExportReportButton 
          objectives={objectives} 
          className="mt-4 sm:mt-0"
        />
      </div>
      
      <SummaryMetrics 
        data={data}
        objectives={objectives}
        overallProgress={overallProgress}
      />
    </div>
  );
};

export default HistoryStats;

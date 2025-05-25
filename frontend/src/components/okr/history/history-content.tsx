
import React from 'react';
import { HistoryDataPoint, ObjectiveHistoryData } from '@/hooks/history/types';
import ProgressChart from './charts/progress-chart';
import ComparativeChart from './charts/comparative-chart';
import HistoryStats from './history-stats';
import SummaryMetrics from './summary-metrics';
import EmptyHistoryState from './empty-history-state';
import ObjectivesTable from './objectives-table';
import HistoryLoading from './history-loading';
import ObjectiveHistoryGrid from './objective-history-grid';
import HistoryFilters from './history-filters';
import TrendChart from './trend-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useObjectives } from '@/hooks/use-objectives';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOkrHistory } from '@/hooks/history/use-okr-history';

interface HistoryContentProps {
  isLoading: boolean;
  historyData: HistoryDataPoint[];
  objectiveHistory?: ObjectiveHistoryData[];
  objectives: any[];
  isUpdating?: boolean;
  hasInitialized: boolean;
  hasObjectives: boolean;
}

const HistoryContent: React.FC<HistoryContentProps> = ({
  isLoading,
  historyData,
  objectiveHistory = [],
  objectives,
  isUpdating = false,
  hasInitialized,
  hasObjectives,
}) => {
  const { dateRangeFilter, setDateRangeFilter } = useOkrHistory();
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return <HistoryLoading />;
  }

  if (!hasObjectives) {
    return <EmptyHistoryState 
      hasObjectives={false} 
      objectives={[]} 
      currentOverallProgress={0}
    />;
  }

  if (historyData.length === 0 && hasInitialized) {
    return (
      <div className="space-y-6 py-4">
        <ProgressChart 
          data={[]} 
          title="Evolução do Progresso"
          color="#8B5CF6" 
        />
        <EmptyHistoryState 
          hasObjectives={true} 
          objectives={[]} 
          currentOverallProgress={0}
        />
      </div>
    );
  }

  const latestProgress = historyData.length > 0 ? historyData[historyData.length - 1].value : 0;

  return (
    <div className="space-y-6 py-4">
      <HistoryFilters 
        dateRangeFilter={dateRangeFilter}
        onFilterChange={setDateRangeFilter}
        isUpdating={isUpdating}
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 bg-gray-50 dark:bg-gray-800 p-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="objectives" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
          >
            Objetivos
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
          >
            Tendências
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
          >
            Detalhes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <SummaryMetrics 
            data={historyData} 
            objectives={objectives}
            overallProgress={latestProgress}
          />
          
          {/* Responsive layout that changes from columns to rows on mobile */}
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6`}>
            <ProgressChart 
              data={historyData} 
              title="Evolução do Progresso"
              color="#8B5CF6" 
              showProjected={true}
              usePercentageProjection={true}
            />
            <ComparativeChart 
              data={historyData}
              objectives={objectives}
            />
          </div>
          
          <HistoryStats 
            data={historyData} 
            objectives={objectives}
            overallProgress={latestProgress}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="objectives" className="animate-fade-in">
          {objectiveHistory.length > 0 ? (
            <ObjectiveHistoryGrid objectiveHistory={objectiveHistory} />
          ) : (
            <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-muted-foreground">
                Não há dados históricos suficientes para exibir o progresso dos objetivos individuais.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="trends" className="animate-fade-in">
          <TrendChart historyData={historyData} />
        </TabsContent>
        
        <TabsContent value="details" className="animate-fade-in">
          <ObjectivesTable 
            data={historyData}
            objectives={objectives}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryContent;

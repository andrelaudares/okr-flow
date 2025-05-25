
import React from 'react';
import { useOkrHistory } from '@/hooks/history/use-okr-history';
import HistoryLoading from '@/components/okr/history/history-loading';
import EmptyHistoryState from '@/components/okr/history/empty-history-state';
import HistoryContent from '@/components/okr/history/history-content';
import { ChartLine as HistoryIcon } from 'lucide-react';

const History = () => {
  const { 
    isLoading, 
    objectives, 
    overallProgressHistory, 
    objectiveHistory, 
    hasHistoryData,
    hasObjectives,
    currentOverallProgress,
    isUpdating
  } = useOkrHistory();

  return (
    <div className="container py-6 max-w-7xl animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <HistoryIcon className="h-5 w-5 text-purple-600" />
        </div>
        <h1 className="text-2xl font-semibold">Histórico e Evolução dos OKRs</h1>
      </div>
      
      {isLoading ? (
        <HistoryLoading />
      ) : !hasObjectives || objectives.length === 0 ? (
        <EmptyHistoryState 
          hasObjectives={false}
          objectives={objectives} 
          currentOverallProgress={currentOverallProgress}
        />
      ) : !hasHistoryData || overallProgressHistory.length === 0 ? (
        <EmptyHistoryState 
          hasObjectives={true}
          objectives={objectives} 
          currentOverallProgress={currentOverallProgress}
        />
      ) : (
        <HistoryContent 
          historyData={overallProgressHistory}
          objectiveHistory={objectiveHistory}
          objectives={objectives}
          isLoading={isLoading}
          isUpdating={isUpdating}
          hasInitialized={true}
          hasObjectives={hasObjectives}
        />
      )}
    </div>
  );
};

export default History;

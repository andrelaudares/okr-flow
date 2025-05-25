
import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Objective } from '@/types/okr';
import SummaryMetrics from './summary-metrics';
import ProgressChart from './charts/progress-chart';

interface EmptyHistoryStateProps {
  hasObjectives: boolean;
  objectives: Objective[];
  currentOverallProgress: number;
}

const EmptyHistoryState: React.FC<EmptyHistoryStateProps> = ({
  hasObjectives,
  objectives,
  currentOverallProgress
}) => {
  if (!hasObjectives) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sem dados disponíveis</AlertTitle>
          <AlertDescription>
            Não há objetivos cadastrados. Adicione objetivos e atividades no Dashboard.
          </AlertDescription>
        </Alert>
        
        <div className="text-center py-10">
          <Button asChild>
            <Link to="/dashboard">
              Ir para o Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Create a simple evolution chart with just the current progress
  const sampleData = [
    { date: new Date().toISOString(), value: currentOverallProgress }
  ];
  
  return (
    <div className="space-y-10">
      <SummaryMetrics 
        data={sampleData} // Passando um array com um ponto de dados
        objectives={objectives}
        overallProgress={currentOverallProgress}
      />
      
      <div>
        <ProgressChart 
          data={sampleData}
          title="Evolução do Progresso" 
          color="#8B5CF6"
        />
      </div>
    </div>
  );
};

export default EmptyHistoryState;

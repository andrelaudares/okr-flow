import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import KeyResultList from '@/components/key-results/KeyResultList';
import { useObjectives } from '@/hooks/use-objectives';
import { ArrowLeft, Target } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import ErrorBoundary from '@/components/ui/error-boundary';

const ObjectiveKeyResults = () => {
  const { objectiveId } = useParams<{ objectiveId: string }>();
  const navigate = useNavigate();
  
  const { getObjectiveById } = useObjectives();
  const { data: objective, isLoading, error } = getObjectiveById(objectiveId || '');

  if (isLoading) {
    return (
      <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
        <Loading text="Carregando objetivo..." />
      </div>
    );
  }

  if (error || !objective) {
    return (
      <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Objetivo não encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                O objetivo que você está procurando não existe ou foi removido.
              </p>
              <Button onClick={() => navigate('/objectives')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Objetivos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container py-6 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/objectives')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="bg-nobug-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-nobug-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {objective.title}
              </h1>
              <p className="text-sm text-gray-600">
                Gerenciar Key Results
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Objetivo */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Status</h3>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  objective.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  objective.status === 'ON_TRACK' ? 'bg-green-100 text-green-800' :
                  objective.status === 'AT_RISK' ? 'bg-yellow-100 text-yellow-800' :
                  objective.status === 'BEHIND' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {objective.status === 'PLANNED' ? 'Planejado' :
                   objective.status === 'ON_TRACK' ? 'No Prazo' :
                   objective.status === 'AT_RISK' ? 'Em Risco' :
                   objective.status === 'BEHIND' ? 'Atrasado' :
                   objective.status === 'COMPLETED' ? 'Concluído' : objective.status}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Progresso</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(objective.progress)}%
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Ciclo</h3>
                <p className="text-gray-600">{objective.cycle_name}</p>
              </div>
            </div>
            
            {objective.description && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600">{objective.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Key Results */}
        <KeyResultList 
          objectiveId={objective.id} 
          objectiveTitle={objective.title}
        />
      </div>
    </ErrorBoundary>
  );
};

export default ObjectiveKeyResults; 
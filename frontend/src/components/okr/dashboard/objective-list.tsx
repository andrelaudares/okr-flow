
import React, { memo } from 'react';
import { Objective } from '@/types/okr';
import ObjectiveCard from '../objective-card';
import { ActivityItem } from '@/types/okr';

interface ObjectiveListProps {
  objectives: Objective[];
  isLoading: boolean;
  isProcessing?: boolean;
  onAddActivity: (objectiveId: string, activity: Omit<ActivityItem, "id">) => void;
  onUpdateActivity: (objectiveId: string, activity: ActivityItem) => void;
  onDeleteActivity: (objectiveId: string, activityId: string) => void;
  onDeleteObjective: (objectiveId: string) => void;
}

const ObjectiveList: React.FC<ObjectiveListProps> = memo(({
  objectives,
  isLoading,
  isProcessing = false,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onDeleteObjective,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-16 bg-white/60 rounded-xl border border-gray-100 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Carregando objetivos...</p>
      </div>
    );
  }

  if (!objectives || objectives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/60 rounded-xl border border-gray-100 shadow-sm text-center">
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium text-lg">Nenhum objetivo encontrado.</p>
        <p className="text-gray-400 mt-2">Crie um novo objetivo para começar.</p>
      </div>
    );
  }

  // Dividir os objetivos em duas colunas de maneira responsiva
  const midPoint = Math.ceil(objectives.length / 2);
  const leftColumnObjectives = objectives.slice(0, midPoint);
  const rightColumnObjectives = objectives.slice(midPoint);

  return (
    <>
      <div className="space-y-6">
        {leftColumnObjectives.map((objective) => (
          <ObjectiveCard
            key={objective.id}
            id={objective.id}
            title={objective.title}
            description={objective.description || ""}
            progress={objective.progress}
            activities={objective.activities || []}
            isProcessing={isProcessing}
            onAddActivity={(activity) => onAddActivity(objective.id, activity)}
            onUpdateActivity={(activity) => onUpdateActivity(objective.id, activity)}
            onDeleteActivity={(activityId) => onDeleteActivity(objective.id, activityId)}
            onDeleteObjective={() => onDeleteObjective(objective.id)}
          />
        ))}
      </div>
      <div className="space-y-6">
        {rightColumnObjectives.map((objective) => (
          <ObjectiveCard
            key={objective.id}
            id={objective.id}
            title={objective.title}
            description={objective.description || ""}
            progress={objective.progress}
            activities={objective.activities || []}
            isProcessing={isProcessing}
            onAddActivity={(activity) => onAddActivity(objective.id, activity)}
            onUpdateActivity={(activity) => onUpdateActivity(objective.id, activity)}
            onDeleteActivity={(activityId) => onDeleteActivity(objective.id, activityId)}
            onDeleteObjective={() => onDeleteObjective(objective.id)}
          />
        ))}
      </div>
    </>
  );
});

ObjectiveList.displayName = 'ObjectiveList';

export default ObjectiveList;

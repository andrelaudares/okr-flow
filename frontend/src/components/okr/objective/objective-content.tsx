
import React from 'react';
import { ActivityItem } from '@/types/okr';
import ActivityCard from '../activity-card/index';

interface ObjectiveContentProps {
  activities: ActivityItem[];
  onUpdateActivity: (activity: ActivityItem) => void;
  onDeleteActivity: (activityId: string) => void;
  isDisabled: boolean;
  activityOperations: Record<string, boolean>;
}

const ObjectiveContent: React.FC<ObjectiveContentProps> = ({
  activities,
  onUpdateActivity,
  onDeleteActivity,
  isDisabled,
  activityOperations
}) => {
  return (
    <div className="pt-2">
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Nenhuma atividade ainda. Adicione uma para começar!
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard 
              key={`${activity.id}-${activity.progress}`}
              activity={activity}
              onUpdate={onUpdateActivity}
              onDelete={() => onDeleteActivity(activity.id)}
              disabled={isDisabled || activityOperations[`update-${activity.id}`] || activityOperations[`delete-${activity.id}`]}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ObjectiveContent;

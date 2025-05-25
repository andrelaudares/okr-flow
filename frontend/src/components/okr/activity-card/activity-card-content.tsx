
import React from 'react';
import { ActivityItem } from '@/types/okr';
import ActivityHeader from './activity-header';
import ActivityObservation from './activity-observation';
import ActivityProgressSlider from './activity-progress-slider';
import ActivityActionsMenu from './activity-actions-menu';

interface ActivityCardContentProps {
  activity: ActivityItem;
  progress: number;
  isUpdating: boolean;
  disabled: boolean;
  onProgressChange: (value: number[]) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActivityCardContent: React.FC<ActivityCardContentProps> = ({
  activity,
  progress,
  isUpdating,
  disabled,
  onProgressChange,
  onEdit,
  onDelete
}) => {
  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-start">
        <ActivityHeader activity={activity} />
        <ActivityActionsMenu 
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
          isUpdating={isUpdating}
        />
      </div>
      
      <ActivityObservation observation={activity.observation} />
      
      <div className="mt-1">
        {activity.dueDate && (
          <div className="text-xs text-gray-500 mb-2">
            Prazo: <span className="font-medium">{new Date(activity.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
      
      <ActivityProgressSlider 
        progress={progress}
        onProgressChange={onProgressChange}
        disabled={isUpdating || disabled}
      />
      
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="animate-pulse w-6 h-6 rounded-full bg-primary/20"></div>
        </div>
      )}
    </div>
  );
};

export default ActivityCardContent;

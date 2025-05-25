
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityItem } from '@/types/okr';
import EditActivityDialog from '../edit-activity-dialog';
import ActivityCardContent from './activity-card-content';
import { useActivityCard } from './use-activity-card';

interface ActivityCardProps {
  activity: ActivityItem;
  onUpdate: (updatedActivity: ActivityItem) => void;
  onDelete: () => void;
  disabled?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onUpdate, 
  onDelete, 
  disabled = false 
}) => {
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    progress,
    isUpdating,
    handleProgressChange,
    handleUpdateActivity
  } = useActivityCard({ 
    activity, 
    onUpdate, 
    disabled 
  });

  // Determine background gradient based on activity status
  const getStatusGradient = () => {
    switch (activity.status) {
      case 'Completed':
        return 'bg-gradient-to-r from-green-50 to-white';
      case 'In Progress':
        return 'bg-gradient-to-r from-blue-50 to-white';
      case 'At Risk':
        return 'bg-gradient-to-r from-amber-50 to-white';
      case 'On Hold':
        return 'bg-gradient-to-r from-purple-50 to-white';
      default:
        return 'bg-gradient-to-r from-gray-50 to-white';
    }
  };

  return (
    <Card className={`border shadow-sm hover:shadow-md transition-all ${getStatusGradient()} rounded-lg overflow-hidden`}>
      <CardContent className="p-0">
        <ActivityCardContent
          activity={activity}
          progress={progress}
          isUpdating={isUpdating}
          disabled={disabled}
          onProgressChange={handleProgressChange}
          onEdit={() => {
            console.log('Edit button clicked', { isUpdating, disabled });
            if (!isUpdating && !disabled) setIsEditDialogOpen(true);
          }}
          onDelete={() => {
            console.log('Delete button clicked', { isUpdating, disabled });
            if (!isUpdating && !disabled) onDelete();
          }}
        />
      </CardContent>
      
      {isEditDialogOpen && (
        <EditActivityDialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            console.log('Dialog open state changing', { open, isUpdating, disabled });
            if (!isUpdating && !disabled) setIsEditDialogOpen(open);
          }}
          activity={activity}
          onSave={handleUpdateActivity}
        />
      )}
    </Card>
  );
};

export default ActivityCard;

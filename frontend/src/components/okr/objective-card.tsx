
import React, { useState, memo, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ActivityItem } from '@/types/okr';
import AddActivityDialog from './add-activity-dialog';
import ObjectiveHeader from './objective/objective-header';
import ObjectiveContent from './objective/objective-content';
import ObjectiveFooter from './objective/objective-footer';

export interface ObjectiveProps {
  id: string;
  title: string;
  description?: string; // Tornar opcional para compatibilidade com API
  progress: number;
  activities: ActivityItem[];
  isProcessing?: boolean;
  onAddActivity: (activity: Omit<ActivityItem, "id">) => void;
  onUpdateActivity: (activity: ActivityItem) => void;
  onDeleteActivity: (activityId: string) => void;
  onDeleteObjective: (objectiveId: string) => void;
}

const ObjectiveCard: React.FC<ObjectiveProps> = memo(({
  id,
  title,
  description,
  progress,
  activities,
  isProcessing = false,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onDeleteObjective
}) => {
  const [isAddActivityDialogOpen, setIsAddActivityDialogOpen] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [activityOperations, setActivityOperations] = useState<Record<string, boolean>>({});

  // Combinamos os estados de processamento global e local
  const isDisabled = isProcessing || localProcessing;

  // Reset local processing when isProcessing changes from true to false
  useEffect(() => {
    if (!isProcessing && localProcessing) {
      // Give a small delay to ensure UI is updated properly
      setTimeout(() => setLocalProcessing(false), 300);
    }
  }, [isProcessing, localProcessing]);

  const handleAddActivity = (activityData: Omit<ActivityItem, 'id'>) => {
    if (isDisabled) return;
    
    setLocalProcessing(true);
    onAddActivity(activityData);
    
    setTimeout(() => {
      setIsAddActivityDialogOpen(false);
    }, 300);
  };
  
  const handleUpdateActivity = (activity: ActivityItem) => {
    if (isDisabled) return;
    
    // Track this specific activity operation
    const operationId = `update-${activity.id}`;
    setActivityOperations(prev => ({ ...prev, [operationId]: true }));
    
    setLocalProcessing(true);
    onUpdateActivity(activity);
  };
  
  const handleDeleteActivity = (activityId: string) => {
    if (isDisabled) return;
    
    // Track this specific activity operation
    const operationId = `delete-${activityId}`;
    setActivityOperations(prev => ({ ...prev, [operationId]: true }));
    
    setLocalProcessing(true);
    onDeleteActivity(activityId);
  };

  const handleDeleteObjective = () => {
    if (isDisabled) return;
    
    setLocalProcessing(true);
    onDeleteObjective(id);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 relative rounded-xl border border-gray-100 overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500"></div>
      <CardHeader className="pb-2">
        <ObjectiveHeader
          title={title}
          description={description}
          progress={progress}
          onDeleteObjective={handleDeleteObjective}
          isDisabled={isDisabled}
        />
      </CardHeader>
      <CardContent className="pt-2">
        <ObjectiveContent
          activities={activities}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
          isDisabled={isDisabled}
          activityOperations={activityOperations}
        />
      </CardContent>
      <CardFooter className="bg-gray-50/50 border-t border-gray-100">
        <ObjectiveFooter
          onAddActivity={() => !isDisabled && setIsAddActivityDialogOpen(true)}
          isDisabled={isDisabled}
        />
      </CardFooter>
      {isAddActivityDialogOpen && (
        <AddActivityDialog 
          open={isAddActivityDialogOpen}
          onOpenChange={(open) => !isDisabled && setIsAddActivityDialogOpen(open)}
          onAdd={handleAddActivity}
        />
      )}
    </Card>
  );
});

ObjectiveCard.displayName = 'ObjectiveCard';

export default ObjectiveCard;

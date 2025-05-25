
import { StateCreator } from 'zustand';
import { ActivityItem, Objective } from '@/types/okr';
import { v4 as uuidv4 } from 'uuid';
import { calculateAverageProgress } from '@/utils/okr/progress-calculation';

export interface ActivityState {
  addActivity: (objectiveId: string, activityData: Omit<ActivityItem, 'id'>) => void;
  updateActivity: (objectiveId: string, activity: ActivityItem) => void;
  deleteActivity: (objectiveId: string, activityId: string) => void;
  updateAssigneeNames: (oldName: string, newName: string) => void;
}

export const createActivitySlice: StateCreator<
  ActivityState & { objectives: Objective[]; version: number },
  [],
  [],
  ActivityState
> = (set) => ({
  addActivity: (objectiveId, activityData) =>
    set((state) => {
      const newActivity: ActivityItem = {
        id: uuidv4(),
        ...activityData,
      };
      
      const updatedObjectives = state.objectives.map((objective) => {
        if (objective.id === objectiveId) {
          const updatedActivities = [...objective.activities, newActivity];
          const totalProgress = calculateAverageProgress(updatedActivities);
            
          return {
            ...objective,
            activities: updatedActivities,
            progress: totalProgress,
          };
        }
        return objective;
      });
      
      return { 
        objectives: updatedObjectives,
        version: state.version + 1
      };
    }),

  updateActivity: (objectiveId, updatedActivity) =>
    set((state) => {
      console.log('Updating activity in store:', updatedActivity);
      
      // First find the objective that contains this activity
      let objectiveWithActivity = state.objectives.find(objective => 
        objective.activities.some(activity => activity.id === updatedActivity.id)
      );
      
      if (!objectiveWithActivity) {
        console.warn('Activity not found in any objective');
        return state;
      }
      
      // If the provided objectiveId doesn't match where the activity was found,
      // use the correct objective ID
      if (objectiveWithActivity.id !== objectiveId) {
        console.warn('Activity found in a different objective than expected');
        objectiveId = objectiveWithActivity.id;
      }
      
      const updatedObjectives = state.objectives.map((objective) => {
        if (objective.id === objectiveId) {
          const existingActivity = objective.activities.find(
            (activity) => activity.id === updatedActivity.id
          );
          
          if (!existingActivity) {
            return objective;
          }
          
          const updatedActivities = objective.activities.map((activity) => 
            activity.id === updatedActivity.id ? {...updatedActivity} : activity
          );
          
          const totalProgress = calculateAverageProgress(updatedActivities);
          
          return {
            ...objective,
            activities: updatedActivities,
            progress: totalProgress,
          };
        }
        return objective;
      });
      
      return { 
        objectives: updatedObjectives,
        version: state.version + 1
      };
    }),

  deleteActivity: (objectiveId, activityId) =>
    set((state) => {
      const updatedObjectives = state.objectives.map((objective) => {
        if (objective.id === objectiveId) {
          const updatedActivities = objective.activities.filter(
            (activity) => activity.id !== activityId
          );
          
          const totalProgress = calculateAverageProgress(updatedActivities);
            
          return {
            ...objective,
            activities: updatedActivities,
            progress: totalProgress,
          };
        }
        return objective;
      });
      
      return { 
        objectives: updatedObjectives,
        version: state.version + 1
      };
    }),

  updateAssigneeNames: (oldName, newName) =>
    set((state) => {
      const updatedObjectives = state.objectives.map((objective) => {
        const hasUpdates = objective.activities.some(
          (activity) => activity.assignee === oldName
        );
        
        if (!hasUpdates) return objective;
        
        const updatedActivities = objective.activities.map((activity) =>
          activity.assignee === oldName
            ? { ...activity, assignee: newName }
            : activity
        );
        
        return {
          ...objective,
          activities: updatedActivities,
        };
      });
      
      return { 
        objectives: updatedObjectives,
        version: state.version + 1
      };
    }),
});

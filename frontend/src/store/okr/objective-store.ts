
import { StateCreator } from 'zustand';
import { Objective } from '@/types/okr';
import { v4 as uuidv4 } from 'uuid';

export interface ObjectiveState {
  objectives: Objective[];
  version: number;
  addObjective: (objective: { title: string; description: string }) => Promise<string>;
  deleteObjective: (objectiveId: string) => void;
}

export const createObjectiveSlice: StateCreator<
  ObjectiveState,
  [],
  [],
  ObjectiveState
> = (set) => ({
  objectives: [],
  version: 1,
  
  addObjective: (objectiveData) => 
    new Promise<string>((resolve) => {
      const newObjective: Objective = {
        id: uuidv4(),
        title: objectiveData.title,
        description: objectiveData.description,
        progress: 0,
        activities: [],
        createdAt: new Date().toISOString(),
      };

      set((state) => ({ 
        objectives: [...state.objectives, newObjective],
        version: state.version + 1
      }));
      
      resolve(newObjective.id);
    }),
    
  deleteObjective: (objectiveId) =>
    set((state) => ({
      objectives: state.objectives.filter((objective) => objective.id !== objectiveId),
      version: state.version + 1
    })),
});

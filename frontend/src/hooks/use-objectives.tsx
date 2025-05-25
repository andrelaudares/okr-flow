
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createActivitySlice, ActivityState } from '@/store/okr/activity-store';
import { createObjectiveSlice, ObjectiveState } from '@/store/okr/objective-store';

export const useObjectives = create<ObjectiveState & ActivityState>()(
  persist(
    (...a) => ({
      ...createObjectiveSlice(...a),
      ...createActivitySlice(...a),
    }),
    {
      name: 'nobug-objectives',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return { 
          ...(persistedState as ObjectiveState & ActivityState), 
          version: 1 
        };
      }
    }
  )
);

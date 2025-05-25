
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { ensureObjectiveHasHistory } from '@/utils/supabase/history/ensure-history';
import { toast } from 'sonner';

interface UseHistoryInitializationProps {
  objectives: Objective[];
  isUsingRemoteData: boolean;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: 'open' | 'inProgress' | 'completed' | 'archived';
  activities: Activity[];
  overallProgress: number;
  assignee: string;
}

interface Activity {
  id: string;
  objectiveId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
}

export const useHistoryInitialization = ({ objectives, isUsingRemoteData }: UseHistoryInitializationProps) => {
  const { user } = useAuth();
  const isInitializationRef = useRef(false);

  const initializeHistory = useCallback(async () => {
    if (!user || !isUsingRemoteData || isInitializationRef.current) {
      return;
    }

    isInitializationRef.current = true;

    try {
      if (objectives && objectives.length > 0) {
        await Promise.all(
          objectives.map(objective => ensureObjectiveHasHistory(objective.id, objective.overallProgress || 0))
        );
        toast.success('Histórico dos objetivos inicializado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao inicializar o histórico dos objetivos:', error);
      toast.error('Erro ao inicializar o histórico dos objetivos.');
    } finally {
      isInitializationRef.current = false;
    }
  }, [objectives, user, isUsingRemoteData]);

  useEffect(() => {
    initializeHistory();
  }, [initializeHistory]);
};

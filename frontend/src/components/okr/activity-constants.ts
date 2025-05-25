
import { ActivityStatus } from '@/types/okr';

export const statusOptions: ActivityStatus[] = [
  'Not Started',
  'In Progress',
  'At Risk',
  'Completed',
  'On Hold'
];

export const statusLabel: Record<ActivityStatus, string> = {
  'Not Started': 'Não iniciada',
  'In Progress': 'Em progresso',
  'At Risk': 'Em risco',
  'Completed': 'Concluída',
  'On Hold': 'Em espera',
};

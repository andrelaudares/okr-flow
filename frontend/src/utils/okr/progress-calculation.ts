
import { ActivityItem } from '@/types/okr';

export function calculateAverageProgress(activities: ActivityItem[]): number {
  if (activities.length === 0) return 0;
  const total = activities.reduce((sum, activity) => sum + activity.progress, 0);
  return Math.round(total / activities.length);
}

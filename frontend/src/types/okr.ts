
export type ActivityStatus = 'Not Started' | 'In Progress' | 'At Risk' | 'Completed' | 'On Hold';

export interface ActivityItem {
  id: string;
  title: string;
  status: ActivityStatus;
  progress: number;
  assignee: string;
  dueDate?: string; // Added due date field
  observation?: string; // Added observation field
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  progress: number;
  activities: ActivityItem[];
  createdAt?: string; // Added createdAt as optional property
}

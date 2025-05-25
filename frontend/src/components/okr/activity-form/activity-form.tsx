
import React, { useState, useEffect } from 'react';
import { ActivityItem } from '@/types/okr';
import { toast } from 'sonner';
import ActivityTitleField from './activity-title-field';
import ActivityAssigneeField from './activity-assignee-field';
import ActivityStatusField from './activity-status-field';
import ActivityProgressField from './activity-progress-field';
import ActivityDueDateField from './activity-due-date-field';
import ActivityObservationField from './activity-observation-field';
import ActivityFormButtons from './activity-form-buttons';

interface ActivityFormProps {
  activity: ActivityItem;
  onSubmit: (updatedActivity: ActivityItem) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  activity,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    assignee: string;
    status: ActivityItem['status'];
    progress: number;
    dueDate: string;
    observation: string;
  }>({
    title: '',
    assignee: '',
    status: 'Not Started',
    progress: 0,
    dueDate: '',
    observation: ''
  });

  // Reset form when activity changes
  useEffect(() => {
    setFormData({
      title: activity.title,
      assignee: activity.assignee,
      status: activity.status,
      progress: activity.progress,
      dueDate: activity.dueDate || '',
      observation: activity.observation || ''
    });
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Por favor, insira um título para a atividade');
      return;
    }

    if (!formData.assignee) {
      toast.error('Por favor, selecione um responsável');
      return;
    }

    // Create updated activity
    const updatedActivity: ActivityItem = {
      ...activity,
      title: formData.title,
      status: formData.status,
      assignee: formData.assignee,
      progress: formData.progress,
      dueDate: formData.dueDate || undefined,
      observation: formData.observation || undefined
    };
    
    onSubmit(updatedActivity);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 py-4">
        <ActivityTitleField 
          title={formData.title} 
          onChange={(value) => handleChange('title', value)}
          disabled={isSubmitting}
        />

        <ActivityAssigneeField 
          assignee={formData.assignee} 
          onChange={(value) => handleChange('assignee', value)}
          disabled={isSubmitting}
        />

        <ActivityStatusField 
          status={formData.status} 
          onChange={(value) => handleChange('status', value)}
          disabled={isSubmitting}
        />

        <ActivityProgressField 
          progress={formData.progress} 
          onChange={(value) => handleChange('progress', value)}
          disabled={isSubmitting}
        />

        <ActivityDueDateField 
          dueDate={formData.dueDate} 
          onChange={(value) => handleChange('dueDate', value)}
          disabled={isSubmitting}
        />

        <ActivityObservationField 
          observation={formData.observation} 
          onChange={(value) => handleChange('observation', value)}
          disabled={isSubmitting}
        />
      </div>
      
      <ActivityFormButtons 
        onCancel={onCancel} 
        isSubmitting={isSubmitting} 
      />
    </form>
  );
};

export default ActivityForm;

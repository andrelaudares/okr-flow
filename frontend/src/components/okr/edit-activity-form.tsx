
import React from 'react';
import { ActivityItem } from '@/types/okr';
import { ActivityForm } from './activity-form';

interface EditActivityFormProps {
  activity: ActivityItem;
  onSubmit: (updatedActivity: ActivityItem) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditActivityForm: React.FC<EditActivityFormProps> = ({
  activity,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <ActivityForm
      activity={activity}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
};

export default EditActivityForm;

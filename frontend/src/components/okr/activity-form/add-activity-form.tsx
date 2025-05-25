
import React, { useState } from 'react';
import { ActivityItem, ActivityStatus } from '@/types/okr';
import ActivityTitleField from './activity-title-field';
import ActivityAssigneeField from './activity-assignee-field';
import ActivityStatusField from './activity-status-field';
import ActivityProgressField from './activity-progress-field';
import ActivityDueDateField from './activity-due-date-field';
import ActivityObservationField from './activity-observation-field';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AddActivityFormProps {
  onAdd: (data: Omit<ActivityItem, 'id'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({
  onAdd,
  onCancel,
  isSubmitting
}) => {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState<ActivityStatus>('Not Started');
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [observation, setObservation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Por favor, insira um título para a atividade');
      return;
    }

    if (!assignee) {
      toast.error('Por favor, selecione um responsável');
      return;
    }

    onAdd({
      title,
      status,
      assignee,
      progress,
      dueDate: dueDate || undefined,
      observation: observation || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <ActivityTitleField
          title={title}
          onChange={setTitle}
          disabled={isSubmitting}
        />

        <ActivityAssigneeField
          assignee={assignee}
          onChange={setAssignee}
          disabled={isSubmitting}
        />

        <ActivityStatusField
          status={status}
          onChange={(value) => setStatus(value)}
          disabled={isSubmitting}
        />

        <ActivityProgressField
          progress={progress}
          onChange={(value) => setProgress(value)}
          disabled={isSubmitting}
        />

        <ActivityDueDateField
          dueDate={dueDate}
          onChange={(value) => setDueDate(value)}
          disabled={isSubmitting}
        />

        <ActivityObservationField
          observation={observation}
          onChange={(value) => setObservation(value)}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          type="button"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Criando..." : "Criar atividade"}
        </Button>
      </div>
    </form>
  );
};

export default AddActivityForm;

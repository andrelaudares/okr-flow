
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ActivityItem } from '@/types/okr';
import AddActivityForm from './activity-form/add-activity-form';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<ActivityItem, 'id'>) => void;
}

const AddActivityDialog: React.FC<AddActivityDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = (activityData: Omit<ActivityItem, 'id'>) => {
    setIsSubmitting(true);
    
    try {
      onAdd(activityData);
      onOpenChange(false);
    } finally {
      // Reset form state
      setTimeout(() => setIsSubmitting(false), 300);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && onOpenChange(isOpen)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova atividade</DialogTitle>
          <DialogDescription>
            Cadastre uma nova atividade para este objetivo.
          </DialogDescription>
        </DialogHeader>
        
        <AddActivityForm 
          onAdd={handleAdd} 
          onCancel={handleCancel} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddActivityDialog;

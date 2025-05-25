
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ActivityItem } from '@/types/okr';
import EditActivityForm from './edit-activity-form';
import { toast } from 'sonner';

interface EditActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ActivityItem;
  onSave: (updatedActivity: ActivityItem) => void;
}

const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  open,
  onOpenChange,
  activity,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = (updatedActivity: ActivityItem) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Garantir que o ID da atividade original seja mantido
      const activityToSave = {
        ...updatedActivity,
        id: activity.id
      };
      
      // Call the parent's onSave method
      onSave(activityToSave);
      
      // Only show toast here, not in the parent
      // This prevents duplicate toasts
      // toast.success('Atividade atualizada com sucesso');
      
      // Parent component will close the dialog
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      toast.error('Erro ao salvar alterações. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!isSubmitting) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar atividade</DialogTitle>
          <DialogDescription>
            Faça alterações nos detalhes da atividade.
          </DialogDescription>
        </DialogHeader>
        <EditActivityForm 
          activity={activity}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditActivityDialog;

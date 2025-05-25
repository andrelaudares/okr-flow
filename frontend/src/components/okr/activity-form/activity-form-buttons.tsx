
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader } from 'lucide-react';

interface ActivityFormButtonsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const ActivityFormButtons: React.FC<ActivityFormButtonsProps> = ({
  onCancel,
  isSubmitting,
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-2">
      <Button 
        variant="outline" 
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex items-center gap-2 transition-all hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
        Cancelar
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Salvar alterações
          </>
        )}
      </Button>
    </div>
  );
};

export default ActivityFormButtons;

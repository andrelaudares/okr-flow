
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ObjectiveFooterProps {
  onAddActivity: () => void;
  isDisabled: boolean;
}

const ObjectiveFooter: React.FC<ObjectiveFooterProps> = ({
  onAddActivity,
  isDisabled
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full flex items-center justify-center gap-1"
      onClick={onAddActivity}
      disabled={isDisabled}
    >
      <PlusCircle className="h-4 w-4" />
      <span>Adicionar atividade</span>
    </Button>
  );
};

export default ObjectiveFooter;

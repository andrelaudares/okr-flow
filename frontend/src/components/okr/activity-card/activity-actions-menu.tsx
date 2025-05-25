
import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

interface ActivityActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
  isUpdating: boolean;
}

const ActivityActionsMenu: React.FC<ActivityActionsMenuProps> = ({
  onEdit,
  onDelete,
  disabled,
  isUpdating
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={disabled || isUpdating}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => {
            if (!isUpdating && !disabled) onEdit();
          }}
        >
          Editar atividade
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600"
          onClick={() => {
            if (!isUpdating && !disabled) onDelete();
          }}
        >
          Excluir atividade
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActivityActionsMenu;

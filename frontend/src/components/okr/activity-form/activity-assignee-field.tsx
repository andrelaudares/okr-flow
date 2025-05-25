
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';

interface ActivityAssigneeFieldProps {
  assignee: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ActivityAssigneeField: React.FC<ActivityAssigneeFieldProps> = ({
  assignee,
  onChange,
  disabled = false,
}) => {
  const { users } = useUsers();

  return (
    <div className="grid gap-2">
      <label htmlFor="assignee" className="text-sm font-medium">
        Responsável
      </label>
      <Select 
        value={assignee} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Equipe</SelectLabel>
            {users.map(user => (
              <SelectItem key={user.id} value={user.name}>
                {user.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActivityAssigneeField;

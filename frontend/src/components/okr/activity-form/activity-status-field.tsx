
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ActivityStatus } from '@/types/okr';
import { statusOptions, statusLabel } from '../activity-constants';

interface ActivityStatusFieldProps {
  status: ActivityStatus;
  onChange: (value: ActivityStatus) => void;
  disabled?: boolean;
}

const ActivityStatusField: React.FC<ActivityStatusFieldProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="grid gap-2">
      <label htmlFor="status" className="text-sm font-medium">
        Status
      </label>
      <Select 
        value={status} 
        onValueChange={(value) => onChange(value as ActivityStatus)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {statusOptions.map(option => (
              <SelectItem key={option} value={option}>
                {statusLabel[option]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActivityStatusField;

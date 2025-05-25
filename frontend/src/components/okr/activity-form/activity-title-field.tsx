
import React from 'react';
import { Input } from '@/components/ui/input';

interface ActivityTitleFieldProps {
  title: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ActivityTitleField: React.FC<ActivityTitleFieldProps> = ({
  title,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="grid gap-2">
      <label htmlFor="title" className="text-sm font-medium">
        Título da atividade
      </label>
      <Input
        id="title"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
      />
    </div>
  );
};

export default ActivityTitleField;

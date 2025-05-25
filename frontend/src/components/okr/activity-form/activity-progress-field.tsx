
import React from 'react';
import { Input } from '@/components/ui/input';

interface ActivityProgressFieldProps {
  progress: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const ActivityProgressField: React.FC<ActivityProgressFieldProps> = ({
  progress,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="grid gap-2">
      <label htmlFor="progress" className="text-sm font-medium">
        Progresso (%)
      </label>
      <Input
        id="progress"
        type="number"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  );
};

export default ActivityProgressField;

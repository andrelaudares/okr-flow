import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityDueDateFieldProps {
  dueDate: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ActivityDueDateField: React.FC<ActivityDueDateFieldProps> = ({
  dueDate,
  onChange,
  disabled = false,
}) => {
  const formatDateValue = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Otherwise, try to parse and format
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="grid gap-2">
      <label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Data de conclusão prevista
      </label>
      <Input
        id="dueDate"
        type="date"
        value={formatDateValue(dueDate)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};

export default ActivityDueDateField;

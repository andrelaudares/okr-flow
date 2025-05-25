
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface ActivityObservationFieldProps {
  observation: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ActivityObservationField: React.FC<ActivityObservationFieldProps> = ({
  observation,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="grid gap-2">
      <label htmlFor="observation" className="text-sm font-medium">
        Observações
      </label>
      <Textarea
        id="observation"
        placeholder="Adicione detalhes ou observações sobre a atividade..."
        value={observation}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
      />
    </div>
  );
};

export default ActivityObservationField;

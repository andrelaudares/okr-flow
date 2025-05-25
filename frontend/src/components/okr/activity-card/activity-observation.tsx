
import React from 'react';
import { FileText } from 'lucide-react';

interface ActivityObservationProps {
  observation?: string;
}

const ActivityObservation: React.FC<ActivityObservationProps> = ({ observation }) => {
  if (!observation) return null;
  
  return (
    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
      <div className="flex items-center gap-1 mb-1 text-gray-500">
        <FileText className="h-3 w-3" />
        <span>Observação:</span>
      </div>
      <p>{observation}</p>
    </div>
  );
};

export default ActivityObservation;

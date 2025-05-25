
import React from 'react';
import { DateRangeFilter } from '@/hooks/history/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useOkrHistory } from '@/hooks/history/use-okr-history';

interface HistoryFiltersProps {
  dateRangeFilter: DateRangeFilter;
  onFilterChange: (value: DateRangeFilter) => void;
  isUpdating?: boolean;
}

const HistoryFilters: React.FC<HistoryFiltersProps> = ({ 
  dateRangeFilter, 
  onFilterChange,
  isUpdating = false
}) => {
  const { refreshHistory } = useOkrHistory();
  
  const dateRangeOptions = [
    { value: 'all', label: 'Todo o histórico' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'last90days', label: 'Últimos 90 dias' },
    { value: 'thisWeek', label: 'Esta semana' },
    { value: 'thisMonth', label: 'Este mês' },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
      <div className="w-full md:w-auto">
        <Select 
          value={dateRangeFilter} 
          onValueChange={(value) => onFilterChange(value as DateRangeFilter)}
        >
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Selecione um período" />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={refreshHistory} 
        disabled={isUpdating}
        className="w-full md:w-auto"
      >
        <RefreshCcw className="h-4 w-4 mr-2" />
        {isUpdating ? 'Atualizando...' : 'Atualizar dados'}
      </Button>
    </div>
  );
};

export default HistoryFilters;

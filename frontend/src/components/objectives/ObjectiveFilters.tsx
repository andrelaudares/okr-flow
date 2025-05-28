import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, Users, Calendar } from 'lucide-react';
import { useCycles } from '@/hooks/use-cycles';
import { useUsers } from '@/hooks/use-users';
import type { ObjectiveFilters } from '@/types/objectives';

interface ObjectiveFiltersProps {
  filters: ObjectiveFilters;
  onFilterChange: (key: keyof ObjectiveFilters, value: any) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'PLANNED', label: 'Planejado', color: 'bg-gray-100 text-gray-800' },
  { value: 'ON_TRACK', label: 'No Prazo', color: 'bg-green-100 text-green-800' },
  { value: 'AT_RISK', label: 'Em Risco', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'BEHIND', label: 'Atrasado', color: 'bg-red-100 text-red-800' },
  { value: 'COMPLETED', label: 'Concluído', color: 'bg-blue-100 text-blue-800' },
];

const ObjectiveFilters: React.FC<ObjectiveFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const { cycles } = useCycles();
  const { users } = useUsers();

  const handleStatusToggle = (status: string) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    onFilterChange('status', newStatus);
  };

  const handleOwnerChange = (value: string) => {
    onFilterChange('owner_id', value === 'all' ? undefined : value);
  };

  const handleCycleChange = (value: string) => {
    onFilterChange('cycle_id', value === 'all' ? undefined : value);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.owner_id) count++;
    if (filters.cycle_id) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar objetivos..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros avançados */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Filtro de Status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3 w-3 mr-1" />
              Status
              {filters.status && filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Status dos Objetivos</h4>
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={filters.status?.includes(option.value) || false}
                    onCheckedChange={() => handleStatusToggle(option.value)}
                  />
                  <label htmlFor={option.value} className="text-sm flex items-center gap-2">
                    <Badge className={option.color}>{option.label}</Badge>
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Responsável */}
        <Select
          value={filters.owner_id || 'all'}
          onValueChange={(value) => handleOwnerChange(value)}
        >
          <SelectTrigger className="w-auto h-8">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <SelectValue placeholder="Responsável" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os responsáveis</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Ciclo */}
        <Select
          value={filters.cycle_id || 'all'}
          onValueChange={(value) => handleCycleChange(value)}
        >
          <SelectTrigger className="w-auto h-8">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <SelectValue placeholder="Ciclo" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os ciclos</SelectItem>
            {cycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id}>
                {cycle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botão limpar filtros */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Busca: "{filters.search}"
              <button
                onClick={() => onFilterChange('search', '')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status && filters.status.map((status) => {
            const statusOption = statusOptions.find(opt => opt.value === status);
            return (
              <Badge key={status} variant="secondary" className="text-xs">
                {statusOption?.label}
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          
          {filters.owner_id && (
            <Badge variant="secondary" className="text-xs">
              Responsável: {users.find(u => u.id === filters.owner_id)?.name}
              <button
                onClick={() => handleOwnerChange('all')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.cycle_id && (
            <Badge variant="secondary" className="text-xs">
              Ciclo: {cycles.find(c => c.id === filters.cycle_id)?.name}
              <button
                onClick={() => handleCycleChange('all')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectiveFilters; 
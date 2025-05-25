
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, UserSearch } from "lucide-react";
import { useUsers } from "@/hooks/use-users";

interface ObjectiveFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onStatusFilterChange: (status: string) => void;
  onUserFilterChange?: (user: string) => void;
  statusFilter: string;
  userFilter?: string;
  searchTerm: string;
}

const ObjectiveFilters: React.FC<ObjectiveFiltersProps> = ({
  onSearchChange,
  onStatusFilterChange,
  onUserFilterChange,
  statusFilter,
  userFilter = "all",
  searchTerm,
}) => {
  const { users } = useUsers();
  
  const STATUS_OPTIONS = [
    { value: "all", label: "Todos os Status" },
    { value: "completed", label: "Concluídos" },
    { value: "in-progress", label: "Em Progresso" },
    { value: "not-started", label: "Não Iniciados" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-nobug-500" />
        <span className="text-base font-medium text-gray-800">
          Status dos OKRs:
        </span>
      </div>
      <div className="flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Buscar objetivos..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border rounded px-2 py-1 w-52"
        />
        <Select
          value={statusFilter}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="w-52 min-w-[148px]">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          <UserSearch className="h-5 w-5 text-nobug-500" />
          <Select
            value={userFilter}
            onValueChange={onUserFilterChange}
          >
            <SelectTrigger className="w-52 min-w-[148px]">
              <SelectValue placeholder="Todos os Responsáveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Responsáveis</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.name}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveFilters;


import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown } from 'lucide-react';
import ObjectiveFilters from '../ObjectiveFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { generateObjectivesReport } from '@/utils/reportUtils';
import { toast } from 'sonner';
import { Objective } from '@/types/okr';

interface DashboardHeaderProps {
  onOpenAddDialog: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  userFilter?: string;
  onUserFilterChange?: (user: string) => void;
  objectives?: Objective[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenAddDialog,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  userFilter,
  onUserFilterChange,
  objectives = []
}) => {
  const handleExport = (format: string) => {
    try {
      if (objectives.length === 0) {
        toast.error('Não há dados para exportar.');
        return;
      }
      
      if (format === 'pdf') {
        generateObjectivesReport(objectives);
        toast.success('Relatório PDF gerado com sucesso!');
      } else if (format === 'html') {
        // Future implementation for HTML export
        toast.info('Exportação HTML será implementada em breve.');
      } else if (format === 'xls') {
        // Future implementation for XLS export
        toast.info('Exportação XLS será implementada em breve.');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório.');
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center my-6 gap-4 bg-white/50 p-4 rounded-lg shadow-sm border border-gray-100 backdrop-blur-sm transition-all">
      <ObjectiveFilters 
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        onUserFilterChange={onUserFilterChange}
        statusFilter={statusFilter}
        userFilter={userFilter}
        searchTerm={searchTerm}
      />
      
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <FileDown className="h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              Exportar como PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('html')}>
              Exportar como HTML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('xls')}>
              Exportar como XLS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      
        <Button 
          onClick={onOpenAddDialog} 
          className="flex items-center gap-2 w-full sm:w-auto transition-all hover:scale-102 bg-gradient-to-r from-primary to-blue-600"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Objetivo
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;

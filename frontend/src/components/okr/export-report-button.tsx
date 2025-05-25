
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { generateObjectivesReport } from '@/utils/reportUtils';
import { Objective } from '@/types/okr';
import { toast } from 'sonner';

interface ExportReportButtonProps {
  objectives: Objective[];
  className?: string;
}

const ExportReportButton: React.FC<ExportReportButtonProps> = ({ objectives, className = '' }) => {
  const handleExport = () => {
    try {
      if (objectives.length === 0) {
        toast.error('Não há dados para exportar.');
        return;
      }
      
      generateObjectivesReport(objectives);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório.');
    }
  };
  
  return (
    <Button 
      className={`bg-nobug-600 hover:bg-nobug-700 ${className}`}
      onClick={handleExport}
      title="Exportar relatório em PDF"
    >
      <FileDown className="h-4 w-4 mr-2" />
      Exportar PDF
    </Button>
  );
};

export default ExportReportButton;

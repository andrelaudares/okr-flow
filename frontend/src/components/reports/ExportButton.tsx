import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';
import { useReports } from '@/hooks/reports/useReports';
import { useObjectiveFilters } from '@/hooks/use-objectives';
import { toast } from 'sonner';
import type { ExportConfig } from '@/types/reports';

interface ExportButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  exportConfig?: Partial<ExportConfig>;
  customLabel?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  className,
  variant = 'outline',
  size = 'sm',
  exportConfig,
  customLabel
}) => {
  const { exportReport, getReportStatus, downloadReport } = useReports();
  const { filters } = useObjectiveFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const pollReportStatus = async (reportId: string, format: string) => {
    const maxAttempts = 30; // 30 tentativas = 30 segundos máximo
    let attempts = 0;
    
    console.log(`Iniciando polling para relatório ${reportId} (formato: ${format})`);
    
    const poll = async (): Promise<void> => {
      attempts++;
      console.log(`Tentativa ${attempts}/${maxAttempts} - Verificando status do relatório ${reportId}`);
      
      try {
        const report = await getReportStatus(reportId);
        console.log(`Status do relatório:`, report);
        
        if (!report) {
          throw new Error('Relatório não encontrado');
        }
        
        if (report.status === 'COMPLETED') {
          console.log(`Relatório ${reportId} concluído! Iniciando download...`);
          // Download automático
          await downloadReport(reportId);
          toast.success(`Relatório ${format} baixado com sucesso!`);
          return;
        }
        
        if (report.status === 'FAILED') {
          throw new Error('Falha na geração do relatório');
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('Tempo limite excedido para geração do relatório');
        }
        
        // Continuar polling se ainda está processando
        if (report.status === 'PENDING' || report.status === 'PROCESSING') {
          console.log(`Relatório ainda processando (${report.status}). Aguardando 1 segundo...`);
          setTimeout(poll, 1000); // Verificar novamente em 1 segundo
        }
        
      } catch (error) {
        console.error('Erro no polling do relatório:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao verificar status do relatório');
      }
    };
    
    // Iniciar polling
    poll();
  };

  const handleExport = async (format: 'CSV' | 'PDF') => {
    console.log(`Iniciando exportação no formato ${format}`);
    setIsExporting(true);
    setExportingFormat(format);
    
    try {
      // Usar configuração personalizada se fornecida, senão usar configuração padrão do dashboard
      const config: ExportConfig = exportConfig ? {
        name: exportConfig.name || `Relatório - ${new Date().toLocaleDateString('pt-BR')}`,
        report_type: exportConfig.report_type || 'DASHBOARD',
        format,
        filters: {
          ...exportConfig.filters,
          include_key_results: exportConfig.filters?.include_key_results ?? true,
          include_checkins: exportConfig.filters?.include_checkins ?? true
        },
        include_charts: format === 'PDF'
      } : {
        name: `Relatório Dashboard - ${new Date().toLocaleDateString('pt-BR')}`,
        report_type: 'DASHBOARD',
        format,
        filters: {
          search: filters.search,
          status: filters.status,
          owner_id: filters.owner_id,
          cycle_id: filters.cycle_id,
          include_key_results: true,
          include_checkins: true
        },
        include_charts: format === 'PDF'
      };

      console.log('Configuração do relatório:', config);
      
      const reportId = await exportReport(config);
      console.log('ID do relatório retornado:', reportId);
      
      if (reportId) {
        toast.success(`Gerando relatório ${format}... O download iniciará automaticamente.`);
        
        // Iniciar polling para verificar status e fazer download automático
        await pollReportStatus(reportId, format);
      } else {
        throw new Error('Não foi possível obter o ID do relatório');
      }
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? `Gerando ${exportingFormat}...` : (customLabel || 'Exportar')}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleExport('CSV')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como CSV
          {isExporting && exportingFormat === 'CSV' && (
            <Loader2 className="h-3 w-3 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleExport('PDF')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
          {isExporting && exportingFormat === 'PDF' && (
            <Loader2 className="h-3 w-3 ml-auto animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton; 
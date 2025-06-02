import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
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
  const [isExporting, setIsExporting] = useState(false);

  const pollReportStatus = async (reportId: string) => {
    const maxAttempts = 30; // 30 tentativas = 30 segundos máximo
    let attempts = 0;
    
    console.log(`Iniciando polling para relatório ${reportId}`);
    
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
          toast.success(`Relatório PDF baixado com sucesso!`);
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

  const handleExportPDF = async () => {
    console.log(`Iniciando exportação PDF`);
    setIsExporting(true);
    
    try {
      // Usar configuração personalizada se fornecida, senão usar configuração padrão do dashboard
      const config: ExportConfig = exportConfig ? {
        name: exportConfig.name || `Relatório - ${new Date().toLocaleDateString('pt-BR')}`,
        report_type: exportConfig.report_type || 'DASHBOARD',
        format: 'PDF',
        filters: {
          ...exportConfig.filters,
          include_key_results: exportConfig.filters?.include_key_results ?? true,
          include_checkins: exportConfig.filters?.include_checkins ?? true
        },
        include_charts: true
      } : {
        name: `Relatório Dashboard - ${new Date().toLocaleDateString('pt-BR')}`,
        report_type: 'DASHBOARD',
        format: 'PDF',
        filters: {
          search: filters.search,
          status: filters.status,
          owner_id: filters.owner_id,
          cycle_id: filters.cycle_id,
          include_key_results: true,
          include_checkins: true
        },
        include_charts: true
      };

      console.log('Configuração do relatório:', config);
      
      const reportId = await exportReport(config);
      console.log('ID do relatório retornado:', reportId);
      
      if (reportId) {
        toast.success(`Gerando relatório PDF... O download iniciará automaticamente.`);
        
        // Iniciar polling para verificar status e fazer download automático
        await pollReportStatus(reportId);
      } else {
        throw new Error('Não foi possível obter o ID do relatório');
      }
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      disabled={isExporting}
      onClick={handleExportPDF}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          {customLabel || 'Exportar PDF'}
        </>
      )}
    </Button>
  );
};

export default ExportButton; 
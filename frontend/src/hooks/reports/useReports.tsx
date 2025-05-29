import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { 
  ExportFormat, 
  ExportConfig, 
  Report, 
  ReportsResponse, 
  ExportResponse 
} from '@/types/reports';

interface UseReportsReturn {
  // Data
  formats: ExportFormat[];
  reports: Report[];
  total: number;
  hasMore: boolean;
  
  // Loading states
  isLoadingFormats: boolean;
  isLoadingReports: boolean;
  isExporting: boolean;
  isDownloading: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  getFormats: () => Promise<void>;
  exportReport: (config: ExportConfig) => Promise<string | null>;
  getReports: () => Promise<void>;
  getReportStatus: (reportId: string) => Promise<Report | null>;
  downloadReport: (reportId: string) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useReports = (): UseReportsReturn => {
  const { isAuthenticated } = useAuth();
  
  // Data states
  const [formats, setFormats] = useState<ExportFormat[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Loading states
  const [isLoadingFormats, setIsLoadingFormats] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Get available formats
  const getFormats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingFormats(true);
    setError(null);
    
    try {
      const response = await api.get('/api/reports/formats');
      setFormats(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar formatos:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar formatos');
    } finally {
      setIsLoadingFormats(false);
    }
  }, [isAuthenticated]);

  // Export report
  const exportReport = useCallback(async (config: ExportConfig): Promise<string | null> => {
    if (!isAuthenticated) return null;
    
    setIsExporting(true);
    setError(null);
    
    try {
      console.log('Enviando configuração de relatório:', config);
      const response = await api.post('/api/reports/export', config);
      const data: ExportResponse = response.data;
      
      console.log('Resposta da API:', data);
      
      // Não mostrar toast aqui, será mostrado no componente
      
      return data.id;
    } catch (err: any) {
      console.error('Erro ao exportar relatório:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao exportar relatório';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [isAuthenticated]);

  // Get reports list
  const getReports = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingReports(true);
    setError(null);
    
    try {
      const response = await api.get('/api/reports/');
      const data: ReportsResponse = response.data;
      
      setReports(data.reports);
      setTotal(data.total);
      setHasMore(data.has_more);
    } catch (err: any) {
      console.error('Erro ao carregar relatórios:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar relatórios');
    } finally {
      setIsLoadingReports(false);
    }
  }, [isAuthenticated]);

  // Get report status
  const getReportStatus = useCallback(async (reportId: string): Promise<Report | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await api.get(`/api/reports/${reportId}/status`);
      return response.data;
    } catch (err: any) {
      console.error('Erro ao verificar status do relatório:', err);
      return null;
    }
  }, [isAuthenticated]);

  // Download report
  const downloadReport = useCallback(async (reportId: string) => {
    if (!isAuthenticated) return;
    
    setIsDownloading(true);
    
    try {
      const response = await api.get(`/api/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'relatorio.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download iniciado!');
    } catch (err: any) {
      console.error('Erro ao fazer download:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao fazer download';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  }, [isAuthenticated]);

  // Delete report
  const deleteReport = useCallback(async (reportId: string) => {
    if (!isAuthenticated) return;
    
    setIsDeleting(true);
    
    try {
      await api.delete(`/api/reports/${reportId}`);
      toast.success('Relatório excluído com sucesso!');
      
      // Refresh reports list
      await getReports();
    } catch (err: any) {
      console.error('Erro ao excluir relatório:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao excluir relatório';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [isAuthenticated, getReports]);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([
      getFormats(),
      getReports()
    ]);
  }, [getFormats, getReports]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  return {
    // Data
    formats,
    reports,
    total,
    hasMore,
    
    // Loading states
    isLoadingFormats,
    isLoadingReports,
    isExporting,
    isDownloading,
    isDeleting,
    
    // Error state
    error,
    
    // Actions
    getFormats,
    exportReport,
    getReports,
    getReportStatus,
    downloadReport,
    deleteReport,
    refetch
  };
}; 
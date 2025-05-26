import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

// Base URL do backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Criar instância do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('okr_access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log da resposta (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      console.log(`[API] Response ${response.status}:`, response.data);
    }
    
    return response;
  },
  (error: AxiosError) => {
    console.error('[API] Response error:', error);
    
    // Tratamento de diferentes tipos de erro
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token inválido ou expirado
          localStorage.removeItem('okr_access_token');
          localStorage.removeItem('okr_refresh_token');
          localStorage.removeItem('okr_user');
          
          // Só redireciona se não estiver já na página de login
          if (!window.location.pathname.includes('/login')) {
            toast.error('Sessão expirada. Faça login novamente.');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error('Acesso negado. Você não tem permissão para esta ação.');
          break;
          
        case 404:
          toast.error('Recurso não encontrado.');
          break;
          
        case 422:
          // Erros de validação
          if (data && typeof data === 'object' && 'detail' in data) {
            const detail = data.detail;
            if (Array.isArray(detail)) {
              // Erro de validação do Pydantic
              const errorMessages = detail.map((err: any) => 
                `${err.loc?.join(' → ') || 'Campo'}: ${err.msg}`
              ).join('\n');
              toast.error(`Erro de validação:\n${errorMessages}`);
            } else {
              toast.error(detail as string || 'Erro de validação.');
            }
          } else {
            toast.error('Dados inválidos.');
          }
          break;
          
        case 500:
          toast.error('Erro interno do servidor. Tente novamente mais tarde.');
          break;
          
        default:
          // Extrair mensagem de erro personalizada
          const errorMessage = 
            (data as any)?.detail || 
            (data as any)?.message || 
            `Erro ${status}: ${error.message}`;
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Erro de rede
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else {
      // Outros erros
      toast.error('Erro inesperado. Tente novamente.');
    }
    
    return Promise.reject(error);
  }
);

// Função para refresh do token
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('okr_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token: refreshToken,
    });
    
    const { access_token, refresh_token: newRefreshToken } = response.data;
    
    // Salvar novos tokens
    localStorage.setItem('okr_access_token', access_token);
    if (newRefreshToken) {
      localStorage.setItem('okr_refresh_token', newRefreshToken);
    }
    
    return access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Limpar dados de autenticação
    localStorage.removeItem('okr_access_token');
    localStorage.removeItem('okr_refresh_token');
    localStorage.removeItem('okr_user');
    
    // Redirecionar para login
    window.location.href = '/login';
    
    return null;
  }
};

// Interceptor para auto-refresh do token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const newToken = await refreshToken();
      
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// Função helper para fazer requisições com tipagem
export const makeRequest = async <T = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api[method](url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Funções de conveniência
export const get = <T = any>(url: string, config?: any): Promise<T> => 
  makeRequest<T>('get', url, undefined, config);

export const post = <T = any>(url: string, data?: any, config?: any): Promise<T> => 
  makeRequest<T>('post', url, data, config);

export const put = <T = any>(url: string, data?: any, config?: any): Promise<T> => 
  makeRequest<T>('put', url, data, config);

export const del = <T = any>(url: string, config?: any): Promise<T> => 
  makeRequest<T>('delete', url, undefined, config);

// Função para fazer download de arquivos
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    // Extrair nome do arquivo do header ou usar o fornecido
    const contentDisposition = response.headers['content-disposition'];
    const extractedFilename = contentDisposition?.match(/filename="(.+)"/)?.[1] || filename || 'download';
    
    // Criar URL para download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Criar link temporário e clicar
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = extractedFilename;
    document.body.appendChild(link);
    link.click();
    
    // Limpar recursos
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success(`Arquivo ${extractedFilename} baixado com sucesso!`);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Erro ao baixar arquivo.');
    throw error;
  }
};

export default api; 
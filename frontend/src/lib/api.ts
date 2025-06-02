import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Definição de tipos para as respostas de erro da API
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Criar instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplos toasts de expiração
let isTokenExpiredToastShown = false;

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nobugOkrToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros - MELHORADO
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    // Tratamento de erro 401 (token expirado) - MELHORADO
    if (error.response?.status === 401 && originalRequest) {
      const errorDetail = error.response?.data?.detail || '';
      
      // Verificar se é especificamente token expirado
      const isTokenExpired = errorDetail.includes('expirado') || 
                           errorDetail.includes('expired') || 
                           errorDetail.includes('invalid JWT') ||
                           errorDetail.includes('token has invalid claims');
      
      if (isTokenExpired) {
        console.log('🔑 Token expirado detectado');
        
        // Mostrar toast apenas uma vez
        if (!isTokenExpiredToastShown) {
          isTokenExpiredToastShown = true;
          
          toast.error('Sessão Expirada', {
            description: 'Sua sessão expirou. Você será redirecionado para fazer login novamente.',
            duration: 5000,
            action: {
              label: 'Login',
              onClick: () => {
                window.location.href = '/login';
              }
            }
          });
          
          // Reset da flag após 10 segundos
          setTimeout(() => {
            isTokenExpiredToastShown = false;
          }, 10000);
        }
        
        // Tentar refresh primeiro
        const refreshToken = localStorage.getItem('nobugOkrRefreshToken');
        
        if (refreshToken && !originalRequest.url?.includes('/refresh')) {
          try {
            console.log('🔄 Tentando refresh do token...');
            const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
              refresh_token: refreshToken
            });
            
            const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
            
            // Salvar novos tokens
            setTokens(access_token, newRefreshToken);
            
            // Retry da requisição original
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            
            console.log('✅ Token refreshed com sucesso');
            toast.success('Sessão renovada automaticamente');
            
            return api(originalRequest);
          } catch (refreshError) {
            console.log('❌ Refresh falhou:', refreshError);
            // Se refresh falhou, fazer logout completo
            handleTokenExpiration();
          }
        } else {
          // Não há refresh token, fazer logout
          handleTokenExpiration();
        }
      } else {
        // Não há refresh token ou não é token expirado, limpar dados
        clearTokens();
        console.log('🚪 Dados de autenticação limpos');
      }
    }

    // Tratamento de outros erros - NÃO mostrar toast para 401 (já tratado acima)
    if (error.response?.status !== 401) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro inesperado';
      
      // Mostrar toast apenas para erros relevantes
      if (error.response?.status && error.response.status >= 500) {
        toast.error('Erro do Servidor', {
          description: 'Tente novamente em alguns instantes.',
        });
      } else if (error.response?.status === 403) {
        toast.error('Acesso Negado', {
          description: 'Você não tem permissão para esta ação.',
        });
      }
    }

    return Promise.reject(error);
  }
);

// Função para tratar expiração completa do token
const handleTokenExpiration = () => {
  console.log('🔐 Fazendo logout completo devido à expiração');
  
  // Limpar todos os dados
  clearTokens();
  
  // Redirecionar após um delay para mostrar o toast
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);
};

// Helper para set/get tokens
export const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('nobugOkrToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('nobugOkrRefreshToken', refreshToken);
  }
};

export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('nobugOkrToken'),
    refreshToken: localStorage.getItem('nobugOkrRefreshToken'),
  };
};

export const clearTokens = () => {
  localStorage.removeItem('nobugOkrToken');
  localStorage.removeItem('nobugOkrRefreshToken');
  localStorage.removeItem('nobugOkrUser');
};

export default api; 
import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Definição de tipos para as respostas de erro da API
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

// Configuração base da API
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variável para evitar múltiplos toasts de token expirado
let isTokenExpiredToastShown = false;

// Helper functions para gerenciar tokens
export const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('nobugOkrToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('nobugOkrRefreshToken', refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('nobugOkrToken');
  localStorage.removeItem('nobugOkrRefreshToken');
  localStorage.removeItem('nobugOkrUser');
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nobugOkrToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas e erros - SIMPLIFICADO
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    // Tratamento de erro 401 (token expirado)
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
          });
          
          // Reset da flag após 10 segundos
          setTimeout(() => {
            isTokenExpiredToastShown = false;
          }, 10000);
        }
        
        // Tentar refresh primeiro
        const refreshToken = localStorage.getItem('nobugOkrRefreshToken');
        if (refreshToken && originalRequest.url !== '/api/auth/refresh') {
          try {
            console.log('🔄 Tentando renovar token...');
            const refreshResponse = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {
              refresh_token: refreshToken
            });

            const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
            
            // Atualizar tokens
            setTokens(access_token, newRefreshToken);

            // Recriar a requisição original com novo token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            console.log('✅ Token renovado com sucesso');
            return api(originalRequest);
            
          } catch (refreshError) {
            console.log('❌ Falha ao renovar token:', refreshError);
            // Se refresh falhou, redirecionar para login
            clearTokens();
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } else {
          // Sem refresh token, ir direto para login
          setTimeout(() => {
            clearTokens();
            window.location.href = '/login';
          }, 3000);
        }
      }
    }

    // Tratamento básico de outros erros
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

// Export default do api e exports nomeados das funções
export default api;
export { api }; 
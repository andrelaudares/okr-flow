import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Definição de tipos para as respostas de erro da API
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

// Configuração base da API - CORRIGIDO nome da variável
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
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

// Interceptor para tratar respostas e erros - MELHORADO com mensagens mais didáticas
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
        
        // Mostrar toast mais didático apenas uma vez
        if (!isTokenExpiredToastShown) {
          isTokenExpiredToastShown = true;
          
          toast.error('🔒 Sua Sessão Expirou', {
            description: 'Por questões de segurança, você foi desconectado automaticamente. Clique abaixo para fazer login novamente e continuar usando o sistema.',
            duration: 12000, // 12 segundos para dar tempo de ler
            position: 'top-center',
            action: {
              label: '👆 Fazer Login Agora',
              onClick: () => {
                window.location.href = '/login';
              }
            }
          });
          
          // Reset da flag após 15 segundos
          setTimeout(() => {
            isTokenExpiredToastShown = false;
          }, 15000);
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
            
            // Toast de sucesso na renovação
            toast.success('🔄 Sessão Renovada!', {
              description: 'Sua sessão foi renovada automaticamente. Você pode continuar usando o sistema normalmente.',
              duration: 8000
            });
            
            return api(originalRequest);
            
          } catch (refreshError) {
            console.log('❌ Falha ao renovar token:', refreshError);
            // Se refresh falhou, redirecionar para login
            clearTokens();
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          }
        } else {
          // Sem refresh token, ir direto para login
          setTimeout(() => {
            clearTokens();
            window.location.href = '/login';
          }, 4000);
        }
      }
    }

    // Tratamento básico de outros erros com mensagens mais didáticas
    if (error.response?.status !== 401) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro inesperado';
      
      // Mostrar toasts mais didáticos para erros relevantes
      if (error.response?.status && error.response.status >= 500) {
        toast.error('⚠️ Problema no Servidor', {
          description: 'Nosso servidor está com dificuldades técnicas. Por favor, aguarde alguns instantes e tente novamente. Se o problema persistir, entre em contato conosco.',
          duration: 10000
        });
      } else if (error.response?.status === 403) {
        toast.error('🚫 Acesso Não Permitido', {
          description: 'Você não tem permissão para realizar esta ação. Verifique com seu administrador se você deveria ter acesso a esta funcionalidade.',
          duration: 8000
        });
      } else if (error.response?.status === 400) {
        toast.error('📝 Dados Incorretos', {
          description: `Verifique se todos os campos foram preenchidos corretamente: ${errorMessage}`,
          duration: 8000
        });
      } else if (error.response?.status === 404) {
        toast.error('🔍 Não Encontrado', {
          description: 'A informação que você está procurando não foi encontrada. Ela pode ter sido removida ou nunca ter existido.',
          duration: 8000
        });
      }
    }

    return Promise.reject(error);
  }
);

// Export default do api e exports nomeados das funções
export default api;
export { api }; 
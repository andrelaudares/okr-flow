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

// Variáveis para controle de tokens expirados
let isTokenExpiredToastShown = false;
let isHandlingTokenExpiration = false;

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

// Função para forçar logout quando token expira
const forceLogoutDueToExpiredToken = () => {
  if (isHandlingTokenExpiration) return; // Evitar múltiplas execuções
  
  isHandlingTokenExpiration = true;
  
  console.log('🔑 Forçando logout devido a token expirado');
  
  // Limpar todos os dados
  clearTokens();
  
  // Mostrar toast explicativo se ainda não foi mostrado
  if (!isTokenExpiredToastShown) {
    isTokenExpiredToastShown = true;
    
    toast.error('🔒 Sessão Expirou - Login Necessário', {
      description: 'Sua sessão de segurança expirou. Você será redirecionado para a página de login para continuar usando o sistema.',
      duration: 8000, // 8 segundos
      position: 'top-center',
      action: {
        label: '🔓 Ir para Login',
        onClick: () => {
          window.location.href = '/login';
        }
      }
    });
  }
  
  // Redirecionar após 3 segundos
  setTimeout(() => {
    window.location.href = '/login';
  }, 3000);
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nobugOkrToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas e erros - MELHORADO com detecção mais robusta
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    // 🚨 DETECÇÃO ROBUSTA DE TOKEN EXPIRADO
    if (error.response?.status === 401) {
      const errorDetail = error.response?.data?.detail || '';
      const errorMessage = error.response?.data?.message || '';
      
      // Verificar múltiplas formas de identificar token expirado
      const tokenExpiredIndicators = [
        'expirado', 'expired', 'invalid jwt', 'token has invalid claims',
        'token is expired', 'unable to parse', 'verify signature',
        'jwt expired', 'invalid token', 'authentication failed'
      ];
      
      const isTokenExpired = tokenExpiredIndicators.some(indicator => 
        errorDetail.toLowerCase().includes(indicator) || 
        errorMessage.toLowerCase().includes(indicator)
      );
      
      console.log('🔍 Análise de erro 401:', {
        isTokenExpired,
        errorDetail,
        errorMessage,
        url: originalRequest?.url
      });
      
      if (isTokenExpired) {
        console.log('🔑 Token expirado confirmado - iniciando processo de logout');
        
        // Tentar refresh primeiro APENAS se não estivermos já lidando com expiração
        const refreshToken = localStorage.getItem('nobugOkrRefreshToken');
        if (refreshToken && originalRequest && originalRequest.url !== '/api/auth/refresh' && !isHandlingTokenExpiration) {
          try {
            console.log('🔄 Tentativa única de renovar token...');
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

            console.log('✅ Token renovado com sucesso na interceptação');
            
            // Toast de sucesso na renovação
            toast.success('🔄 Sessão Renovada Automaticamente!', {
              description: 'Sua sessão foi renovada automaticamente. Você pode continuar usando o sistema normalmente.',
              duration: 5000
            });
            
            return api(originalRequest);
            
          } catch (refreshError) {
            console.log('❌ Falha ao renovar token na interceptação:', refreshError);
            // Se refresh falhou, forçar logout
            forceLogoutDueToExpiredToken();
            return Promise.reject(error);
          }
        } else {
          // Sem refresh token ou já tentando refresh, forçar logout
          console.log('🚪 Sem refresh token disponível ou já processando, forçando logout');
          forceLogoutDueToExpiredToken();
          return Promise.reject(error);
        }
      } else {
        // Erro 401 mas não relacionado a token expirado (ex: credenciais incorretas)
        console.log('🔐 Erro 401 não relacionado a token expirado');
        toast.error('🚫 Acesso Negado', {
          description: 'Credenciais incorretas ou você não tem permissão para esta ação.',
          duration: 6000
        });
      }
    }

    // Tratamento de outros erros com mensagens mais didáticas
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
import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Definição de tipos para as respostas de erro da API
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

// Função melhorada para toasts mais atrativos
const showTokenExpiredToast = () => {
  toast.error('🔑 Sessão Expirada', {
    description: 'Sua sessão expirou. Faça login novamente para continuar.',
    duration: 8000, // 8 segundos
    position: 'top-center',
    className: 'bg-red-50 border-red-200 text-red-800',
    style: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#991b1b',
      fontSize: '14px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '2px solid #fecaca'
    },
    action: {
      label: '🔓 Fazer Login',
      onClick: () => {
        window.location.href = '/login';
      }
    }
  });
};

const showSuccessToast = (title: string, description: string) => {
  toast.success(`✅ ${title}`, {
    description,
    duration: 1009, // 10 segundos
    position: 'top-center',
    className: 'bg-green-50 border-green-200 text-green-800',
    style: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      color: '#166534',
      fontSize: '14px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '2px solid #bbf7d0'
    }
  });
};

const showWarningToast = (title: string, description: string) => {
  toast.warning(`⚠️ ${title}`, {
    description,
    duration: 1009, // 7 segundos
    position: 'top-center',
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    style: {
      backgroundColor: '#fffbeb',
      borderColor: '#fde68a',
      color: '#92400e',
      fontSize: '14px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '2px solid #fde68a'
    }
  });
};

const showErrorToast = (title: string, description: string) => {
  toast.error(`❌ ${title}`, {
    description,
    duration: 1009, // 6 segundos
    position: 'top-center',
    className: 'bg-red-50 border-red-200 text-red-800',
    style: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#991b1b',
      fontSize: '14px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '2px solid #fecaca'
    }
  });
};

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

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nobugOkrToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas e erros - MELHORADO
api.interceptors.response.use(
  (response) => {
    // 🆕 Verificar headers de sucesso para mostrar toasts positivos
    const successMessage = response.headers['x-success-message'];
    if (successMessage) {
      showSuccessToast('Sucesso', decodeURIComponent(successMessage));
    }
    
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    // 🆕 Verificar headers informativos do backend
    const tokenExpiredHeader = error.response?.headers['x-token-expired'];
    const refreshRequiredHeader = error.response?.headers['x-refresh-required'];
    const messageHeader = error.response?.headers['x-message'];

    // Tratamento de erro 401 (token expirado) - MELHORADO
    if (error.response?.status === 401 && originalRequest) {
      const errorDetail = error.response?.data?.detail || '';
      
      // Verificar se é especificamente token expirado (via headers ou conteúdo)
      const isTokenExpired = tokenExpiredHeader === 'true' ||
                           errorDetail.includes('expirado') || 
                           errorDetail.includes('expired') || 
                           errorDetail.includes('invalid JWT') ||
                           errorDetail.includes('token has invalid claims');
      
      if (isTokenExpired) {
        console.log('🔑 Token expirado detectado');
        
        // Mostrar toast melhorado apenas uma vez
        if (!isTokenExpiredToastShown) {
          isTokenExpiredToastShown = true;
          
          // Usar mensagem do header se disponível
          const customMessage = messageHeader ? decodeURIComponent(messageHeader) : 
                               'Sua sessão expirou. Faça login novamente para continuar.';
          
          showTokenExpiredToast();
          
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
            localStorage.setItem('nobugOkrToken', access_token);
            if (newRefreshToken) {
              localStorage.setItem('nobugOkrRefreshToken', newRefreshToken);
            }

            // Recriar a requisição original com novo token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            console.log('✅ Token renovado com sucesso');
            return api(originalRequest);
            
          } catch (refreshError) {
            console.log('❌ Falha ao renovar token:', refreshError);
            // Se refresh falhou, redirecionar para login
            localStorage.removeItem('nobugOkrToken');
            localStorage.removeItem('nobugOkrRefreshToken');
            localStorage.removeItem('nobugOkrUser');
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } else {
          // Sem refresh token, ir direto para login
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
          }, 3000);
        }
      }
    }

    // Tratamento de outros erros com toasts melhorados
    if (error.response?.status !== 401) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro inesperado';
      
      // Mostrar toasts melhorados apenas para erros relevantes
      if (error.response?.status && error.response.status >= 500) {
        showErrorToast('Erro do Servidor', 'Tente novamente em alguns instantes.');
      } else if (error.response?.status === 403) {
        showErrorToast('Acesso Negado', 'Você não tem permissão para esta ação.');
      } else if (error.response?.status === 400) {
        showWarningToast('Dados Inválidos', errorMessage);
      } else if (error.response?.status === 404) {
        showWarningToast('Não Encontrado', 'O recurso solicitado não foi encontrado.');
      }
    }

    return Promise.reject(error);
  }
);

export { api, showSuccessToast, showWarningToast, showErrorToast }; 
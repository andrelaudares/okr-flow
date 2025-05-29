import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Base URL do backend - detecta automaticamente o ambiente
const BASE_URL = import.meta.env.PROD 
  ? 'https://8bb0-2804-14c-485-80f3-1561-7e78-e258-3c84.ngrok-free.app' // Atualizado pelo ngrok
  : 'http://localhost:8000';

// Interface para resposta de erro da API
interface ApiErrorResponse {
  detail: string;
  message?: string;
}

// Criar instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    // Tratamento de erro 401 (token expirado)
    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = localStorage.getItem('nobugOkrRefreshToken');
      
      if (refreshToken) {
        try {
          // Tentar refresh do token
          const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = refreshResponse.data;
          localStorage.setItem('nobugOkrToken', access_token);
          
          // Retry da requisição original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh falhou, limpar tokens mas NÃO redirecionar automaticamente
          clearTokens();
          console.log('Token expirado, dados de autenticação limpos');
          return Promise.reject(refreshError);
        }
      } else {
        // Não há refresh token, limpar dados mas NÃO redirecionar automaticamente
        clearTokens();
        console.log('Nenhum refresh token, dados de autenticação limpos');
      }
    }

    // Tratamento de outros erros - mostrar toast apenas para erros relevantes
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Erro inesperado';

    // Mostrar toast apenas para erros que não sejam 401 (para evitar spam)
    if (error.response?.status !== 401) {
      switch (error.response?.status) {
        case 403:
          toast.error('Você não tem permissão para realizar esta ação');
          break;
        case 404:
          toast.error('Recurso não encontrado');
          break;
        case 422:
          toast.error('Dados inválidos: ' + errorMessage);
          break;
        case 500:
          toast.error('Erro interno do servidor');
          break;
        default:
          // Só mostrar toast para erros inesperados
          if (error.response?.status && error.response.status >= 500) {
            toast.error(errorMessage);
          }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

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
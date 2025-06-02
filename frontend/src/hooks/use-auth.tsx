import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api, { setTokens, clearTokens } from '@/lib/api';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse
} from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  isRefreshingToken: boolean;
  sessionExpiresAt: number | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
  refreshSession: () => Promise<boolean>;
  hideSessionExpiredModal: () => void;
  checkSessionExpiry: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const navigate = useNavigate();

  const checkSessionExpiry = () => {
    if (!sessionExpiresAt) return;
    
    const now = Date.now() / 1000;
    const timeUntilExpiry = sessionExpiresAt - now;
    
    console.log(`🕐 Sessão expira em ${Math.round(timeUntilExpiry / 60)} minutos`);
    
    if (timeUntilExpiry < 1800 && timeUntilExpiry > 0) {
      toast.warning('Sessão Expirando', {
        description: `Sua sessão expira em ${Math.round(timeUntilExpiry / 60)} minutos.`,
        action: {
          label: 'Renovar',
          onClick: refreshSession
        }
      });
    }
  };

  useEffect(() => {
    if (!sessionExpiresAt) return;
    
    const interval = setInterval(() => {
      checkSessionExpiry();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  const refreshSession = async (): Promise<boolean> => {
    setIsRefreshingToken(true);
    
    try {
      const refreshToken = localStorage.getItem('nobugOkrRefreshToken');
      if (!refreshToken) {
        throw new Error('Nenhum refresh token disponível');
      }

      console.log('🔄 Tentando renovar sessão...');
      
      const response = await api.post('/api/auth/refresh', {
        refresh_token: refreshToken
      });

      const authData: AuthResponse = response.data;
      
      setTokens(authData.access_token, authData.refresh_token);
      
      setToken(authData.access_token);
      setUser(authData.user);
      setSessionExpiresAt(authData.user.expires_at);
      setIsSessionExpired(false);
      
      console.log('✅ Sessão renovada com sucesso');
      toast.success('Sessão renovada automaticamente');
      
      return true;
    } catch (error: any) {
      console.log('❌ Falha ao renovar sessão:', error);
      
      clearTokens();
      setUser(null);
      setToken(null);
      setSessionExpiresAt(null);
      setIsSessionExpired(true);
      
      return false;
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const hideSessionExpiredModal = () => {
    setIsSessionExpired(false);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/api/auth/login', credentials);
      const authData: AuthResponse = response.data;
      
      console.log(`🔑 Login realizado - Token expira em ${authData.expires_in / (24*3600)} dias`);
      
      setTokens(authData.access_token, authData.refresh_token);
      
      setToken(authData.access_token);
      setUser(authData.user);
      setSessionExpiresAt(authData.user.expires_at);
      setIsSessionExpired(false);
      
      localStorage.setItem('nobugOkrUser', JSON.stringify(authData.user));
      
      toast.success(`Bem-vindo, ${authData.user.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      console.log('🚀 Iniciando registro no hook useAuth:', data);
      
      const response = await api.post('/api/auth/register', data);
      
      console.log('✅ Resposta do backend:', response);
      console.log('✅ Data da resposta:', response.data);
      
      const registerData = response.data;
      
      // O endpoint de registro não retorna tokens, apenas confirma o registro
      toast.success(registerData.message || 'Conta criada com sucesso! Faça login para continuar.');
      
      // Redirecionar para login após o registro bem-sucedido
      navigate('/login');
    } catch (error: any) {
      console.error('❌ Erro no hook useAuth:', error);
      console.error('❌ Response error:', error.response);
      console.error('❌ Response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || 'Erro ao criar conta';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.post('/api/auth/logout').catch(() => {
    });
    
    clearTokens();
    setUser(null);
    setToken(null);
    setSessionExpiresAt(null);
    setIsSessionExpired(false);
    
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('nobugOkrToken');
        const storedUser = localStorage.getItem('nobugOkrUser');
        
        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            
            if (userData.expires_at && userData.expires_at < Date.now() / 1000) {
              console.log('🔑 Token armazenado expirado, tentando refresh...');
              const refreshed = await refreshSession();
              if (!refreshed) {
                throw new Error('Refresh falhou');
              }
            } else {
              setToken(storedToken);
              setUser(userData);
              setSessionExpiresAt(userData.expires_at);
            }
          } catch (parseError) {
            console.log('❌ Erro ao verificar token armazenado:', parseError);
            clearTokens();
          }
        }
      } catch (error) {
        console.log('❌ Erro na verificação de autenticação:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/api/auth/me');
      
      setUser(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isSessionExpired,
    isRefreshingToken,
    sessionExpiresAt,
    login,
    register,
    logout,
    getCurrentUser,
    refreshSession,
    hideSessionExpiredModal,
    checkSessionExpiry,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    canManageUsers: user?.is_owner || user?.role === 'ADMIN',
    canManageCompany: user?.is_owner,
    canCreateCycles: user?.is_owner || user?.role === 'ADMIN',
    canManageTeams: user?.is_owner || user?.role === 'ADMIN',
    canCreateObjectives: user?.is_owner || user?.role === 'ADMIN' || user?.role === 'MANAGER',
    canCreateKeyResults: user?.is_owner || user?.role === 'ADMIN' || user?.role === 'MANAGER',
    isOwner: user?.is_owner || false,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER',
    isCollaborator: user?.role === 'COLLABORATOR',
  };
};

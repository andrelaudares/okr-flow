import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, post, get } from '@/lib/api';
import type { 
  AuthContextType, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  User 
} from '@/types/auth';

// Chaves do localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'okr_access_token',
  REFRESH_TOKEN: 'okr_refresh_token',
  USER: 'okr_user',
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  const navigate = useNavigate();

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    loadAuthFromStorage();
  }, []);

  const loadAuthFromStorage = () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        setState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        console.log('[Auth] Loaded user from storage:', user.email);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[Auth] Error loading from storage:', error);
      clearAuthStorage();
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuthToStorage = (authData: AuthResponse) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
      
      if (authData.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refresh_token);
      }
    } catch (error) {
      console.error('[Auth] Error saving to storage:', error);
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await post<AuthResponse>('/api/auth/login', credentials);
      
      // Salvar dados no localStorage
      saveAuthToStorage(response);
      
      // Atualizar estado
      setState({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token || null,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success(`Bem-vindo, ${response.user.name}!`);
      console.log('[Auth] Login successful:', response.user.email);
      
      // Redirecionar para dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('[Auth] Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await post<AuthResponse>('/api/auth/register', data);
      
      // Salvar dados no localStorage (se retornou token)
      if (response.access_token) {
        saveAuthToStorage(response);
        
        setState({
          user: response.user,
          token: response.access_token,
          refreshToken: response.refresh_token || null,
          isAuthenticated: true,
          isLoading: false,
        });
        
        toast.success(`Conta criada com sucesso! Bem-vindo, ${response.user.name}!`);
        navigate('/dashboard');
      } else {
        // Sistema pode retornar que precisa de aprovação
        setState(prev => ({ ...prev, isLoading: false }));
        toast.success('Conta criada com sucesso! Aguarde a aprovação para acessar o sistema.');
        navigate('/login');
      }
      
      console.log('[Auth] Registration successful:', response);
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Tentar fazer logout no backend
      try {
        await post('/api/auth/logout');
      } catch (error) {
        console.warn('[Auth] Backend logout failed:', error);
        // Continua com logout local mesmo se o backend falhar
      }
      
      // Limpar estado local
      clearAuthStorage();
      setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      toast.success('Logout realizado com sucesso');
      console.log('[Auth] Logout successful');
      
      // Redirecionar para login
      navigate('/login');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Força logout local mesmo com erro
      clearAuthStorage();
      setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      navigate('/login');
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await post<AuthResponse>('/api/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      // Atualizar tokens
      saveAuthToStorage(response);
      setState(prev => ({
        ...prev,
        token: response.access_token,
        refreshToken: response.refresh_token || prev.refreshToken,
      }));
      
      console.log('[Auth] Token refreshed successfully');
    } catch (error) {
      console.error('[Auth] Refresh token error:', error);
      // Se refresh falhar, fazer logout
      await logout();
      throw error;
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      if (!state.isAuthenticated) {
        return null;
      }
      
      const user = await get<User>('/api/auth/me');
      
      // Atualizar usuário no estado se mudou
      if (user && user.id === state.user?.id) {
        setState(prev => ({ ...prev, user }));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('[Auth] Get current user error:', error);
      return null;
    }
  };

  // Verificar token na inicialização
  useEffect(() => {
    const verifyToken = async () => {
      if (state.token && !state.isLoading) {
        try {
          await getCurrentUser();
        } catch (error) {
          console.warn('[Auth] Token verification failed, logging out');
          await logout();
        }
      }
    };

    verifyToken();
  }, [state.token, state.isLoading]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Hook para verificar permissões
export const usePermissions = () => {
  const { user } = useAuth();
  
  const isOwner = user?.is_owner || false;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER' || isAdmin;
  const isCollaborator = user?.role === 'COLLABORATOR' || isManager;
  
  const canManageUsers = isOwner || isAdmin;
  const canManageCompany = isOwner || isAdmin;
  const canManageCycles = isOwner || isAdmin;
  const canCreateObjectives = isCollaborator;
  const canEditObjectives = isCollaborator;
  const canDeleteObjectives = isOwner || isAdmin;
  const canViewAnalytics = isCollaborator;
  const canExportReports = isCollaborator;
  
  return {
    user,
    isOwner,
    isAdmin,
    isManager,
    isCollaborator,
    canManageUsers,
    canManageCompany,
    canManageCycles,
    canCreateObjectives,
    canEditObjectives,
    canDeleteObjectives,
    canViewAnalytics,
    canExportReports,
  };
};

export default useAuth; 
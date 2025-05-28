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
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  loading: boolean; // Adicionar propriedade loading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const navigate = useNavigate();

  // Verificar se há usuário armazenado ao inicializar
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedUser = localStorage.getItem("nobugOkrUser");
        const storedToken = localStorage.getItem("nobugOkrToken");

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          
          setState({
            user: userData,
            token: storedToken,
            isLoading: false,
            isAuthenticated: true,
          });
          
          console.log("Usuário autenticado:", userData.email);
        } else {
          console.log("Nenhum token armazenado encontrado");
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Em caso de erro, limpar dados e definir como não autenticado
        clearTokens();
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Enviar dados no formato esperado pelo backend (JSON simples)
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { access_token, token_type, user } = response.data;
      
      // Armazenar tokens e usuário
      setTokens(access_token);
      localStorage.setItem("nobugOkrUser", JSON.stringify(user));
      
      setState({
        user,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });
      
      toast.success(`Bem-vindo, ${user.name}!`);
      console.log('Login realizado com sucesso:', user.email);
      navigate('/dashboard');
      
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Erro no login:', error);
      
      // Erro já é tratado pelo interceptor da API
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Enviar dados no formato esperado pelo backend UserRegister
      const response = await api.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        username: data.email, // Usar email como username por enquanto
        cpf_cnpj: data.cpf_cnpj || '000.000.000-00', // Campo obrigatório no backend
      });

      const responseData = response.data;
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Backend retorna mensagem de aguardo aprovação
      toast.success(responseData.message || 'Registro realizado com sucesso!');
      console.log('Registro realizado com sucesso:', responseData);
      
      // Redirecionar para login pois registro requer aprovação
      navigate('/login');
      
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Erro no registro:', error);
      
      // Erro já é tratado pelo interceptor da API
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Fazer logout no backend
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
      // Continuar com logout local mesmo se falhar no backend
    } finally {
      // Limpar dados locais
      clearTokens();
      
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/api/auth/me');
      
      setState(prev => ({
        ...prev,
        user: response.data,
      }));
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    getCurrentUser,
    loading: state.isLoading, // Mapear isLoading para loading
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

// Hook para verificar permissões
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    isOwner: user?.is_owner || false,
    isAdmin: user?.role === 'ADMIN' || user?.is_owner || false,
    isManager: user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.is_owner || false,
    canManageUsers: user?.role === 'ADMIN' || user?.is_owner || false,
    canManageCompany: user?.is_owner || false,
    canCreateObjectives: user?.role !== 'COLLABORATOR' || user?.is_owner || false,
  };
};

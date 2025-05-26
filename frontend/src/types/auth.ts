// Tipos de roles do usuário
export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'COLLABORATOR';

// Interface do usuário
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  is_owner: boolean;
  is_active: boolean;
  company_id: string;
  cpf_cnpj?: string;
  phone?: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

// Credenciais de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Dados de registro
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  username?: string;
  cpf_cnpj?: string;
  phone?: string;
  address?: string;
  description?: string;
  company_name?: string; // Para compatibilidade frontend
}

// Resposta de autenticação
export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user: User;
}

// Resposta de registro
export interface RegisterResponse {
  message: string;
  user_id: string;
  requires_approval: boolean;
}

// Estado de autenticação
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Context de autenticação
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

// Dados para criar usuário
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  username?: string; // Tornado opcional - será gerado automaticamente
  role: 'ADMIN' | 'MANAGER' | 'COLLABORATOR';
}

// Dados para atualizar usuário
export interface UpdateUserData {
  name?: string;
  username?: string;
  role?: UserRole;
  phone?: string;
  address?: string;
  description?: string;
  is_active?: boolean;
}

// Resposta da lista de usuários
export interface UsersListResponse {
  users: User[];
  total: number;
  has_more: boolean;
  filters_applied: {
    search?: string;
    role?: string;
    is_active?: boolean;
    limit: number;
    offset: number;
  };
}

// Filtros para usuários
export interface UserFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  limit?: number;
  offset?: number;
} 
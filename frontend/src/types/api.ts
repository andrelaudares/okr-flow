// Resposta de API genérica
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Resposta de lista paginada
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  filters_applied?: Record<string, any>;
}

// Resposta de erro da API
export interface ApiError {
  detail: string | ApiValidationError[];
  message?: string;
  code?: string;
}

// Erro de validação do Pydantic
export interface ApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, any>;
}

// Status de processamento
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// Resposta de health check
export interface HealthResponse {
  status: string;
  module?: string;
  sprint?: string;
  features?: string[];
  endpoints?: string[];
}

// Filtros base para paginação
export interface BaseFilters {
  limit?: number;
  offset?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Resposta com metadata
export interface ResponseWithMeta<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
    filters_applied: Record<string, any>;
  };
}

// Resposta de criação/atualização
export interface MutationResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  id?: string;
}

// Resposta de exclusão
export interface DeleteResponse {
  success: boolean;
  message: string;
  deleted_id?: string;
} 
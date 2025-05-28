// Interfaces para empresa
export interface Company {
  id: string;
  name: string;
  created_at: string;
  users_count: number;
  active_users_count: number;
}

export interface UpdateCompanyData {
  name: string;
} 
// Interfaces para empresa
export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  total_users: number;
  active_users: number;
  owner_name: string;
}

export interface UpdateCompanyData {
  name: string;
} 
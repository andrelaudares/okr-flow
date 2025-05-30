from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

# Enum para roles de usuário
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    COLLABORATOR = "COLLABORATOR"

# Modelo para a tabela users no banco de dados
class UserDB(BaseModel):
    id: UUID
    email: str
    username: str
    name: str
    cpf_cnpj: Optional[str] = None
    asaas_customer_id: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    role: UserRole = UserRole.COLLABORATOR
    company_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    is_owner: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True # Compatibilidade com ORM, útil mesmo sem usar um ORM completo com Supabase

# Modelos para requisições da API
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    username: str
    cpf_cnpj: str
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    username: str
    role: UserRole = UserRole.COLLABORATOR
    team_id: Optional[UUID] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    role: Optional[UserRole] = None
    team_id: Optional[UUID] = None
    is_active: Optional[bool] = None

# Modelo para resposta da API (GET /users/me)
class UserProfile(BaseModel):
    id: UUID
    email: str
    username: str
    name: str
    cpf_cnpj: Optional[str] = None
    asaas_customer_id: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    role: UserRole = UserRole.COLLABORATOR
    company_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    is_owner: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

# Modelo para listagem de usuários (sem dados sensíveis)
class UserList(BaseModel):
    id: UUID
    email: str
    username: str
    name: str
    role: UserRole
    team_id: Optional[UUID] = None
    is_owner: bool = False
    is_active: bool = True
    created_at: datetime

# Modelo para resposta de registros
class UserRegisterResponse(BaseModel):
    message: str
    user_id: UUID
    requires_approval: bool = True 
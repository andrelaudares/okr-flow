from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class CompanyBase(BaseModel):
    """Modelo base para empresa"""
    name: str = Field(..., min_length=1, max_length=200, description="Nome da empresa")

class CompanyCreate(CompanyBase):
    """Modelo para criação de empresa (caso necessário no futuro)"""
    pass

class CompanyUpdate(BaseModel):
    """Modelo para atualização de empresa"""
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Nome da empresa")

class Company(CompanyBase):
    """Modelo completo da empresa"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CompanyProfile(BaseModel):
    """Perfil da empresa com informações estatísticas"""
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime
    total_users: int
    active_users: int
    owner_name: str
    
    class Config:
        from_attributes = True 
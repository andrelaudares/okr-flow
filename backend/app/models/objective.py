from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class ObjectiveStatus(str, Enum):
    """Status do objetivo"""
    ON_TRACK = "ON_TRACK"
    AT_RISK = "AT_RISK"
    BEHIND = "BEHIND"
    COMPLETED = "COMPLETED"
    PLANNED = "PLANNED"

class ObjectiveBase(BaseModel):
    """Modelo base para objetivo"""
    title: str = Field(..., min_length=1, max_length=200, description="Título do objetivo")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição do objetivo")
    
    @validator('title')
    def validate_title(cls, v):
        if not v or v.strip() == '':
            raise ValueError('Título não pode estar vazio')
        return v.strip()

class ObjectiveCreate(ObjectiveBase):
    """Modelo para criação de objetivo"""
    owner_id: Optional[UUID] = Field(None, description="ID do responsável pelo objetivo")
    cycle_id: Optional[UUID] = Field(None, description="ID do ciclo (se não informado, usa o ciclo ativo)")

class ObjectiveUpdate(BaseModel):
    """Modelo para atualização de objetivo"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Título do objetivo")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição do objetivo")
    owner_id: Optional[UUID] = Field(None, description="ID do responsável pelo objetivo")
    status: Optional[ObjectiveStatus] = Field(None, description="Status do objetivo")
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None and (not v or v.strip() == ''):
            raise ValueError('Título não pode estar vazio')
        return v.strip() if v else v

class Objective(ObjectiveBase):
    """Modelo completo do objetivo"""
    id: UUID
    owner_id: Optional[UUID]
    company_id: UUID
    cycle_id: Optional[UUID]
    status: ObjectiveStatus
    progress: float = Field(default=0.0, ge=0.0, le=100.0, description="Progresso do objetivo (0-100%)")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ObjectiveWithDetails(Objective):
    """Modelo do objetivo com detalhes adicionais"""
    owner_name: Optional[str] = Field(None, description="Nome do responsável")
    cycle_name: Optional[str] = Field(None, description="Nome do ciclo")
    key_results_count: int = Field(default=0, description="Número de key results")
    
    class Config:
        from_attributes = True

class ObjectiveFilter(BaseModel):
    """Modelo para filtros de objetivos"""
    search: Optional[str] = Field(None, description="Busca por título ou descrição")
    status: Optional[List[ObjectiveStatus]] = Field(None, description="Filtrar por status")
    owner_id: Optional[UUID] = Field(None, description="Filtrar por responsável")
    cycle_id: Optional[UUID] = Field(None, description="Filtrar por ciclo")
    limit: Optional[int] = Field(50, ge=1, le=100, description="Limite de resultados")
    offset: Optional[int] = Field(0, ge=0, description="Offset para paginação")

class ObjectiveListResponse(BaseModel):
    """Resposta para listagem de objetivos"""
    objectives: List[ObjectiveWithDetails]
    total: int
    has_more: bool
    filters_applied: ObjectiveFilter
    
class ObjectiveStatsResponse(BaseModel):
    """Resposta com estatísticas de objetivos"""
    total_objectives: int
    by_status: dict[ObjectiveStatus, int]
    average_progress: float
    completed_count: int
    in_progress_count: int
    planned_count: int 
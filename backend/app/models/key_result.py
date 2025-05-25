from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class KRUnit(str, Enum):
    """Unidade do Key Result"""
    PERCENTAGE = "PERCENTAGE"
    NUMBER = "NUMBER"
    CURRENCY = "CURRENCY"
    BINARY = "BINARY"

class KRStatus(str, Enum):
    """Status do Key Result"""
    ON_TRACK = "ON_TRACK"
    AT_RISK = "AT_RISK"
    BEHIND = "BEHIND"
    COMPLETED = "COMPLETED"
    PLANNED = "PLANNED"

class KeyResultBase(BaseModel):
    """Modelo base para Key Result"""
    title: str = Field(..., min_length=1, max_length=200, description="Título do Key Result")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição do Key Result")
    target_value: float = Field(..., description="Valor meta a ser atingido")
    unit: KRUnit = Field(..., description="Unidade de medida")
    start_value: Optional[float] = Field(0.0, description="Valor inicial (padrão: 0)")
    current_value: Optional[float] = Field(0.0, description="Valor atual")
    confidence_level: Optional[float] = Field(None, ge=0.0, le=1.0, description="Nível de confiança (0-1)")
    
    @validator('title')
    def validate_title(cls, v):
        if not v or v.strip() == '':
            raise ValueError('Título não pode estar vazio')
        return v.strip()
    
    @validator('target_value')
    def validate_target_value(cls, v):
        if v <= 0:
            raise ValueError('Valor meta deve ser positivo')
        return v

class KeyResultCreate(KeyResultBase):
    """Modelo para criação de Key Result"""
    owner_id: Optional[UUID] = Field(None, description="ID do responsável pelo Key Result")

class KeyResultUpdate(BaseModel):
    """Modelo para atualização de Key Result"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Título do Key Result")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição do Key Result")
    owner_id: Optional[UUID] = Field(None, description="ID do responsável pelo Key Result")
    target_value: Optional[float] = Field(None, description="Valor meta")
    current_value: Optional[float] = Field(None, description="Valor atual")
    unit: Optional[KRUnit] = Field(None, description="Unidade de medida")
    start_value: Optional[float] = Field(None, description="Valor inicial")
    confidence_level: Optional[float] = Field(None, ge=0.0, le=1.0, description="Nível de confiança")
    status: Optional[KRStatus] = Field(None, description="Status do Key Result")
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None and (not v or v.strip() == ''):
            raise ValueError('Título não pode estar vazio')
        return v.strip() if v else v
    
    @validator('target_value')
    def validate_target_value(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Valor meta deve ser positivo')
        return v

class KeyResult(KeyResultBase):
    """Modelo completo do Key Result"""
    id: UUID
    objective_id: UUID
    owner_id: Optional[UUID]
    status: KRStatus
    progress: float = Field(default=0.0, ge=0.0, le=100.0, description="Progresso calculado automaticamente (0-100%)")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class KeyResultWithDetails(KeyResult):
    """Modelo do Key Result com detalhes adicionais"""
    owner_name: Optional[str] = Field(None, description="Nome do responsável")
    objective_title: str = Field(..., description="Título do objetivo")
    
    class Config:
        from_attributes = True

class CheckinBase(BaseModel):
    """Modelo base para Check-in"""
    value_at_checkin: float = Field(..., description="Valor no momento do check-in")
    confidence_level_at_checkin: Optional[float] = Field(None, ge=0.0, le=1.0, description="Nível de confiança no check-in")
    notes: Optional[str] = Field(None, max_length=1000, description="Observações do check-in")

class CheckinCreate(CheckinBase):
    """Modelo para criação de Check-in"""
    pass

class CheckinUpdate(BaseModel):
    """Modelo para atualização de Check-in"""
    value_at_checkin: Optional[float] = Field(None, description="Valor no check-in")
    confidence_level_at_checkin: Optional[float] = Field(None, ge=0.0, le=1.0, description="Nível de confiança")
    notes: Optional[str] = Field(None, max_length=1000, description="Observações")

class Checkin(CheckinBase):
    """Modelo completo do Check-in"""
    id: UUID
    key_result_id: UUID
    author_id: Optional[UUID]
    checkin_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class CheckinWithDetails(Checkin):
    """Modelo do Check-in com detalhes adicionais"""
    author_name: Optional[str] = Field(None, description="Nome do autor do check-in")
    
    class Config:
        from_attributes = True

class KeyResultFilter(BaseModel):
    """Modelo para filtros de Key Results"""
    search: Optional[str] = Field(None, description="Busca por título ou descrição")
    status: Optional[List[KRStatus]] = Field(None, description="Filtrar por status")
    owner_id: Optional[UUID] = Field(None, description="Filtrar por responsável")
    unit: Optional[List[KRUnit]] = Field(None, description="Filtrar por unidade")
    limit: Optional[int] = Field(50, ge=1, le=100, description="Limite de resultados")
    offset: Optional[int] = Field(0, ge=0, description="Offset para paginação")

class KeyResultListResponse(BaseModel):
    """Resposta para listagem de Key Results"""
    key_results: List[KeyResultWithDetails]
    total: int
    has_more: bool
    filters_applied: KeyResultFilter

class CheckinListResponse(BaseModel):
    """Resposta para listagem de Check-ins"""
    checkins: List[CheckinWithDetails]
    total: int 
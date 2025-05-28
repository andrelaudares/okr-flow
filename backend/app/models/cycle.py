from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from enum import Enum

class CycleBase(BaseModel):
    """Modelo base para ciclo"""
    name: str = Field(..., min_length=1, max_length=200, description="Nome do ciclo")
    start_date: date = Field(..., description="Data de início do ciclo")
    end_date: date = Field(..., description="Data de fim do ciclo")
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('Data de fim deve ser posterior à data de início')
        return v

class CycleCreate(CycleBase):
    """Modelo para criação de ciclo"""
    pass

class CycleUpdate(BaseModel):
    """Modelo para atualização de ciclo"""
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Nome do ciclo")
    start_date: Optional[date] = Field(None, description="Data de início do ciclo")
    end_date: Optional[date] = Field(None, description="Data de fim do ciclo")
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and values['start_date'] and v <= values['start_date']:
            raise ValueError('Data de fim deve ser posterior à data de início')
        return v

class Cycle(CycleBase):
    """Modelo completo do ciclo"""
    id: UUID
    company_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CycleStatus(BaseModel):
    """Status e progresso do ciclo"""
    id: UUID
    name: str
    start_date: date
    end_date: date
    is_active: bool
    days_total: int
    days_elapsed: int
    days_remaining: int
    progress_percentage: float
    is_current: bool
    is_future: bool
    is_past: bool
    
    class Config:
        from_attributes = True

# Modelos para Dashboard Cards
class TimeCardType(str, Enum):
    """Tipos de cards temporais"""
    TRIMESTRE = "TRIMESTRE"
    QUADRIMESTRE = "QUADRIMESTRE" 
    SEMESTRE = "SEMESTRE"
    ANO = "ANO"

class TimeCard(BaseModel):
    """Card temporal para dashboard"""
    type: TimeCardType
    name: str
    start_date: date
    end_date: date
    days_total: int
    days_elapsed: int
    days_remaining: int
    progress_percentage: float
    is_current: bool

class DashboardPreferencesBase(BaseModel):
    """Modelo base para preferências do dashboard"""
    selected_cards: list[TimeCardType] = Field(default=[], max_items=3, description="Até 3 cards selecionados")
    
    @validator('selected_cards')
    def validate_unique_cards(cls, v):
        if len(v) != len(set(v)):
            raise ValueError('Cards selecionados devem ser únicos')
        return v

class DashboardPreferencesCreate(DashboardPreferencesBase):
    """Modelo para criação de preferências"""
    pass

class DashboardPreferencesUpdate(DashboardPreferencesBase):
    """Modelo para atualização de preferências"""
    pass

class DashboardPreferences(DashboardPreferencesBase):
    """Modelo completo das preferências"""
    id: UUID
    user_id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TimeCardsResponse(BaseModel):
    """Resposta com cards temporais"""
    available_cards: list[TimeCard]
    user_preferences: Optional[DashboardPreferences]
    active_cycle: Optional[CycleStatus]
    all_cycles: list[CycleStatus] = Field(default=[], description="Todos os ciclos da empresa") 
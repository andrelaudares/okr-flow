from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from enum import Enum

class CycleType(str, Enum):
    SEMESTRE = "SEMESTRE"
    TRIMESTRE = "TRIMESTRE" 
    QUADRIMESTRE = "QUADRIMESTRE"

class GlobalCycle(BaseModel):
    id: UUID
    code: str
    name: str
    display_name: str
    type: CycleType
    year: int
    start_month: int
    start_day: int
    end_month: int
    end_day: int
    start_date: date
    end_date: date
    is_current: bool
    created_at: datetime
    
    # Campos calculados para compatibilidade com frontend
    days_total: Optional[int] = None
    days_elapsed: Optional[int] = None
    days_remaining: Optional[int] = None
    progress_percentage: Optional[float] = None

class UserCyclePreference(BaseModel):
    id: UUID
    user_id: UUID
    company_id: UUID
    global_cycle_code: str
    year: int
    created_at: datetime
    updated_at: datetime

class CyclePreferenceUpdate(BaseModel):
    global_cycle_code: str
    year: Optional[int] = None

class CyclePreferenceCreate(BaseModel):
    global_cycle_code: str
    year: Optional[int] = None

class GlobalCycleWithStatus(GlobalCycle):
    """Ciclo global com status calculado (similar ao CycleStatus atual)"""
    is_future: bool = False
    is_past: bool = False
    
    class Config:
        from_attributes = True 
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TrendDirection(str, Enum):
    """Direção da tendência"""
    UP = "UP"
    DOWN = "DOWN"
    STABLE = "STABLE"

class StatusColor(str, Enum):
    """Cores de status visual"""
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    RED = "RED"

class DashboardStats(BaseModel):
    """Estatísticas gerais do dashboard"""
    total_objectives: int
    total_key_results: int
    active_users: int
    active_cycle_name: Optional[str] = None
    active_cycle_progress: float
    company_name: str
    last_updated: str

class ProgressData(BaseModel):
    """Dados de progresso com tendências"""
    current_progress: float
    expected_progress: float
    variance: float
    status_color: StatusColor
    trend_direction: TrendDirection
    trend_percentage: float
    cycle_days_total: int
    cycle_days_elapsed: int
    cycle_days_remaining: int

class ObjectivesCount(BaseModel):
    """Contadores de objetivos por status"""
    total: int
    completed: int
    on_track: int
    at_risk: int
    behind: int
    planned: int
    completion_rate: float
    on_track_rate: float

class EvolutionPoint(BaseModel):
    """Ponto individual de evolução"""
    date: str
    actual_progress: float
    expected_progress: float
    objectives_count: int

class TrendAnalysis(BaseModel):
    """Análise de tendência"""
    direction: str
    average_weekly_growth: float
    consistency_score: float
    prediction_next_week: float

class PerformanceSummary(BaseModel):
    """Resumo de performance"""
    overall_score: float
    time_efficiency: float
    goal_achievement: float
    team_engagement: float

class EvolutionData(BaseModel):
    """Dados de evolução temporal"""
    period_start: str
    period_end: str
    current_date: str
    evolution_points: List[EvolutionPoint]
    trend_analysis: TrendAnalysis
    performance_summary: PerformanceSummary

class DashboardCardsResponse(BaseModel):
    """Resposta completa dos cards do dashboard"""
    stats: DashboardStats
    progress: ProgressData
    objectives_count: ObjectivesCount
    evolution: EvolutionData
    generated_at: datetime
    
    class Config:
        from_attributes = True 
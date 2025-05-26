from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class TrendDirection(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    STABLE = "STABLE"


class PeriodGranularity(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"


# Ponto único de evolução temporal
class EvolutionPoint(BaseModel):
    date: str = Field(..., description="Data no formato YYYY-MM-DD")
    actual_progress: float = Field(..., description="Progresso real percentual")
    expected_progress: float = Field(..., description="Progresso esperado percentual") 
    objectives_count: int = Field(..., description="Número de objetivos ativos na data")
    completed_objectives: int = Field(default=0, description="Número de objetivos concluídos")
    active_key_results: int = Field(default=0, description="Número de Key Results ativos")


# Análise de tendência
class TrendAnalysis(BaseModel):
    direction: TrendDirection = Field(..., description="Direção da tendência")
    average_weekly_growth: float = Field(..., description="Crescimento médio semanal em %")
    consistency_score: float = Field(..., description="Score de consistência (0-100)")
    prediction_next_week: float = Field(..., description="Previsão para próxima semana")
    volatility_index: float = Field(default=0.0, description="Índice de volatilidade")


# Resumo de performance
class PerformanceSummary(BaseModel):
    overall_score: float = Field(..., description="Score geral de performance (0-100)")
    time_efficiency: float = Field(..., description="Eficiência temporal (0-100)")
    goal_achievement: float = Field(..., description="Taxa de conquista de metas (0-100)")
    team_engagement: float = Field(..., description="Engajamento da equipe (0-100)")
    completion_rate: float = Field(..., description="Taxa de conclusão de objetivos")


# Dados históricos gerais - GET /api/analytics/history
class HistoryData(BaseModel):
    company_id: str = Field(..., description="ID da empresa")
    company_name: str = Field(..., description="Nome da empresa")
    period_start: date = Field(..., description="Data de início do período")
    period_end: date = Field(..., description="Data de fim do período")
    current_date: date = Field(..., description="Data atual")
    active_cycle_name: Optional[str] = Field(None, description="Nome do ciclo ativo")
    
    # Dados de evolução
    evolution_points: List[EvolutionPoint] = Field(..., description="Pontos de evolução temporal")
    granularity: PeriodGranularity = Field(default=PeriodGranularity.WEEKLY, description="Granularidade dos dados")
    
    # Análises
    trend_analysis: TrendAnalysis = Field(..., description="Análise de tendências")
    performance_summary: PerformanceSummary = Field(..., description="Resumo de performance")
    
    # Métricas gerais
    total_objectives_period: int = Field(..., description="Total de objetivos no período")
    total_key_results_period: int = Field(..., description="Total de Key Results no período")
    total_checkins_period: int = Field(..., description="Total de check-ins no período")


# Histórico específico de um objetivo - GET /api/analytics/objectives/:id
class ObjectiveHistoryPoint(BaseModel):
    date: str = Field(..., description="Data no formato YYYY-MM-DD")
    progress: float = Field(..., description="Progresso do objetivo em %")
    key_results_count: int = Field(..., description="Número de Key Results")
    checkins_count: int = Field(..., description="Número de check-ins na data")
    notes: Optional[str] = Field(None, description="Observações da data")


class ObjectiveHistory(BaseModel):
    objective_id: str = Field(..., description="ID do objetivo")
    objective_title: str = Field(..., description="Título do objetivo")
    objective_status: str = Field(..., description="Status atual do objetivo")
    owner_name: Optional[str] = Field(None, description="Nome do responsável")
    cycle_name: str = Field(..., description="Nome do ciclo")
    
    # Período analisado
    period_start: date = Field(..., description="Data de início da análise")
    period_end: date = Field(..., description="Data de fim da análise")
    
    # Evolução histórica
    history_points: List[ObjectiveHistoryPoint] = Field(..., description="Pontos históricos")
    
    # Métricas do objetivo
    initial_progress: float = Field(..., description="Progresso inicial")
    current_progress: float = Field(..., description="Progresso atual")
    total_growth: float = Field(..., description="Crescimento total em %")
    average_weekly_growth: float = Field(..., description="Crescimento médio semanal")
    
    # Key Results relacionados
    key_results_summary: List[dict] = Field(default_factory=list, description="Resumo dos Key Results")


# Análise de tendências - GET /api/analytics/trends  
class TrendMetrics(BaseModel):
    metric_name: str = Field(..., description="Nome da métrica")
    current_value: float = Field(..., description="Valor atual")
    previous_value: float = Field(..., description="Valor anterior")
    change_percentage: float = Field(..., description="Variação percentual")
    trend_direction: TrendDirection = Field(..., description="Direção da tendência")
    is_positive_trend: bool = Field(..., description="Se é uma tendência positiva")


class TrendsAnalysis(BaseModel):
    analysis_date: datetime = Field(..., description="Data e hora da análise")
    company_id: str = Field(..., description="ID da empresa")
    period_analyzed: str = Field(..., description="Período analisado (ex: 'Últimas 4 semanas')")
    
    # Métricas de tendência
    objectives_trend: TrendMetrics = Field(..., description="Tendência de objetivos")
    progress_trend: TrendMetrics = Field(..., description="Tendência de progresso")
    completion_trend: TrendMetrics = Field(..., description="Tendência de conclusão")
    engagement_trend: TrendMetrics = Field(..., description="Tendência de engajamento")
    key_results_trend: TrendMetrics = Field(..., description="Tendência de Key Results")
    
    # Insights automáticos
    insights: List[str] = Field(default_factory=list, description="Insights automáticos")
    recommendations: List[str] = Field(default_factory=list, description="Recomendações")
    
    # Status geral
    overall_health_score: float = Field(..., description="Score geral de saúde (0-100)")
    improvement_areas: List[str] = Field(default_factory=list, description="Áreas de melhoria")


# Métricas de performance - GET /api/analytics/performance
class PerformanceMetric(BaseModel):
    name: str = Field(..., description="Nome da métrica")
    value: float = Field(..., description="Valor da métrica")
    unit: str = Field(..., description="Unidade da métrica")
    benchmark: Optional[float] = Field(None, description="Benchmark/meta")
    performance_level: str = Field(..., description="Nível de performance (Excelente, Bom, Regular, Baixo)")
    description: str = Field(..., description="Descrição da métrica")


class CyclePerformance(BaseModel):
    cycle_id: str = Field(..., description="ID do ciclo")
    cycle_name: str = Field(..., description="Nome do ciclo")
    cycle_progress: float = Field(..., description="Progresso temporal do ciclo em %")
    objectives_performance: float = Field(..., description="Performance dos objetivos em %")
    efficiency_score: float = Field(..., description="Score de eficiência")
    
    # Comparação com ciclos anteriores
    previous_cycle_comparison: Optional[float] = Field(None, description="Comparação com ciclo anterior")
    improvement_percentage: Optional[float] = Field(None, description="Percentual de melhoria")


class PerformanceAnalysis(BaseModel):
    analysis_date: datetime = Field(..., description="Data e hora da análise")
    company_id: str = Field(..., description="ID da empresa")
    company_name: str = Field(..., description="Nome da empresa")
    
    # Performance do ciclo atual
    current_cycle: CyclePerformance = Field(..., description="Performance do ciclo atual")
    
    # Métricas detalhadas
    metrics: List[PerformanceMetric] = Field(..., description="Métricas detalhadas")
    
    # Resumo executivo
    executive_summary: dict = Field(..., description="Resumo executivo")
    
    # Alertas e recomendações
    alerts: List[str] = Field(default_factory=list, description="Alertas importantes")
    action_items: List[str] = Field(default_factory=list, description="Itens de ação")
    
    # Comparações temporais
    month_over_month: Optional[float] = Field(None, description="Comparação mês a mês")
    quarter_over_quarter: Optional[float] = Field(None, description="Comparação trimestre a trimestre")


# Filtros para queries de analytics
class AnalyticsFilter(BaseModel):
    start_date: Optional[date] = Field(None, description="Data de início")
    end_date: Optional[date] = Field(None, description="Data de fim")
    cycle_id: Optional[str] = Field(None, description="ID do ciclo específico")
    owner_id: Optional[str] = Field(None, description="ID do responsável")
    granularity: PeriodGranularity = Field(default=PeriodGranularity.WEEKLY, description="Granularidade")
    include_predictions: bool = Field(default=True, description="Incluir previsões")
    include_benchmarks: bool = Field(default=True, description="Incluir benchmarks")


# Response models para endpoints
class HistoryResponse(BaseModel):
    success: bool = Field(default=True)
    data: HistoryData = Field(..., description="Dados históricos")
    message: str = Field(default="Histórico recuperado com sucesso")


class ObjectiveHistoryResponse(BaseModel):
    success: bool = Field(default=True)
    data: ObjectiveHistory = Field(..., description="Histórico do objetivo")
    message: str = Field(default="Histórico do objetivo recuperado com sucesso")


class TrendsResponse(BaseModel):
    success: bool = Field(default=True)
    data: TrendsAnalysis = Field(..., description="Análise de tendências")
    message: str = Field(default="Análise de tendências gerada com sucesso")


class PerformanceResponse(BaseModel):
    success: bool = Field(default=True)
    data: PerformanceAnalysis = Field(..., description="Análise de performance")
    message: str = Field(default="Análise de performance gerada com sucesso") 
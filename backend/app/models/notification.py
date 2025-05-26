from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class NotificationType(str, Enum):
    """Tipos de notificação do sistema"""
    CHECKIN_PENDING = "CHECKIN_PENDING"           # KR sem check-in há X dias
    OBJECTIVE_BEHIND = "OBJECTIVE_BEHIND"         # Objetivo atrasado
    CYCLE_ENDING = "CYCLE_ENDING"                 # Fim de ciclo se aproximando
    TARGET_ACHIEVED = "TARGET_ACHIEVED"           # Meta atingida (100%)


class NotificationPriority(int, Enum):
    """Prioridades de notificação"""
    LOW = 1      # Baixa
    MEDIUM = 2   # Média
    HIGH = 3     # Alta


# Modelos base
class NotificationBase(BaseModel):
    """Modelo base para notificações"""
    type: NotificationType = Field(..., description="Tipo da notificação")
    title: str = Field(..., min_length=1, max_length=200, description="Título da notificação")
    message: str = Field(..., min_length=1, max_length=500, description="Mensagem da notificação")
    data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dados adicionais da notificação")
    priority: NotificationPriority = Field(default=NotificationPriority.MEDIUM, description="Prioridade da notificação")
    expires_at: Optional[datetime] = Field(None, description="Data de expiração da notificação")


class NotificationCreate(NotificationBase):
    """Modelo para criação de notificação"""
    user_id: Optional[str] = Field(None, description="ID do usuário (opcional, usa o logado se não especificado)")


class NotificationUpdate(BaseModel):
    """Modelo para atualização de notificação"""
    is_read: Optional[bool] = Field(None, description="Marcar como lida")


class Notification(NotificationBase):
    """Modelo completo de notificação"""
    id: str = Field(..., description="ID único da notificação")
    user_id: str = Field(..., description="ID do usuário")
    company_id: str = Field(..., description="ID da empresa")
    is_read: bool = Field(default=False, description="Se a notificação foi lida")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data de atualização")
    
    class Config:
        from_attributes = True


class NotificationWithUser(Notification):
    """Modelo de notificação com dados do usuário"""
    user_name: Optional[str] = Field(None, description="Nome do usuário")


# Modelos de configurações
class NotificationSettingsBase(BaseModel):
    """Modelo base para configurações de notificação"""
    checkin_pending_enabled: bool = Field(default=True, description="Ativar alertas de check-in pendente")
    checkin_pending_days: int = Field(default=3, ge=1, le=30, description="Dias sem check-in para alertar")
    
    objective_behind_enabled: bool = Field(default=True, description="Ativar alertas de objetivo atrasado")
    objective_behind_threshold: int = Field(default=20, ge=5, le=50, description="% abaixo do esperado para alertar")
    
    cycle_ending_enabled: bool = Field(default=True, description="Ativar alertas de fim de ciclo")
    cycle_ending_days: int = Field(default=7, ge=1, le=30, description="Dias antes do fim do ciclo para alertar")
    
    target_achieved_enabled: bool = Field(default=True, description="Ativar alertas de meta atingida")
    
    email_notifications: bool = Field(default=True, description="Receber notificações por email")
    push_notifications: bool = Field(default=True, description="Receber notificações push")


class NotificationSettingsCreate(NotificationSettingsBase):
    """Modelo para criação de configurações"""
    pass


class NotificationSettingsUpdate(NotificationSettingsBase):
    """Modelo para atualização de configurações"""
    pass


class NotificationSettings(NotificationSettingsBase):
    """Modelo completo de configurações de notificação"""
    id: str = Field(..., description="ID único das configurações")
    user_id: str = Field(..., description="ID do usuário")
    company_id: str = Field(..., description="ID da empresa")
    created_at: datetime = Field(..., description="Data de criação")
    updated_at: datetime = Field(..., description="Data de atualização")
    
    class Config:
        from_attributes = True


# Modelos de resposta
class NotificationListResponse(BaseModel):
    """Resposta da listagem de notificações"""
    notifications: List[Notification] = Field(..., description="Lista de notificações")
    total: int = Field(..., description="Total de notificações")
    unread_count: int = Field(..., description="Quantidade de não lidas")
    has_more: bool = Field(..., description="Se há mais notificações")
    filters_applied: Dict[str, Any] = Field(..., description="Filtros aplicados")


class NotificationStatsResponse(BaseModel):
    """Resposta das estatísticas de notificações"""
    total: int = Field(..., description="Total de notificações")
    unread: int = Field(..., description="Não lidas")
    by_type: Dict[str, int] = Field(..., description="Contagem por tipo")
    by_priority: Dict[str, int] = Field(..., description="Contagem por prioridade")
    recent_count: int = Field(..., description="Notificações das últimas 24h")


class MarkReadRequest(BaseModel):
    """Modelo para marcar notificações como lidas"""
    notification_ids: List[str] = Field(..., description="IDs das notificações para marcar como lidas")


class MarkReadResponse(BaseModel):
    """Resposta da marcação como lida"""
    marked_count: int = Field(..., description="Quantidade de notificações marcadas")
    message: str = Field(..., description="Mensagem de confirmação")


# Modelos para filtros
class NotificationFilter(BaseModel):
    """Filtros para listagem de notificações"""
    type: Optional[List[NotificationType]] = Field(None, description="Filtrar por tipos")
    is_read: Optional[bool] = Field(None, description="Filtrar por lidas/não lidas")
    priority: Optional[List[NotificationPriority]] = Field(None, description="Filtrar por prioridade")
    start_date: Optional[datetime] = Field(None, description="Data inicial")
    end_date: Optional[datetime] = Field(None, description="Data final")
    limit: int = Field(default=50, ge=1, le=100, description="Limite de resultados")
    offset: int = Field(default=0, ge=0, description="Offset para paginação")


# Modelos para geração automática de notificações
class NotificationAlert(BaseModel):
    """Modelo para alertas automáticos"""
    type: NotificationType = Field(..., description="Tipo do alerta")
    title: str = Field(..., description="Título do alerta")
    message: str = Field(..., description="Mensagem do alerta")
    user_ids: List[str] = Field(..., description="IDs dos usuários para notificar")
    data: Dict[str, Any] = Field(default_factory=dict, description="Dados relacionados")
    priority: NotificationPriority = Field(default=NotificationPriority.MEDIUM, description="Prioridade")


class AlertContext(BaseModel):
    """Contexto para geração de alertas"""
    company_id: str = Field(..., description="ID da empresa")
    objective_id: Optional[str] = Field(None, description="ID do objetivo relacionado")
    key_result_id: Optional[str] = Field(None, description="ID do Key Result relacionado")
    cycle_id: Optional[str] = Field(None, description="ID do ciclo relacionado")
    threshold_days: Optional[int] = Field(None, description="Dias para threshold")
    progress_percentage: Optional[float] = Field(None, description="Percentual de progresso")
    expected_percentage: Optional[float] = Field(None, description="Percentual esperado") 
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from datetime import datetime

from ..dependencies import get_current_user, get_supabase_admin
from ..models.user import UserProfile
from ..models.notification import (
    NotificationFilter, NotificationListResponse, NotificationStatsResponse,
    NotificationSettings, NotificationSettingsUpdate, NotificationSettingsCreate,
    MarkReadRequest, MarkReadResponse, NotificationType, NotificationPriority
)
from ..services.notification_service import NotificationService

router = APIRouter()


@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    type_filter: Optional[List[str]] = Query(None, alias="type"),
    is_read: Optional[bool] = Query(None),
    priority: Optional[List[int]] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin = Depends(get_supabase_admin)
):
    """
    Lista notificações do usuário logado com filtros opcionais.
    
    **Filtros disponíveis:**
    - `type`: Tipos de notificação (CHECKIN_PENDING, OBJECTIVE_BEHIND, CYCLE_ENDING, TARGET_ACHIEVED)
    - `is_read`: Filtrar por lidas (true) ou não lidas (false)
    - `priority`: Prioridades (1=baixa, 2=média, 3=alta)
    - `start_date`: Data inicial (formato ISO)
    - `end_date`: Data final (formato ISO)
    - `limit`: Limite de resultados (1-100)
    - `offset`: Offset para paginação
    """
    
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="Usuário não possui empresa associada")
    
    # Processa filtros
    notification_types = None
    if type_filter:
        try:
            notification_types = [NotificationType(t) for t in type_filter]
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Tipo de notificação inválido: {str(e)}")
    
    priority_values = None
    if priority:
        try:
            priority_values = [NotificationPriority(p) for p in priority]
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Prioridade inválida: {str(e)}")
    
    filters = NotificationFilter(
        type=notification_types,
        is_read=is_read,
        priority=priority_values,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset
    )
    
    # Busca notificações
    service = NotificationService(supabase_admin)
    notifications, total, unread_count = await service.get_notifications(
        current_user.id, str(current_user.company_id), filters
    )
    
    has_more = (offset + limit) < total
    
    return NotificationListResponse(
        notifications=notifications,
        total=total,
        unread_count=unread_count,
        has_more=has_more,
        filters_applied={
            "type": type_filter,
            "is_read": is_read,
            "priority": priority,
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
            "limit": limit,
            "offset": offset
        }
    )


@router.post("/mark-read", response_model=MarkReadResponse)
async def mark_notifications_as_read(
    request: MarkReadRequest,
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin = Depends(get_supabase_admin)
):
    """
    Marca uma ou mais notificações como lidas.
    
    **Parâmetros:**
    - `notification_ids`: Lista de IDs das notificações para marcar como lidas
    
    **Validações:**
    - Usuário só pode marcar suas próprias notificações
    - IDs devem ser válidos
    """
    
    if not request.notification_ids:
        raise HTTPException(status_code=400, detail="Lista de IDs não pode estar vazia")
    
    service = NotificationService(supabase_admin)
    marked_count = await service.mark_as_read(request.notification_ids, current_user.id)
    
    return MarkReadResponse(
        marked_count=marked_count,
        message=f"{marked_count} notificação(ões) marcada(s) como lida(s)"
    )


@router.get("/stats", response_model=NotificationStatsResponse)
async def get_notification_stats(
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin = Depends(get_supabase_admin)
):
    """
    Retorna estatísticas das notificações do usuário.
    
    **Estatísticas incluídas:**
    - Total de notificações
    - Quantidade não lidas
    - Distribuição por tipo
    - Distribuição por prioridade  
    - Notificações das últimas 24h
    """
    
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="Usuário não possui empresa associada")
    
    service = NotificationService(supabase_admin)
    stats = await service.get_notification_stats(current_user.id, str(current_user.company_id))
    
    return NotificationStatsResponse(**stats)


@router.get("/settings", response_model=NotificationSettings)
async def get_notification_settings(
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin = Depends(get_supabase_admin)
):
    """
    Retorna as configurações de notificação do usuário.
    
    **Configurações incluídas:**
    - Alertas de check-in pendente
    - Alertas de objetivo atrasado
    - Alertas de fim de ciclo
    - Alertas de meta atingida
    - Preferências de entrega (email, push)
    """
    
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="Usuário não possui empresa associada")
    
    service = NotificationService(supabase_admin)
    settings = await service.get_settings(current_user.id, str(current_user.company_id))
    
    if not settings:
        raise HTTPException(status_code=404, detail="Configurações não encontradas")
    
    return settings


@router.put("/settings", response_model=NotificationSettings)
async def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin = Depends(get_supabase_admin)
):
    """
    Atualiza as configurações de notificação do usuário.
    
    **Configurações editáveis:**
    - `checkin_pending_enabled`: Ativar/desativar alertas de check-in pendente
    - `checkin_pending_days`: Dias sem check-in para alertar (1-30)
    - `objective_behind_enabled`: Ativar/desativar alertas de objetivo atrasado
    - `objective_behind_threshold`: % abaixo do esperado para alertar (5-50)
    - `cycle_ending_enabled`: Ativar/desativar alertas de fim de ciclo
    - `cycle_ending_days`: Dias antes do fim do ciclo para alertar (1-30)
    - `target_achieved_enabled`: Ativar/desativar alertas de meta atingida
    - `email_notifications`: Receber notificações por email
    - `push_notifications`: Receber notificações push
    """
    
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="Usuário não possui empresa associada")
    
    service = NotificationService(supabase_admin)
    
    # Converte para dict
    update_data = settings_update.model_dump(exclude_unset=True)
    
    try:
        updated_settings = await service.update_settings(
            current_user.id, 
            str(current_user.company_id), 
            update_data
        )
        return updated_settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar configurações: {str(e)}")


@router.post("/generate-alerts")
async def generate_automatic_alerts(
    background_tasks: BackgroundTasks,
    current_user: UserProfile = Depends(get_current_user),
    supabase_admin = Depends(get_supabase_admin)
):
    """
    Gera alertas automáticos para a empresa (endpoint para testes/admin).
    
    **Tipos de alertas gerados:**
    - Check-ins pendentes (Key Results sem atualização)
    - Objetivos atrasados (progresso abaixo do esperado)
    - Fim de ciclo (aproximação do término)
    - Metas atingidas (100% de progresso)
    
    **Nota:** Esta funcionalidade normalmente roda automaticamente via cron job.
    """
    
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="Usuário não possui empresa associada")
    
    # Apenas owners e admins podem gerar alertas manualmente
    if current_user.role not in ["OWNER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas owners e admins podem gerar alertas")
    
    async def process_alerts():
        """Processa alertas em background"""
        try:
            service = NotificationService(supabase_admin)
            alerts = await service.generate_automatic_alerts(str(current_user.company_id))
            
            # Cria notificações para cada alerta
            created_count = 0
            for alert in alerts:
                for user_id in alert.user_ids:
                    await service.create_notification(
                        user_id=user_id,
                        company_id=str(current_user.company_id),
                        notification_type=alert.type,
                        title=alert.title,
                        message=alert.message,
                        data=alert.data,
                        priority=alert.priority
                    )
                    created_count += 1
            
            print(f"[ALERTS] Gerados {created_count} alertas para empresa {current_user.company_id}")
            
        except Exception as e:
            print(f"[ALERTS] Erro ao gerar alertas: {str(e)}")
    
    # Executa em background
    background_tasks.add_task(process_alerts)
    
    return {
        "message": "Geração de alertas automáticos iniciada",
        "status": "processing",
        "company_id": str(current_user.company_id)
    }


@router.get("/health")
async def health_check():
    """
    Health check específico do módulo de Notificações.
    
    **Funcionalidades disponíveis:**
    - Sistema de notificações
    - Alertas automáticos
    - Configurações personalizáveis
    - Estatísticas detalhadas
    """
    
    return {
        "status": "healthy",
        "module": "Notifications",
        "sprint": "Sprint 9",
        "features": [
            "Sistema de notificações por usuário",
            "Alertas automáticos de check-in pendente",
            "Alertas automáticos de objetivo atrasado",
            "Alertas automáticos de fim de ciclo",
            "Alertas automáticos de meta atingida",
            "Configurações personalizáveis por usuário",
            "Filtros e paginação de notificações",
            "Estatísticas detalhadas",
            "Marcação como lida (individual e em lote)",
            "Níveis de prioridade (baixa, média, alta)",
            "Expiração automática de notificações",
            "Isolamento por empresa (Row Level Security)"
        ],
        "endpoints": [
            "GET /api/notifications/",
            "POST /api/notifications/mark-read",
            "GET /api/notifications/stats",
            "GET /api/notifications/settings",
            "PUT /api/notifications/settings",
            "POST /api/notifications/generate-alerts"
        ],
        "notification_types": [
            "CHECKIN_PENDING - KR sem check-in há X dias",
            "OBJECTIVE_BEHIND - Objetivo com progresso abaixo do esperado",
            "CYCLE_ENDING - Fim de ciclo se aproximando",
            "TARGET_ACHIEVED - Meta atingida (100%)"
        ]
    } 
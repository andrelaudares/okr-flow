from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from supabase import Client

from ..models.notification import (
    NotificationType, NotificationPriority, NotificationAlert, AlertContext,
    NotificationFilter, Notification, NotificationSettings
)


class NotificationService:
    def __init__(self, supabase_admin: Client):
        self.supabase = supabase_admin

    async def generate_automatic_alerts(self, company_id: str) -> List[NotificationAlert]:
        """Gera alertas automáticos para uma empresa"""
        alerts = []
        
        # Busca configurações da empresa
        company_settings = await self._get_company_settings(company_id)
        
        # Gera diferentes tipos de alertas
        alerts.extend(await self._generate_checkin_pending_alerts(company_id, company_settings))
        alerts.extend(await self._generate_objective_behind_alerts(company_id, company_settings))
        alerts.extend(await self._generate_cycle_ending_alerts(company_id, company_settings))
        alerts.extend(await self._generate_target_achieved_alerts(company_id, company_settings))
        
        return alerts

    async def create_notification(
        self, 
        user_id: str, 
        company_id: str, 
        notification_type: NotificationType,
        title: str,
        message: str,
        data: Dict[str, Any] = None,
        priority: NotificationPriority = NotificationPriority.MEDIUM
    ) -> str:
        """Cria uma nova notificação"""
        
        notification_data = {
            "user_id": user_id,
            "company_id": company_id,
            "type": notification_type.value,
            "title": title,
            "message": message,
            "data": data or {},
            "priority": priority.value,
            "is_read": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        response = self.supabase.table("notifications").insert(notification_data).execute()
        return response.data[0]["id"]

    async def get_notifications(
        self, 
        user_id: str, 
        company_id: str, 
        filters: NotificationFilter
    ) -> tuple[List[Notification], int, int]:
        """Busca notificações do usuário com filtros"""
        
        query = self.supabase.table("notifications").select("*").eq("user_id", user_id).eq("company_id", company_id)
        
        # Aplica filtros
        if filters.type:
            query = query.in_("type", [t.value for t in filters.type])
        
        if filters.is_read is not None:
            query = query.eq("is_read", filters.is_read)
        
        if filters.priority:
            query = query.in_("priority", [p.value for p in filters.priority])
        
        if filters.start_date:
            query = query.gte("created_at", filters.start_date.isoformat())
        
        if filters.end_date:
            query = query.lte("created_at", filters.end_date.isoformat())
        
        # Ordenação e paginação
        query = query.order("created_at", desc=True).range(filters.offset, filters.offset + filters.limit - 1)
        
        response = query.execute()
        notifications = [Notification(**item) for item in response.data]
        
        # Conta total e não lidas
        total_response = self.supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("company_id", company_id).execute()
        total = total_response.count
        
        unread_response = self.supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("company_id", company_id).eq("is_read", False).execute()
        unread_count = unread_response.count
        
        return notifications, total, unread_count

    async def mark_as_read(self, notification_ids: List[str], user_id: str) -> int:
        """Marca notificações como lidas"""
        
        response = self.supabase.table("notifications").update({
            "is_read": True,
            "updated_at": datetime.now().isoformat()
        }).in_("id", notification_ids).eq("user_id", user_id).execute()
        
        return len(response.data)

    async def get_settings(self, user_id: str, company_id: str) -> Optional[NotificationSettings]:
        """Busca configurações de notificação do usuário"""
        
        response = self.supabase.table("notification_settings").select("*").eq("user_id", user_id).execute()
        
        if response.data:
            return NotificationSettings(**response.data[0])
        
        # Cria configurações padrão se não existir
        await self._create_default_settings(user_id, company_id)
        
        # Busca novamente após criar
        response = self.supabase.table("notification_settings").select("*").eq("user_id", user_id).execute()
        if response.data:
            return NotificationSettings(**response.data[0])
        
        return None

    async def update_settings(
        self, 
        user_id: str, 
        company_id: str, 
        settings_data: Dict[str, Any]
    ) -> NotificationSettings:
        """Atualiza configurações de notificação"""
        
        settings_data["updated_at"] = datetime.now().isoformat()
        
        response = self.supabase.table("notification_settings").update(settings_data).eq("user_id", user_id).execute()
        
        return NotificationSettings(**response.data[0])

    async def get_notification_stats(self, user_id: str, company_id: str) -> Dict[str, Any]:
        """Retorna estatísticas de notificações do usuário"""
        
        # Total de notificações
        total_response = self.supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("company_id", company_id).execute()
        total = total_response.count
        
        # Não lidas
        unread_response = self.supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("company_id", company_id).eq("is_read", False).execute()
        unread = unread_response.count
        
        # Por tipo
        by_type = {}
        for notification_type in NotificationType:
            type_response = self.supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("company_id", company_id).eq("type", notification_type.value).execute()
            by_type[notification_type.value] = type_response.count
        
        # Por prioridade
        by_priority = {}
        for priority in NotificationPriority:
            priority_response = self.supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("company_id", company_id).eq("priority", priority.value).execute()
            by_priority[str(priority.value)] = priority_response.count
        
        # Últimas 24h
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        recent_response = self.supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("company_id", company_id).gte("created_at", yesterday).execute()
        recent_count = recent_response.count
        
        return {
            "total": total,
            "unread": unread,
            "by_type": by_type,
            "by_priority": by_priority,
            "recent_count": recent_count
        }

    # Métodos privados para geração de alertas
    async def _get_company_settings(self, company_id: str) -> Dict[str, Any]:
        """Busca configurações consolidadas da empresa"""
        
        response = self.supabase.table("notification_settings").select("*").eq("company_id", company_id).execute()
        
        # Consolida configurações (média/moda dos valores)
        if not response.data:
            return self._get_default_settings()
        
        settings_list = response.data
        
        return {
            "checkin_pending_enabled": any(s.get("checkin_pending_enabled", True) for s in settings_list),
            "checkin_pending_days": int(sum(s.get("checkin_pending_days", 3) for s in settings_list) / len(settings_list)),
            "objective_behind_enabled": any(s.get("objective_behind_enabled", True) for s in settings_list),
            "objective_behind_threshold": int(sum(s.get("objective_behind_threshold", 20) for s in settings_list) / len(settings_list)),
            "cycle_ending_enabled": any(s.get("cycle_ending_enabled", True) for s in settings_list),
            "cycle_ending_days": int(sum(s.get("cycle_ending_days", 7) for s in settings_list) / len(settings_list)),
            "target_achieved_enabled": any(s.get("target_achieved_enabled", True) for s in settings_list)
        }

    async def _generate_checkin_pending_alerts(self, company_id: str, settings: Dict[str, Any]) -> List[NotificationAlert]:
        """Gera alertas de check-in pendente"""
        alerts = []
        
        if not settings.get("checkin_pending_enabled", True):
            return alerts
        
        days_threshold = settings.get("checkin_pending_days", 3)
        cutoff_date = (datetime.now() - timedelta(days=days_threshold)).isoformat()
        
        # Busca Key Results sem check-in há X dias
        query = """
        SELECT kr.id, kr.title, kr.objective_id, obj.title as objective_title, obj.owner_id, u.name as owner_name
        FROM key_results kr
        JOIN objectives obj ON kr.objective_id = obj.id
        JOIN users u ON obj.owner_id = u.id
        WHERE obj.company_id = %s
        AND kr.id NOT IN (
            SELECT DISTINCT key_result_id 
            FROM kr_checkins 
            WHERE created_at > %s
        )
        AND obj.status != 'COMPLETED'
        """
        
        # Simulação da query (adaptar para Supabase)
        kr_response = self.supabase.table("key_results").select("id, title, objective_id, objectives!inner(title, owner_id, company_id, status, users!inner(name))").eq("objectives.company_id", company_id).neq("objectives.status", "COMPLETED").execute()
        
        for kr in kr_response.data:
            # Verifica se tem check-in recente
            checkin_response = self.supabase.table("kr_checkins").select("id").eq("key_result_id", kr["id"]).gte("created_at", cutoff_date).execute()
            
            if not checkin_response.data:
                alerts.append(NotificationAlert(
                    type=NotificationType.CHECKIN_PENDING,
                    title=f"Check-in pendente: {kr['title'][:50]}...",
                    message=f"O Key Result '{kr['title']}' não recebe atualização há {days_threshold} dias. Faça um check-in para manter o progresso atualizado.",
                    user_ids=[kr["objectives"]["owner_id"]],
                    data={
                        "key_result_id": kr["id"],
                        "objective_id": kr["objective_id"],
                        "days_without_checkin": days_threshold
                    },
                    priority=NotificationPriority.MEDIUM
                ))
        
        return alerts

    async def _generate_objective_behind_alerts(self, company_id: str, settings: Dict[str, Any]) -> List[NotificationAlert]:
        """Gera alertas de objetivo atrasado"""
        alerts = []
        
        if not settings.get("objective_behind_enabled", True):
            return alerts
        
        threshold = settings.get("objective_behind_threshold", 20)
        
        # Busca objetivos com progresso abaixo do esperado
        objectives_response = self.supabase.table("objectives").select("id, title, progress, owner_id, cycle_id, cycles!inner(start_date, end_date), users!inner(name)").eq("company_id", company_id).neq("status", "COMPLETED").execute()
        
        for obj in objectives_response.data:
            if obj.get("cycles"):
                cycle = obj["cycles"]
                start_date = datetime.fromisoformat(cycle["start_date"])
                end_date = datetime.fromisoformat(cycle["end_date"])
                now = datetime.now()
                
                # Calcula progresso esperado
                total_days = (end_date - start_date).days
                elapsed_days = (now - start_date).days
                expected_progress = (elapsed_days / total_days) * 100 if total_days > 0 else 0
                
                actual_progress = obj.get("progress", 0)
                
                if expected_progress - actual_progress > threshold:
                    alerts.append(NotificationAlert(
                        type=NotificationType.OBJECTIVE_BEHIND,
                        title=f"Objetivo atrasado: {obj['title'][:50]}...",
                        message=f"O objetivo '{obj['title']}' está {expected_progress - actual_progress:.1f}% abaixo do progresso esperado para este período.",
                        user_ids=[obj["owner_id"]],
                        data={
                            "objective_id": obj["id"],
                            "actual_progress": actual_progress,
                            "expected_progress": expected_progress,
                            "gap": expected_progress - actual_progress
                        },
                        priority=NotificationPriority.HIGH
                    ))
        
        return alerts

    async def _generate_cycle_ending_alerts(self, company_id: str, settings: Dict[str, Any]) -> List[NotificationAlert]:
        """Gera alertas de fim de ciclo"""
        alerts = []
        
        if not settings.get("cycle_ending_enabled", True):
            return alerts
        
        days_threshold = settings.get("cycle_ending_days", 7)
        
        # Busca ciclo ativo
        cycle_response = self.supabase.table("cycles").select("id, name, end_date").eq("company_id", company_id).eq("is_active", True).execute()
        
        if cycle_response.data:
            cycle = cycle_response.data[0]
            end_date = datetime.fromisoformat(cycle["end_date"])
            days_remaining = (end_date - datetime.now()).days
            
            if 0 < days_remaining <= days_threshold:
                # Busca todos os usuários da empresa
                users_response = self.supabase.table("users").select("id").eq("company_id", company_id).eq("is_active", True).execute()
                user_ids = [u["id"] for u in users_response.data]
                
                alerts.append(NotificationAlert(
                    type=NotificationType.CYCLE_ENDING,
                    title=f"Ciclo '{cycle['name']}' termina em {days_remaining} dias",
                    message=f"O ciclo '{cycle['name']}' está próximo do fim. Finalize suas atividades e objetivos para garantir o melhor resultado.",
                    user_ids=user_ids,
                    data={
                        "cycle_id": cycle["id"],
                        "days_remaining": days_remaining,
                        "end_date": cycle["end_date"]
                    },
                    priority=NotificationPriority.HIGH
                ))
        
        return alerts

    async def _generate_target_achieved_alerts(self, company_id: str, settings: Dict[str, Any]) -> List[NotificationAlert]:
        """Gera alertas de meta atingida"""
        alerts = []
        
        if not settings.get("target_achieved_enabled", True):
            return alerts
        
        # Busca Key Results 100% concluídos nas últimas 24h
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        
        kr_response = self.supabase.table("key_results").select("id, title, objective_id, owner_id, objectives!inner(title, users!inner(name))").eq("objectives.company_id", company_id).eq("progress", 100).gte("updated_at", yesterday).execute()
        
        for kr in kr_response.data:
            alerts.append(NotificationAlert(
                type=NotificationType.TARGET_ACHIEVED,
                title=f"🎉 Meta atingida: {kr['title'][:50]}...",
                message=f"Parabéns! O Key Result '{kr['title']}' foi concluído com 100% de progresso!",
                user_ids=[kr["owner_id"]],
                data={
                    "key_result_id": kr["id"],
                    "objective_id": kr["objective_id"],
                    "achievement_date": datetime.now().isoformat()
                },
                priority=NotificationPriority.LOW
            ))
        
        # Busca objetivos 100% concluídos nas últimas 24h
        obj_response = self.supabase.table("objectives").select("id, title, owner_id, users!inner(name)").eq("company_id", company_id).eq("progress", 100).gte("updated_at", yesterday).execute()
        
        for obj in obj_response.data:
            alerts.append(NotificationAlert(
                type=NotificationType.TARGET_ACHIEVED,
                title=f"🎯 Objetivo concluído: {obj['title'][:50]}...",
                message=f"Excelente trabalho! O objetivo '{obj['title']}' foi completamente realizado!",
                user_ids=[obj["owner_id"]],
                data={
                    "objective_id": obj["id"],
                    "achievement_date": datetime.now().isoformat()
                },
                priority=NotificationPriority.LOW
            ))
        
        return alerts

    async def _create_default_settings(self, user_id: str, company_id: str) -> str:
        """Cria configurações padrão para um usuário"""
        
        settings_data = {
            "user_id": user_id,
            "company_id": company_id,
            **self._get_default_settings(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        response = self.supabase.table("notification_settings").insert(settings_data).execute()
        return response.data[0]["id"]

    def _get_default_settings(self) -> Dict[str, Any]:
        """Retorna configurações padrão"""
        return {
            "checkin_pending_enabled": True,
            "checkin_pending_days": 3,
            "objective_behind_enabled": True,
            "objective_behind_threshold": 20,
            "cycle_ending_enabled": True,
            "cycle_ending_days": 7,
            "target_achieved_enabled": True,
            "email_notifications": True,
            "push_notifications": True
        } 
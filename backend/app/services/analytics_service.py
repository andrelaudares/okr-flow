from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Tuple
import statistics
from supabase import Client

from ..models.analytics import (
    TrendDirection, PeriodGranularity, EvolutionPoint, TrendAnalysis,
    PerformanceSummary, HistoryData, ObjectiveHistoryPoint, ObjectiveHistory,
    TrendMetrics, TrendsAnalysis, PerformanceMetric, CyclePerformance,
    PerformanceAnalysis, AnalyticsFilter
)


class AnalyticsService:
    def __init__(self, supabase_admin: Client):
        self.supabase = supabase_admin

    async def get_company_history(self, company_id: str, filters: AnalyticsFilter) -> HistoryData:
        """Gera dados históricos gerais da empresa"""
        
        # Define período se não especificado
        end_date = filters.end_date or date.today()
        start_date = filters.start_date or (end_date - timedelta(days=90))  # 3 meses padrão
        
        # Busca dados da empresa
        company_data = await self._get_company_data(company_id)
        
        # Busca ciclo ativo
        active_cycle = await self._get_active_cycle(company_id)
        
        # Gera pontos de evolução baseado na granularidade
        evolution_points = await self._generate_evolution_points(
            company_id, start_date, end_date, filters.granularity
        )
        
        # Calcula análise de tendência
        trend_analysis = self._calculate_trend_analysis(evolution_points)
        
        # Calcula resumo de performance
        performance_summary = await self._calculate_performance_summary(
            company_id, start_date, end_date
        )
        
        # Busca métricas do período
        period_metrics = await self._get_period_metrics(company_id, start_date, end_date)
        
        return HistoryData(
            company_id=company_id,
            company_name=company_data['name'],
            period_start=start_date,
            period_end=end_date,
            current_date=date.today(),
            active_cycle_name=active_cycle['name'] if active_cycle else None,
            evolution_points=evolution_points,
            granularity=filters.granularity,
            trend_analysis=trend_analysis,
            performance_summary=performance_summary,
            total_objectives_period=period_metrics['objectives'],
            total_key_results_period=period_metrics['key_results'],
            total_checkins_period=period_metrics['checkins']
        )

    async def get_objective_history(self, objective_id: str, company_id: str, filters: AnalyticsFilter) -> ObjectiveHistory:
        """Gera histórico específico de um objetivo"""
        
        # Verifica se objetivo pertence à empresa
        objective_data = await self._get_objective_data(objective_id, company_id)
        if not objective_data:
            raise ValueError("Objetivo não encontrado ou não pertence à empresa")
        
        # Define período baseado no ciclo do objetivo ou filtros
        end_date = filters.end_date or date.today()
        start_date = filters.start_date or objective_data['created_at'].date()
        
        # Gera pontos históricos do objetivo
        history_points = await self._generate_objective_history_points(
            objective_id, start_date, end_date
        )
        
        # Calcula métricas do objetivo
        initial_progress = history_points[0].progress if history_points else 0.0
        current_progress = objective_data['progress'] or 0.0
        total_growth = current_progress - initial_progress
        
        # Calcula crescimento médio semanal
        weeks = max(1, (end_date - start_date).days / 7)
        average_weekly_growth = total_growth / weeks if weeks > 0 else 0.0
        
        # Busca resumo dos Key Results
        key_results_summary = await self._get_key_results_summary(objective_id)
        
        return ObjectiveHistory(
            objective_id=objective_id,
            objective_title=objective_data['title'],
            objective_status=objective_data['status'],
            owner_name=objective_data['owner_name'],
            cycle_name=objective_data['cycle_name'],
            period_start=start_date,
            period_end=end_date,
            history_points=history_points,
            initial_progress=initial_progress,
            current_progress=current_progress,
            total_growth=total_growth,
            average_weekly_growth=average_weekly_growth,
            key_results_summary=key_results_summary
        )

    async def get_trends_analysis(self, company_id: str, filters: AnalyticsFilter) -> TrendsAnalysis:
        """Gera análise de tendências da empresa"""
        
        # Define períodos para comparação
        end_date = filters.end_date or date.today()
        start_date = filters.start_date or (end_date - timedelta(days=28))  # 4 semanas padrão
        
        # Período anterior para comparação
        previous_start = start_date - (end_date - start_date)
        previous_end = start_date
        
        # Calcula métricas atuais e anteriores
        current_metrics = await self._get_period_analytics_metrics(company_id, start_date, end_date)
        previous_metrics = await self._get_period_analytics_metrics(company_id, previous_start, previous_end)
        
        # Gera tendências para cada métrica
        trends = {
            'objectives': self._calculate_trend_metric("Objetivos Ativos", current_metrics['objectives'], previous_metrics['objectives']),
            'progress': self._calculate_trend_metric("Progresso Médio", current_metrics['avg_progress'], previous_metrics['avg_progress']),
            'completion': self._calculate_trend_metric("Taxa de Conclusão", current_metrics['completion_rate'], previous_metrics['completion_rate']),
            'engagement': self._calculate_trend_metric("Engajamento", current_metrics['engagement_score'], previous_metrics['engagement_score']),
            'key_results': self._calculate_trend_metric("Key Results Ativos", current_metrics['key_results'], previous_metrics['key_results'])
        }
        
        # Gera insights automáticos
        insights = self._generate_insights(trends, current_metrics)
        recommendations = self._generate_recommendations(trends, current_metrics)
        
        # Calcula score geral de saúde
        health_score = self._calculate_health_score(current_metrics, trends)
        improvement_areas = self._identify_improvement_areas(trends)
        
        period_analyzed = f"Últimas {(end_date - start_date).days} dias"
        
        return TrendsAnalysis(
            analysis_date=datetime.now(),
            company_id=company_id,
            period_analyzed=period_analyzed,
            objectives_trend=trends['objectives'],
            progress_trend=trends['progress'],
            completion_trend=trends['completion'],
            engagement_trend=trends['engagement'],
            key_results_trend=trends['key_results'],
            insights=insights,
            recommendations=recommendations,
            overall_health_score=health_score,
            improvement_areas=improvement_areas
        )

    async def get_performance_analysis(self, company_id: str, filters: AnalyticsFilter) -> PerformanceAnalysis:
        """Gera análise detalhada de performance"""
        
        # Busca dados da empresa
        company_data = await self._get_company_data(company_id)
        
        # Busca ciclo ativo
        active_cycle = await self._get_active_cycle(company_id)
        if not active_cycle:
            raise ValueError("Empresa não possui ciclo ativo")
        
        # Calcula performance do ciclo atual
        current_cycle_performance = await self._calculate_cycle_performance(active_cycle, company_id)
        
        # Gera métricas detalhadas
        metrics = await self._generate_performance_metrics(company_id, active_cycle)
        
        # Gera resumo executivo
        executive_summary = self._generate_executive_summary(current_cycle_performance, metrics)
        
        # Gera alertas e itens de ação
        alerts = self._generate_performance_alerts(metrics, current_cycle_performance)
        action_items = self._generate_action_items(metrics, current_cycle_performance)
        
        # Comparações temporais (se aplicável)
        month_over_month = await self._calculate_month_over_month(company_id)
        quarter_over_quarter = await self._calculate_quarter_over_quarter(company_id)
        
        return PerformanceAnalysis(
            analysis_date=datetime.now(),
            company_id=company_id,
            company_name=company_data['name'],
            current_cycle=current_cycle_performance,
            metrics=metrics,
            executive_summary=executive_summary,
            alerts=alerts,
            action_items=action_items,
            month_over_month=month_over_month,
            quarter_over_quarter=quarter_over_quarter
        )

    # Métodos auxiliares privados
    async def _get_company_data(self, company_id: str) -> dict:
        """Busca dados da empresa"""
        try:
            response = self.supabase.table("companies").select("*").eq("id", company_id).single().execute()
            return response.data if response.data else {'id': company_id, 'name': 'Empresa Padrão'}
        except Exception:
            return {'id': company_id, 'name': 'Empresa Padrão'}

    async def _get_active_cycle(self, company_id: str) -> Optional[dict]:
        """Busca ciclo ativo da empresa"""
        try:
            response = self.supabase.table("cycles").select("*").eq("company_id", company_id).eq("is_active", True).execute()
            return response.data[0] if response.data else None
        except Exception:
            return None

    async def _generate_evolution_points(self, company_id: str, start_date: date, end_date: date, granularity: PeriodGranularity) -> List[EvolutionPoint]:
        """Gera pontos de evolução temporal"""
        points = []
        current_date = start_date
        
        # Define intervalo baseado na granularidade
        if granularity == PeriodGranularity.DAILY:
            delta = timedelta(days=1)
        elif granularity == PeriodGranularity.WEEKLY:
            delta = timedelta(days=7)
        else:  # MONTHLY
            delta = timedelta(days=30)
        
        while current_date <= end_date:
            # Busca dados do dia específico
            daily_data = await self._get_daily_snapshot(company_id, current_date)
            
            # Calcula progresso esperado baseado no tempo
            cycle = await self._get_active_cycle(company_id)
            expected_progress = 0.0
            if cycle:
                cycle_start = datetime.fromisoformat(cycle['start_date']).date()
                cycle_end = datetime.fromisoformat(cycle['end_date']).date()
                if cycle_start <= current_date <= cycle_end:
                    days_total = (cycle_end - cycle_start).days
                    days_elapsed = (current_date - cycle_start).days
                    expected_progress = (days_elapsed / days_total) * 100 if days_total > 0 else 0
            
            point = EvolutionPoint(
                date=current_date.isoformat(),
                actual_progress=daily_data['avg_progress'],
                expected_progress=expected_progress,
                objectives_count=daily_data['objectives_count'],
                completed_objectives=daily_data['completed_objectives'],
                active_key_results=daily_data['key_results_count']
            )
            points.append(point)
            
            current_date += delta
        
        return points

    async def _get_daily_snapshot(self, company_id: str, target_date: date) -> dict:
        """Busca snapshot dos dados de um dia específico"""
        
        # Busca objetivos até a data
        objectives_query = self.supabase.table("objectives").select("id, progress, status").eq("company_id", company_id).lte("created_at", target_date.isoformat()).execute()
        objectives = objectives_query.data
        
        # Calcula métricas
        total_objectives = len(objectives)
        completed_objectives = len([obj for obj in objectives if obj.get('status') == 'COMPLETED'])
        avg_progress = statistics.mean([obj.get('progress', 0) for obj in objectives]) if objectives else 0.0
        
        # Busca Key Results
        key_results_query = self.supabase.table("key_results").select("id").in_("objective_id", [obj['id'] for obj in objectives]).execute()
        key_results_count = len(key_results_query.data)
        
        return {
            'objectives_count': total_objectives,
            'completed_objectives': completed_objectives,
            'avg_progress': avg_progress,
            'key_results_count': key_results_count
        }

    def _calculate_trend_analysis(self, evolution_points: List[EvolutionPoint]) -> TrendAnalysis:
        """Calcula análise de tendências baseada nos pontos de evolução"""
        if len(evolution_points) < 2:
            return TrendAnalysis(
                direction=TrendDirection.STABLE,
                average_weekly_growth=0.0,
                consistency_score=0.0,
                prediction_next_week=0.0,
                volatility_index=0.0
            )
        
        # Calcula crescimento médio
        progress_values = [point.actual_progress for point in evolution_points]
        first_value = progress_values[0]
        last_value = progress_values[-1]
        total_growth = last_value - first_value
        
        # Determina direção da tendência
        if total_growth >= 2.5:
            direction = TrendDirection.UP
        elif total_growth <= -2.5:
            direction = TrendDirection.DOWN
        else:
            direction = TrendDirection.STABLE
        
        # Calcula crescimento semanal médio
        weeks = len(evolution_points) - 1
        average_weekly_growth = total_growth / weeks if weeks > 0 else 0.0
        
        # Calcula consistência (baixa variabilidade = alta consistência)
        if len(progress_values) > 1:
            variance = statistics.variance(progress_values)
            consistency_score = max(0, 100 - variance)
        else:
            consistency_score = 100.0
        
        # Previsão para próxima semana
        prediction_next_week = last_value + average_weekly_growth
        prediction_next_week = max(0, min(100, prediction_next_week))
        
        # Índice de volatilidade
        volatility_index = statistics.stdev(progress_values) if len(progress_values) > 1 else 0.0
        
        return TrendAnalysis(
            direction=direction,
            average_weekly_growth=average_weekly_growth,
            consistency_score=consistency_score,
            prediction_next_week=prediction_next_week,
            volatility_index=volatility_index
        )

    async def _calculate_performance_summary(self, company_id: str, start_date: date, end_date: date) -> PerformanceSummary:
        """Calcula resumo de performance do período"""
        
        # Busca métricas do período
        metrics = await self._get_period_analytics_metrics(company_id, start_date, end_date)
        
        # Calcula scores baseados nas métricas
        overall_score = min(100, metrics['avg_progress'] * 1.2)  # Ajuste baseado no progresso
        time_efficiency = metrics['time_efficiency']
        goal_achievement = metrics['completion_rate']
        team_engagement = metrics['engagement_score']
        completion_rate = metrics['completion_rate']
        
        return PerformanceSummary(
            overall_score=overall_score,
            time_efficiency=time_efficiency,
            goal_achievement=goal_achievement,
            team_engagement=team_engagement,
            completion_rate=completion_rate
        )

    async def _get_period_metrics(self, company_id: str, start_date: date, end_date: date) -> dict:
        """Busca métricas básicas do período"""
        
        # Objetivos no período
        objectives_query = self.supabase.table("objectives").select("id").eq("company_id", company_id).gte("created_at", start_date.isoformat()).lte("created_at", end_date.isoformat()).execute()
        
        # Key Results no período
        key_results_query = self.supabase.table("key_results").select("id, objective_id").execute()
        # Filtra pelos objetivos da empresa
        objective_ids = [obj['id'] for obj in objectives_query.data]
        key_results = [kr for kr in key_results_query.data if kr['objective_id'] in objective_ids]
        
        # Check-ins no período
        checkins_query = self.supabase.table("kr_checkins").select("id").gte("created_at", start_date.isoformat()).lte("created_at", end_date.isoformat()).execute()
        
        return {
            'objectives': len(objectives_query.data),
            'key_results': len(key_results),
            'checkins': len(checkins_query.data)
        }

    async def _get_objective_data(self, objective_id: str, company_id: str) -> Optional[dict]:
        """Busca dados completos de um objetivo"""
        try:
            response = self.supabase.table("objectives").select("*, users!owner_id(name), cycles!cycle_id(name)").eq("id", objective_id).eq("company_id", company_id).single().execute()
            
            if response.data:
                data = response.data
                return {
                    'id': data['id'],
                    'title': data['title'],
                    'status': data['status'],
                    'progress': data['progress'],
                    'created_at': datetime.fromisoformat(data['created_at']),
                    'owner_name': data['users']['name'] if data['users'] else None,
                    'cycle_name': data['cycles']['name'] if data['cycles'] else 'Sem ciclo'
                }
        except Exception:
            pass
        return None

    async def _generate_objective_history_points(self, objective_id: str, start_date: date, end_date: date) -> List[ObjectiveHistoryPoint]:
        """Gera pontos históricos de um objetivo específico"""
        points = []
        current_date = start_date
        
        while current_date <= end_date:
            # Busca Key Results até esta data
            kr_query = self.supabase.table("key_results").select("id, progress").eq("objective_id", objective_id).lte("created_at", current_date.isoformat()).execute()
            key_results = kr_query.data
            
            # Busca check-ins até esta data para os Key Results encontrados
            checkins_count = 0
            if key_results:
                kr_ids = [kr['id'] for kr in key_results]
                try:
                    checkins_query = self.supabase.table("kr_checkins").select("id").in_("key_result_id", kr_ids).lte("created_at", current_date.isoformat()).execute()
                    checkins_count = len(checkins_query.data)
                except Exception:
                    checkins_count = 0
            
            # Calcula progresso médio dos Key Results
            progress = statistics.mean([kr.get('progress', 0) for kr in key_results]) if key_results else 0.0
            
            point = ObjectiveHistoryPoint(
                date=current_date.isoformat(),
                progress=progress,
                key_results_count=len(key_results),
                checkins_count=checkins_count,
                notes=None  # Pode ser expandido para incluir notas
            )
            points.append(point)
            
            current_date += timedelta(days=7)  # Pontos semanais
        
        return points

    async def _get_key_results_summary(self, objective_id: str) -> List[dict]:
        """Busca resumo dos Key Results de um objetivo"""
        response = self.supabase.table("key_results").select("id, title, progress, status, target_value, current_value, unit").eq("objective_id", objective_id).execute()
        
        return [
            {
                'id': kr['id'],
                'title': kr['title'],
                'progress': kr['progress'],
                'status': kr['status'],
                'target_value': kr['target_value'],
                'current_value': kr['current_value'],
                'unit': kr['unit']
            }
            for kr in response.data
        ]

    async def _get_period_analytics_metrics(self, company_id: str, start_date: date, end_date: date) -> dict:
        """Calcula métricas analíticas para um período"""
        
        # Busca objetivos do período
        objectives_query = self.supabase.table("objectives").select("id, progress, status").eq("company_id", company_id).gte("created_at", start_date.isoformat()).lte("created_at", end_date.isoformat()).execute()
        objectives = objectives_query.data
        
        if not objectives:
            return {
                'objectives': 0,
                'avg_progress': 0.0,
                'completion_rate': 0.0,
                'engagement_score': 0.0,
                'time_efficiency': 0.0,
                'key_results': 0
            }
        
        # Calcula métricas básicas
        total_objectives = len(objectives)
        completed = len([obj for obj in objectives if obj.get('status') == 'COMPLETED'])
        avg_progress = statistics.mean([obj.get('progress', 0) for obj in objectives])
        completion_rate = (completed / total_objectives) * 100 if total_objectives > 0 else 0
        
        # Key Results
        objective_ids = [obj['id'] for obj in objectives]
        kr_query = self.supabase.table("key_results").select("id").in_("objective_id", objective_ids).execute()
        key_results_count = len(kr_query.data)
        
        # Calcula engagement (baseado em check-ins)
        checkins_query = self.supabase.table("kr_checkins").select("id").in_("key_result_id", [kr['id'] for kr in kr_query.data]).gte("created_at", start_date.isoformat()).lte("created_at", end_date.isoformat()).execute()
        checkins_count = len(checkins_query.data)
        engagement_score = min(100, (checkins_count / max(1, key_results_count)) * 20)  # Normaliza para 0-100
        
        # Eficiência temporal (baseada no progresso vs tempo transcorrido)
        cycle = await self._get_active_cycle(company_id)
        time_efficiency = 75.0  # Valor padrão
        if cycle:
            cycle_start = datetime.fromisoformat(cycle['start_date']).date()
            cycle_end = datetime.fromisoformat(cycle['end_date']).date()
            cycle_total_days = (cycle_end - cycle_start).days
            elapsed_days = (end_date - cycle_start).days
            expected_progress = (elapsed_days / cycle_total_days) * 100 if cycle_total_days > 0 else 0
            
            if expected_progress > 0:
                time_efficiency = min(100, (avg_progress / expected_progress) * 100)
        
        return {
            'objectives': total_objectives,
            'avg_progress': avg_progress,
            'completion_rate': completion_rate,
            'engagement_score': engagement_score,
            'time_efficiency': time_efficiency,
            'key_results': key_results_count
        }

    def _calculate_trend_metric(self, name: str, current: float, previous: float) -> TrendMetrics:
        """Calcula métrica de tendência individual"""
        change = current - previous
        change_percentage = (change / previous) * 100 if previous != 0 else 0
        
        if change_percentage >= 5:
            direction = TrendDirection.UP
        elif change_percentage <= -5:
            direction = TrendDirection.DOWN
        else:
            direction = TrendDirection.STABLE
        
        # Define se é tendência positiva baseada no tipo de métrica
        positive_metrics = ["Progresso Médio", "Taxa de Conclusão", "Engajamento"]
        is_positive = direction == TrendDirection.UP if name in positive_metrics else direction == TrendDirection.DOWN
        
        return TrendMetrics(
            metric_name=name,
            current_value=current,
            previous_value=previous,
            change_percentage=change_percentage,
            trend_direction=direction,
            is_positive_trend=is_positive
        )

    def _generate_insights(self, trends: dict, metrics: dict) -> List[str]:
        """Gera insights automáticos baseados nas tendências"""
        insights = []
        
        if trends['progress'].trend_direction == TrendDirection.UP:
            insights.append(f"📈 Progresso da equipe cresceu {trends['progress'].change_percentage:.1f}% no período")
        
        if trends['completion'].trend_direction == TrendDirection.UP:
            insights.append(f"🎯 Taxa de conclusão melhorou {trends['completion'].change_percentage:.1f}%")
        
        if metrics['engagement_score'] > 80:
            insights.append("🔥 Alto engajamento da equipe com atualizações frequentes")
        
        if metrics['time_efficiency'] > 90:
            insights.append("⚡ Equipe está acima do cronograma esperado")
        elif metrics['time_efficiency'] < 70:
            insights.append("⚠️ Equipe está abaixo do cronograma esperado")
        
        return insights

    def _generate_recommendations(self, trends: dict, metrics: dict) -> List[str]:
        """Gera recomendações automáticas"""
        recommendations = []
        
        if trends['engagement'].trend_direction == TrendDirection.DOWN:
            recommendations.append("Considere aumentar a frequência de check-ins para melhorar o engajamento")
        
        if metrics['completion_rate'] < 50:
            recommendations.append("Revise a complexidade dos objetivos - muitos podem estar muito ambiciosos")
        
        if trends['progress'].trend_direction == TrendDirection.DOWN:
            recommendations.append("Agende reuniões de alinhamento para identificar bloqueadores")
        
        if metrics['time_efficiency'] < 60:
            recommendations.append("Considere reavaliar prazos ou alocar mais recursos")
        
        return recommendations

    def _calculate_health_score(self, metrics: dict, trends: dict) -> float:
        """Calcula score geral de saúde da empresa"""
        scores = []
        
        # Score baseado em progresso
        scores.append(min(100, metrics['avg_progress'] * 1.2))
        
        # Score baseado em conclusão
        scores.append(metrics['completion_rate'])
        
        # Score baseado em engajamento
        scores.append(metrics['engagement_score'])
        
        # Score baseado em eficiência
        scores.append(metrics['time_efficiency'])
        
        # Bonus por tendências positivas
        positive_trends = sum(1 for trend in trends.values() if trend.is_positive_trend)
        trend_bonus = (positive_trends / len(trends)) * 10
        
        base_score = statistics.mean(scores)
        return min(100, base_score + trend_bonus)

    def _identify_improvement_areas(self, trends: dict) -> List[str]:
        """Identifica áreas que precisam de melhoria"""
        areas = []
        
        for metric_name, trend in trends.items():
            if trend.trend_direction == TrendDirection.DOWN:
                areas.append(trend.metric_name)
        
        return areas

    async def _calculate_cycle_performance(self, cycle: dict, company_id: str) -> CyclePerformance:
        """Calcula performance do ciclo atual"""
        
        # Calcula progresso temporal do ciclo
        cycle_start = datetime.fromisoformat(cycle['start_date']).date()
        cycle_end = datetime.fromisoformat(cycle['end_date']).date()
        today = date.today()
        
        cycle_total_days = (cycle_end - cycle_start).days
        cycle_elapsed_days = min(cycle_total_days, (today - cycle_start).days)
        cycle_progress = (cycle_elapsed_days / cycle_total_days) * 100 if cycle_total_days > 0 else 0
        
        # Busca objetivos do ciclo
        objectives_query = self.supabase.table("objectives").select("progress").eq("company_id", company_id).eq("cycle_id", cycle['id']).execute()
        objectives = objectives_query.data
        
        # Calcula performance dos objetivos
        objectives_performance = statistics.mean([obj.get('progress', 0) for obj in objectives]) if objectives else 0
        
        # Calcula score de eficiência
        efficiency_score = (objectives_performance / cycle_progress) * 100 if cycle_progress > 0 else 100
        efficiency_score = min(100, efficiency_score)
        
        return CyclePerformance(
            cycle_id=cycle['id'],
            cycle_name=cycle['name'],
            cycle_progress=cycle_progress,
            objectives_performance=objectives_performance,
            efficiency_score=efficiency_score,
            previous_cycle_comparison=None,  # Pode ser implementado posteriormente
            improvement_percentage=None
        )

    async def _generate_performance_metrics(self, company_id: str, cycle: dict) -> List[PerformanceMetric]:
        """Gera métricas detalhadas de performance"""
        metrics = []
        
        # Busca dados para as métricas
        objectives_query = self.supabase.table("objectives").select("*").eq("company_id", company_id).eq("cycle_id", cycle['id']).execute()
        objectives = objectives_query.data
        
        # Métrica: Total de Objetivos
        metrics.append(PerformanceMetric(
            name="Total de Objetivos",
            value=len(objectives),
            unit="unidades",
            benchmark=5.0,
            performance_level="Bom" if len(objectives) >= 3 else "Regular",
            description="Número total de objetivos ativos no ciclo"
        ))
        
        # Métrica: Progresso Médio
        avg_progress = statistics.mean([obj.get('progress', 0) for obj in objectives]) if objectives else 0
        metrics.append(PerformanceMetric(
            name="Progresso Médio",
            value=avg_progress,
            unit="%",
            benchmark=70.0,
            performance_level="Excelente" if avg_progress >= 80 else "Bom" if avg_progress >= 60 else "Regular",
            description="Progresso médio de todos os objetivos"
        ))
        
        # Métrica: Taxa de Conclusão
        completed = len([obj for obj in objectives if obj.get('status') == 'COMPLETED'])
        completion_rate = (completed / len(objectives)) * 100 if objectives else 0
        metrics.append(PerformanceMetric(
            name="Taxa de Conclusão",
            value=completion_rate,
            unit="%",
            benchmark=80.0,
            performance_level="Excelente" if completion_rate >= 80 else "Bom" if completion_rate >= 60 else "Regular",
            description="Percentual de objetivos concluídos"
        ))
        
        return metrics

    def _generate_executive_summary(self, cycle_performance: CyclePerformance, metrics: List[PerformanceMetric]) -> dict:
        """Gera resumo executivo"""
        
        # Extrai valores principais
        avg_progress = next((m.value for m in metrics if m.name == "Progresso Médio"), 0)
        completion_rate = next((m.value for m in metrics if m.name == "Taxa de Conclusão"), 0)
        
        # Determina status geral
        if avg_progress >= 80 and completion_rate >= 60:
            status = "Excelente"
        elif avg_progress >= 60 and completion_rate >= 40:
            status = "Bom"
        else:
            status = "Precisa Atenção"
        
        return {
            "status_geral": status,
            "progresso_medio": f"{avg_progress:.1f}%",
            "taxa_conclusao": f"{completion_rate:.1f}%",
            "eficiencia_temporal": f"{cycle_performance.efficiency_score:.1f}%",
            "resumo": f"A equipe está {status.lower()} com {avg_progress:.1f}% de progresso médio nos objetivos."
        }

    def _generate_performance_alerts(self, metrics: List[PerformanceMetric], cycle_performance: CyclePerformance) -> List[str]:
        """Gera alertas de performance"""
        alerts = []
        
        # Alerta de baixo progresso
        avg_progress = next((m.value for m in metrics if m.name == "Progresso Médio"), 0)
        if avg_progress < 50:
            alerts.append("⚠️ Progresso médio abaixo de 50% - atenção necessária")
        
        # Alerta de eficiência
        if cycle_performance.efficiency_score < 70:
            alerts.append("🐌 Eficiência temporal baixa - equipe pode estar atrasada")
        
        # Alerta de conclusão
        completion_rate = next((m.value for m in metrics if m.name == "Taxa de Conclusão"), 0)
        if completion_rate < 30:
            alerts.append("🎯 Taxa de conclusão baixa - revisar complexidade dos objetivos")
        
        return alerts

    def _generate_action_items(self, metrics: List[PerformanceMetric], cycle_performance: CyclePerformance) -> List[str]:
        """Gera itens de ação"""
        actions = []
        
        # Ações baseadas em progresso
        avg_progress = next((m.value for m in metrics if m.name == "Progresso Médio"), 0)
        if avg_progress < 60:
            actions.append("Agendar reunião de alinhamento para identificar bloqueadores")
        
        # Ações baseadas em eficiência
        if cycle_performance.efficiency_score < 80:
            actions.append("Revisar cronograma e realocar recursos se necessário")
        
        # Ações gerais
        actions.append("Manter atualizações regulares nos Key Results")
        actions.append("Monitorar progresso semanalmente")
        
        return actions

    async def _calculate_month_over_month(self, company_id: str) -> Optional[float]:
        """Calcula comparação mês a mês"""
        # Implementação simplificada - pode ser expandida
        return None

    async def _calculate_quarter_over_quarter(self, company_id: str) -> Optional[float]:
        """Calcula comparação trimestre a trimestre"""
        # Implementação simplificada - pode ser expandida
        return None 
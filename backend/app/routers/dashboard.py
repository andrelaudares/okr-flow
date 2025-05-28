from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, date, timedelta
import calendar

from ..dependencies import get_current_user
from ..models.user import UserProfile
from ..models.cycle import (
    TimeCard, TimeCardType, DashboardPreferences, 
    DashboardPreferencesCreate, DashboardPreferencesUpdate, 
    TimeCardsResponse, CycleStatus
)
from ..models.dashboard import (
    DashboardStats, ProgressData, ObjectivesCount, EvolutionData, EvolutionPoint,
    TrendDirection, StatusColor, TrendAnalysis, PerformanceSummary
)
from ..utils.supabase import supabase_admin

router = APIRouter()

def get_quarter_dates(year: int, quarter: int) -> tuple[date, date]:
    """Retorna as datas de início e fim de um trimestre"""
    quarter_months = {
        1: (1, 3),   # Q1: Jan-Mar
        2: (4, 6),   # Q2: Apr-Jun
        3: (7, 9),   # Q3: Jul-Sep
        4: (10, 12)  # Q4: Oct-Dec
    }
    
    start_month, end_month = quarter_months[quarter]
    start_date = date(year, start_month, 1)
    _, last_day = calendar.monthrange(year, end_month)
    end_date = date(year, end_month, last_day)
    
    return start_date, end_date

def get_semester_dates(year: int, semester: int) -> tuple[date, date]:
    """Retorna as datas de início e fim de um semestre"""
    if semester == 1:  # S1: Jan-Jun
        start_date = date(year, 1, 1)
        end_date = date(year, 6, 30)
    else:  # S2: Jul-Dec
        start_date = date(year, 7, 1)
        end_date = date(year, 12, 31)
    
    return start_date, end_date

def get_quadrimester_dates(year: int, quadrimester: int) -> tuple[date, date]:
    """Retorna as datas de início e fim de um quadrimestre"""
    quadrimester_months = {
        1: (1, 4),   # Q1: Jan-Apr
        2: (5, 8),   # Q2: May-Aug
        3: (9, 12)   # Q3: Sep-Dec
    }
    
    start_month, end_month = quadrimester_months[quadrimester]
    start_date = date(year, start_month, 1)
    _, last_day = calendar.monthrange(year, end_month)
    end_date = date(year, end_month, last_day)
    
    return start_date, end_date

def calculate_time_card(card_type: TimeCardType, today: date = None) -> TimeCard:
    """Calcula os dados de um card temporal"""
    if today is None:
        today = date.today()
    
    year = today.year
    
    if card_type == TimeCardType.TRIMESTRE:
        # Determinar trimestre atual
        quarter = (today.month - 1) // 3 + 1
        start_date, end_date = get_quarter_dates(year, quarter)
        name = f"Q{quarter} {year}"
        
    elif card_type == TimeCardType.QUADRIMESTRE:
        # Determinar quadrimestre atual
        quadrimester = (today.month - 1) // 4 + 1
        start_date, end_date = get_quadrimester_dates(year, quadrimester)
        name = f"Quadrimestre {quadrimester} {year}"
        
    elif card_type == TimeCardType.SEMESTRE:
        # Determinar semestre atual
        semester = 1 if today.month <= 6 else 2
        start_date, end_date = get_semester_dates(year, semester)
        name = f"S{semester} {year}"
        
    elif card_type == TimeCardType.ANO:
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        name = str(year)
    
    # Cálculos temporais
    days_total = (end_date - start_date).days + 1
    days_elapsed = max(0, (today - start_date).days + 1)
    days_remaining = max(0, (end_date - today).days)
    
    # Progresso percentual
    if days_total > 0:
        progress_percentage = min(100.0, max(0.0, (days_elapsed / days_total) * 100))
    else:
        progress_percentage = 0.0
    
    # Verificar se é período atual
    is_current = start_date <= today <= end_date
    
    return TimeCard(
        type=card_type,
        name=name,
        start_date=start_date,
        end_date=end_date,
        days_total=days_total,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        progress_percentage=round(progress_percentage, 2),
        is_current=is_current
    )

async def get_user_preferences(user_id: str, company_id: str) -> Optional[DashboardPreferences]:
    """Busca as preferências do dashboard do usuário"""
    try:
        # Tentar buscar preferências existentes
        prefs_response = supabase_admin.from_('dashboard_preferences').select("*").eq(
            'user_id', user_id
        ).eq('company_id', company_id).execute()
        
        if prefs_response.data:
            prefs_data = prefs_response.data[0]
            # Converter selected_cards de list para list[TimeCardType]
            selected_cards = [TimeCardType(card) for card in prefs_data.get('selected_cards', [])]
            prefs_data['selected_cards'] = selected_cards
            return DashboardPreferences(**prefs_data)
        
        return None
    except Exception as e:
        print(f"DEBUG: Erro ao buscar preferências: {e}")
        return None

async def get_active_cycle_status(company_id: str) -> Optional[CycleStatus]:
    """Busca o status do ciclo ativo"""
    try:
        from .cycles import calculate_cycle_status
        
        response = supabase_admin.from_('cycles').select(
            "id, name, start_date, end_date, is_active, created_at, updated_at"
        ).eq('company_id', company_id).eq('is_active', True).execute()
        
        if response.data:
            return calculate_cycle_status(response.data[0])
        
        return None
    except Exception as e:
        print(f"DEBUG: Erro ao buscar ciclo ativo: {e}")
        return None

async def get_all_company_cycles(company_id: str) -> List[CycleStatus]:
    """Busca todos os ciclos da empresa com status calculado"""
    try:
        from .cycles import calculate_cycle_status
        
        response = supabase_admin.from_('cycles').select(
            "id, name, start_date, end_date, is_active, created_at, updated_at"
        ).eq('company_id', company_id).order('created_at', desc=True).execute()
        
        if response.data:
            cycles = []
            for cycle_data in response.data:
                cycle_status = calculate_cycle_status(cycle_data)
                cycles.append(cycle_status)
            return cycles
        
        return []
    except Exception as e:
        print(f"DEBUG: Erro ao buscar ciclos da empresa: {e}")
        return []

@router.get("/time-cards", response_model=TimeCardsResponse, summary="Cards temporais do dashboard")
async def get_time_cards(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna todos os cards temporais disponíveis, as preferências do usuário, o ciclo ativo e todos os ciclos.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Calcular todos os cards temporais disponíveis
        today = date.today()
        available_cards = []
        
        for card_type in TimeCardType:
            card = calculate_time_card(card_type, today)
            available_cards.append(card)
        
        # Buscar preferências do usuário
        user_preferences = await get_user_preferences(str(current_user.id), str(current_user.company_id))
        
        # Buscar ciclo ativo
        active_cycle = await get_active_cycle_status(str(current_user.company_id))
        
        # Buscar todos os ciclos da empresa
        all_cycles = await get_all_company_cycles(str(current_user.company_id))
        
        return TimeCardsResponse(
            available_cards=available_cards,
            user_preferences=user_preferences,
            active_cycle=active_cycle,
            all_cycles=all_cycles
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar time cards: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.put("/time-preferences", response_model=DashboardPreferences, summary="Configurar preferências de cards")
async def update_time_preferences(
    preferences_data: DashboardPreferencesUpdate, 
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Atualiza as preferências de cards temporais do usuário.
    Usuário pode selecionar até 3 cards para exibir no dashboard.
    NOTA: Por enquanto, retorna as preferências sem salvar no banco (versão simplificada).
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Por enquanto, retornar um mock das preferências sem salvar no banco
        # TODO: Implementar salvamento real quando a tabela dashboard_preferences estiver criada
        from uuid import uuid4
        from datetime import datetime
        
        mock_preferences = DashboardPreferences(
            id=uuid4(),
            user_id=current_user.id,
            company_id=current_user.company_id,
            selected_cards=preferences_data.selected_cards,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        print(f"DEBUG: Preferências simuladas para usuário {current_user.id}: {[card.value for card in preferences_data.selected_cards]}")
        
        return mock_preferences
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar preferências: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

# ============ SPRINT 6: DASHBOARD CARDS VARIÁVEIS ============

async def get_company_data(company_id: str):
    """Busca dados básicos da empresa"""
    try:
        response = supabase_admin.from_('companies').select('name').eq('id', company_id).single().execute()
        return response.data if response.data else None
    except Exception as e:
        print(f"DEBUG: Erro ao buscar empresa: {e}")
        return None

async def get_objectives_data(company_id: str):
    """Busca dados completos dos objetivos da empresa"""
    try:
        response = supabase_admin.from_('objectives').select(
            'id, title, status, progress, created_at, updated_at'
        ).eq('company_id', company_id).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"DEBUG: Erro ao buscar objetivos: {e}")
        return []

async def get_key_results_data(company_id: str):
    """Busca dados dos Key Results da empresa"""
    try:
        # Primeiro, buscar os IDs dos objetivos da empresa
        objectives_response = supabase_admin.from_('objectives').select('id').eq('company_id', company_id).execute()
        
        if not objectives_response.data:
            return []
        
        objective_ids = [obj['id'] for obj in objectives_response.data]
        
        # Buscar Key Results dos objetivos
        kr_response = supabase_admin.from_('key_results').select(
            'id, title, status, progress, objective_id'
        ).in_('objective_id', objective_ids).execute()
        
        return kr_response.data if kr_response.data else []
    except Exception as e:
        print(f"DEBUG: Erro ao buscar key results: {e}")
        return []

async def get_active_users_count(company_id: str) -> int:
    """Conta usuários ativos da empresa"""
    try:
        response = supabase_admin.from_('users').select('id').eq(
            'company_id', company_id
        ).eq('is_active', True).execute()
        return len(response.data) if response.data else 0
    except Exception as e:
        print(f"DEBUG: Erro ao contar usuários: {e}")
        return 0

def calculate_expected_progress(cycle_data: dict, today: date = None) -> float:
    """Calcula o progresso esperado baseado no tempo do ciclo"""
    if not cycle_data or today is None:
        today = date.today()
    
    try:
        start_date = datetime.strptime(cycle_data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(cycle_data['end_date'], '%Y-%m-%d').date()
        
        # Se ainda não começou o ciclo
        if today < start_date:
            return 0.0
        
        # Se já passou do ciclo
        if today > end_date:
            return 100.0
        
        # Calcular progresso baseado no tempo
        total_days = (end_date - start_date).days + 1
        elapsed_days = (today - start_date).days + 1
        
        expected_progress = (elapsed_days / total_days) * 100
        return min(100.0, max(0.0, expected_progress))
        
    except Exception as e:
        print(f"DEBUG: Erro ao calcular progresso esperado: {e}")
        return 0.0

def determine_status_color(current: float, expected: float) -> StatusColor:
    """Determina a cor do status baseado na diferença entre atual e esperado"""
    variance = current - expected
    
    if variance >= -5:  # Dentro de 5% do esperado ou acima
        return StatusColor.GREEN
    elif variance >= -15:  # Entre 5% e 15% abaixo
        return StatusColor.YELLOW
    else:  # Mais de 15% abaixo
        return StatusColor.RED

def determine_trend(current_progress: float, objectives_data: List[dict]) -> tuple[TrendDirection, float]:
    """Determina a tendência baseado nos dados recentes"""
    if not objectives_data:
        return TrendDirection.STABLE, 0.0
    
    try:
        # Calcular progresso da semana passada (simulado)
        # Em uma implementação real, isso viria de dados históricos
        week_ago = date.today() - timedelta(days=7)
        
        # Por enquanto, simular uma tendência baseada no progresso atual
        if current_progress >= 70:
            return TrendDirection.UP, 2.5
        elif current_progress >= 30:
            return TrendDirection.STABLE, 0.5
        else:
            return TrendDirection.DOWN, -1.5
            
    except Exception as e:
        print(f"DEBUG: Erro ao calcular tendência: {e}")
        return TrendDirection.STABLE, 0.0

@router.get("/stats", response_model=DashboardStats, summary="Estatísticas gerais do dashboard")
async def get_dashboard_stats(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna estatísticas gerais do dashboard incluindo totais de objetivos,
    Key Results, usuários ativos e informações do ciclo ativo.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        company_id = str(current_user.company_id)
        
        # Buscar dados em paralelo
        company_data = await get_company_data(company_id)
        objectives_data = await get_objectives_data(company_id)
        key_results_data = await get_key_results_data(company_id)
        active_users = await get_active_users_count(company_id)
        active_cycle = await get_active_cycle_status(company_id)
        
        # Montar estatísticas
        stats = DashboardStats(
            total_objectives=len(objectives_data),
            total_key_results=len(key_results_data),
            active_users=active_users,
            active_cycle_name=active_cycle.name if active_cycle else None,
            active_cycle_progress=active_cycle.progress_percentage if active_cycle else 0.0,
            company_name=company_data.get('name', 'Empresa') if company_data else 'Empresa',
            last_updated=datetime.now().isoformat()
        )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/progress", response_model=ProgressData, summary="Progresso geral do dashboard")
async def get_dashboard_progress(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna dados de progresso geral incluindo progresso atual,
    progresso esperado, tendência e informações do ciclo.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        company_id = str(current_user.company_id)
        today = date.today()
        
        # Buscar dados necessários
        objectives_data = await get_objectives_data(company_id)
        active_cycle = await get_active_cycle_status(company_id)
        
        # Calcular progresso atual (média dos objetivos)
        if objectives_data:
            total_progress = sum(float(obj.get('progress', 0)) for obj in objectives_data)
            current_progress = total_progress / len(objectives_data)
        else:
            current_progress = 0.0
        
        # Calcular progresso esperado baseado no ciclo
        if active_cycle:
            expected_progress = active_cycle.progress_percentage
            cycle_days_total = active_cycle.days_total
            cycle_days_elapsed = active_cycle.days_elapsed
            cycle_days_remaining = active_cycle.days_remaining
        else:
            expected_progress = 0.0
            cycle_days_total = 365
            cycle_days_elapsed = 0
            cycle_days_remaining = 365
        
        # Calcular variância
        variance = current_progress - expected_progress
        
        # Determinar cor do status
        status_color = determine_status_color(current_progress, expected_progress)
        
        # Determinar tendência
        trend_direction, trend_percentage = determine_trend(current_progress, objectives_data)
        
        progress_data = ProgressData(
            current_progress=round(current_progress, 2),
            expected_progress=round(expected_progress, 2),
            variance=round(variance, 2),
            status_color=status_color,
            trend_direction=trend_direction,
            trend_percentage=round(trend_percentage, 2),
            cycle_days_total=cycle_days_total,
            cycle_days_elapsed=cycle_days_elapsed,
            cycle_days_remaining=cycle_days_remaining
        )
        
        return progress_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar progresso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/objectives-count", response_model=ObjectivesCount, summary="Contadores de objetivos")
async def get_objectives_count(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna contadores detalhados de objetivos por status,
    incluindo taxas de conclusão e progresso.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        company_id = str(current_user.company_id)
        
        # Buscar objetivos
        objectives_data = await get_objectives_data(company_id)
        
        if not objectives_data:
            return ObjectivesCount(
                total=0,
                completed=0,
                on_track=0,
                at_risk=0,
                behind=0,
                planned=0,
                completion_rate=0.0,
                on_track_rate=0.0
            )
        
        # Contar por status
        status_counts = {
            'COMPLETED': 0,
            'ON_TRACK': 0,
            'AT_RISK': 0,
            'BEHIND': 0,
            'PLANNED': 0
        }
        
        for obj in objectives_data:
            obj_status = obj.get('status', 'PLANNED')
            if obj_status in status_counts:
                status_counts[obj_status] += 1
        
        total = len(objectives_data)
        completed = status_counts['COMPLETED']
        on_track = status_counts['ON_TRACK']
        at_risk = status_counts['AT_RISK']
        behind = status_counts['BEHIND']
        planned = status_counts['PLANNED']
        
        # Calcular taxas
        completion_rate = (completed / total * 100) if total > 0 else 0.0
        on_track_rate = ((completed + on_track) / total * 100) if total > 0 else 0.0
        
        objectives_count = ObjectivesCount(
            total=total,
            completed=completed,
            on_track=on_track,
            at_risk=at_risk,
            behind=behind,
            planned=planned,
            completion_rate=round(completion_rate, 2),
            on_track_rate=round(on_track_rate, 2)
        )
        
        return objectives_count
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar contadores: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/evolution", response_model=EvolutionData, summary="Dados de evolução temporal")
async def get_dashboard_evolution(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna dados de evolução temporal incluindo pontos de progresso
    ao longo do período, análise de tendência e resumo de performance.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        company_id = str(current_user.company_id)
        today = date.today()
        
        # Buscar dados necessários
        objectives_data = await get_objectives_data(company_id)
        active_cycle = await get_active_cycle_status(company_id)
        
        # Definir período de análise (último mês ou ciclo ativo)
        if active_cycle:
            try:
                # Converter timestamp para date (lidar com formato ISO com timezone)
                period_start = datetime.fromisoformat(active_cycle.start_date.replace('Z', '+00:00')).date()
                period_end = datetime.fromisoformat(active_cycle.end_date.replace('Z', '+00:00')).date()
            except Exception as date_error:
                print(f"DEBUG: Erro ao converter datas do ciclo: {date_error}")
                period_start = today - timedelta(days=30)
                period_end = today
        else:
            period_start = today - timedelta(days=30)
            period_end = today
        
        # Gerar pontos de evolução (semanal)
        evolution_points = []
        current_date = period_start
        
        while current_date <= min(today, period_end):
            # Em uma implementação real, buscaríamos dados históricos
            # Por enquanto, simular evolução baseada na data
            days_from_start = (current_date - period_start).days
            total_days = (period_end - period_start).days + 1
            
            # Simular progresso real (com alguma variação)
            expected_at_date = (days_from_start / total_days) * 100
            
            # Simular progresso real com base nos objetivos atuais
            if objectives_data:
                base_progress = sum(float(obj.get('progress', 0)) for obj in objectives_data) / len(objectives_data)
                # Simular que o progresso foi gradual até chegar no atual
                actual_progress = min(base_progress, expected_at_date + 10)  # Simular leve adiantamento
            else:
                actual_progress = expected_at_date
            
            evolution_points.append(EvolutionPoint(
                date=current_date.isoformat(),
                actual_progress=round(actual_progress, 2),
                expected_progress=round(expected_at_date, 2),
                objectives_count=len(objectives_data)
            ))
            
            # Avançar uma semana
            current_date += timedelta(days=7)
        
        # Análise de tendência
        trend_analysis = TrendAnalysis(
            direction="UP" if len(evolution_points) > 1 and evolution_points[-1].actual_progress > evolution_points[0].actual_progress else "STABLE",
            average_weekly_growth=2.5,  # Simulado
            consistency_score=85.0,     # Simulado
            prediction_next_week=evolution_points[-1].actual_progress + 3.0 if evolution_points else 0.0
        )
        
        # Resumo de performance
        performance_summary = PerformanceSummary(
            overall_score=78.5,      # Simulado
            time_efficiency=82.0,    # Simulado
            goal_achievement=75.0,   # Simulado
            team_engagement=80.0     # Simulado
        )
        
        evolution_data = EvolutionData(
            period_start=period_start.isoformat(),
            period_end=period_end.isoformat(),
            current_date=today.isoformat(),
            evolution_points=evolution_points,
            trend_analysis=trend_analysis,
            performance_summary=performance_summary
        )
        
        return evolution_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar evolução: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        ) 
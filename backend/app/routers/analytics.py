from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

from ..dependencies import get_current_user, get_supabase_admin
from ..models.user import UserProfile
from ..models.analytics import (
    HistoryResponse, ObjectiveHistoryResponse, TrendsResponse, PerformanceResponse,
    AnalyticsFilter, PeriodGranularity
)
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


def get_analytics_service(supabase_admin=Depends(get_supabase_admin)) -> AnalyticsService:
    """Dependency para obter o serviço de analytics"""
    return AnalyticsService(supabase_admin)


@router.get("/history", response_model=HistoryResponse)
async def get_company_history(
    start_date: Optional[date] = Query(None, description="Data de início (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim (YYYY-MM-DD)"),
    cycle_id: Optional[str] = Query(None, description="ID do ciclo específico"),
    granularity: PeriodGranularity = Query(PeriodGranularity.WEEKLY, description="Granularidade dos dados"),
    include_predictions: bool = Query(True, description="Incluir previsões"),
    include_benchmarks: bool = Query(True, description="Incluir benchmarks"),
    current_user: UserProfile = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Retorna histórico de progresso geral da empresa.
    
    Este endpoint fornece dados históricos de evolução temporal, incluindo:
    - Progresso real vs esperado ao longo do tempo
    - Análise de tendências
    - Resumo de performance
    - Métricas do período
    
    **Parâmetros:**
    - `start_date`: Data de início da análise (padrão: 90 dias atrás)
    - `end_date`: Data de fim da análise (padrão: hoje)
    - `cycle_id`: Analisar apenas um ciclo específico
    - `granularity`: DAILY, WEEKLY ou MONTHLY
    - `include_predictions`: Incluir previsões baseadas em tendências
    - `include_benchmarks`: Incluir comparações com benchmarks
    
    **Response:**
    ```json
    {
      "timeline": ["2024-01", "2024-02", "2024-03"],
      "actual_progress": [15, 35, 45],
      "expected_progress": [33, 66, 100],
      "objectives_count": [5, 5, 6]
    }
    ```
    """
    try:
        # Verifica se usuário tem empresa
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )

        company_id = str(current_user.company_id)
        
        # Cria filtros
        filters = AnalyticsFilter(
            start_date=start_date,
            end_date=end_date,
            cycle_id=cycle_id,
            granularity=granularity,
            include_predictions=include_predictions,
            include_benchmarks=include_benchmarks
        )
        
        # Busca dados históricos
        history_data = await analytics_service.get_company_history(company_id, filters)
        
        return HistoryResponse(data=history_data)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/objectives/{objective_id}", response_model=ObjectiveHistoryResponse)
async def get_objective_history(
    objective_id: str,
    start_date: Optional[date] = Query(None, description="Data de início (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim (YYYY-MM-DD)"),
    current_user: UserProfile = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Retorna histórico específico de um objetivo.
    
    Este endpoint fornece análise detalhada da evolução de um objetivo específico:
    - Progresso histórico semanal
    - Métricas de crescimento
    - Resumo dos Key Results associados
    - Contagem de check-ins por período
    
    **Parâmetros:**
    - `objective_id`: ID do objetivo a ser analisado
    - `start_date`: Data de início (padrão: data de criação do objetivo)
    - `end_date`: Data de fim (padrão: hoje)
    
    **Validações:**
    - Objetivo deve pertencer à empresa do usuário
    - Apenas usuários da mesma empresa podem acessar
    """
    try:
        # Verifica se usuário tem empresa
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )

        company_id = str(current_user.company_id)
        
        # Cria filtros
        filters = AnalyticsFilter(
            start_date=start_date,
            end_date=end_date
        )
        
        # Busca histórico do objetivo
        objective_history = await analytics_service.get_objective_history(
            objective_id, company_id, filters
        )
        
        return ObjectiveHistoryResponse(data=objective_history)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/trends", response_model=TrendsResponse)
async def get_trends_analysis(
    start_date: Optional[date] = Query(None, description="Data de início (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim (YYYY-MM-DD)"),
    owner_id: Optional[str] = Query(None, description="Filtrar por responsável"),
    current_user: UserProfile = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Retorna análise de tendências da empresa.
    
    Este endpoint gera análise completa de tendências comparando períodos:
    - Tendências de objetivos, progresso, conclusão e engajamento
    - Insights automáticos baseados nos dados
    - Recomendações para melhoria
    - Score geral de saúde da empresa
    
    **Métricas analisadas:**
    - Objetivos Ativos: Quantidade de objetivos em andamento
    - Progresso Médio: Performance média da equipe
    - Taxa de Conclusão: Percentual de objetivos finalizados
    - Engajamento: Frequência de atualizações (check-ins)
    - Key Results Ativos: Quantidade de atividades em execução
    
    **Período padrão:** Últimas 4 semanas vs 4 semanas anteriores
    """
    try:
        # Verifica se usuário tem empresa
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )

        company_id = str(current_user.company_id)
        
        # Cria filtros
        filters = AnalyticsFilter(
            start_date=start_date,
            end_date=end_date,
            owner_id=owner_id
        )
        
        # Busca análise de tendências
        trends_analysis = await analytics_service.get_trends_analysis(company_id, filters)
        
        return TrendsResponse(data=trends_analysis)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/performance", response_model=PerformanceResponse)
async def get_performance_analysis(
    start_date: Optional[date] = Query(None, description="Data de início (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim (YYYY-MM-DD)"),
    cycle_id: Optional[str] = Query(None, description="ID do ciclo específico"),
    current_user: UserProfile = Depends(get_current_user),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Retorna análise detalhada de performance da empresa.
    
    Este endpoint gera relatório completo de performance incluindo:
    - Performance do ciclo atual
    - Métricas detalhadas com benchmarks
    - Resumo executivo
    - Alertas e itens de ação
    - Comparações temporais (mês a mês, trimestre a trimestre)
    
    **Métricas incluídas:**
    - Total de Objetivos
    - Progresso Médio
    - Taxa de Conclusão
    - Eficiência Temporal
    - Score de Performance
    
    **Alertas automáticos:**
    - Progresso abaixo de 50%
    - Eficiência temporal baixa
    - Taxa de conclusão insuficiente
    
    **Requer:** Empresa deve ter ciclo ativo
    """
    try:
        # Verifica se usuário tem empresa
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )

        company_id = str(current_user.company_id)
        
        # Cria filtros
        filters = AnalyticsFilter(
            start_date=start_date,
            end_date=end_date,
            cycle_id=cycle_id
        )
        
        # Busca análise de performance
        performance_analysis = await analytics_service.get_performance_analysis(
            company_id, filters
        )
        
        return PerformanceResponse(data=performance_analysis)
        
    except ValueError as e:
        if "ciclo ativo" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empresa deve ter um ciclo ativo para análise de performance"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


# Health check específico do Analytics
@router.get("/health")
async def analytics_health_check():
    """
    Health check do módulo de Analytics.
    
    Verifica se o sistema de analytics está funcionando corretamente.
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "module": "Analytics",
            "sprint": "Sprint 8",
            "features": [
                "Histórico de progresso geral",
                "Histórico específico de objetivos", 
                "Análise de tendências",
                "Métricas de performance",
                "Insights automáticos",
                "Recomendações inteligentes",
                "Alertas de performance",
                "Comparações temporais"
            ],
            "endpoints": [
                "GET /api/analytics/history",
                "GET /api/analytics/objectives/{id}",
                "GET /api/analytics/trends", 
                "GET /api/analytics/performance"
            ]
        }
    ) 
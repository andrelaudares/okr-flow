from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import tempfile
from uuid import uuid4
import asyncio
import re

from ..dependencies import get_current_user
from ..models.user import UserProfile
from ..models.reports import (
    ReportRequest, ReportResponse, ReportListResponse, 
    AvailableFormatsResponse, ReportMetadata, ReportFormat,
    ReportType, ReportStatus, ReportContent, DashboardReportData,
    ObjectiveReportData, KeyResultReportData, ReportFilters
)
from ..services.report_generator import ReportGenerator
from ..utils.supabase import supabase_admin

router = APIRouter()

# Cache simples para relatórios em memória (em produção, usar Redis)
reports_cache: Dict[str, ReportMetadata] = {}
reports_files: Dict[str, str] = {}  # ID -> filepath

def safe_parse_datetime(date_string: str) -> datetime:
    """
    Função helper para parser seguro de datas ISO que podem ter microssegundos com muitos dígitos
    """
    if not date_string:
        return datetime.now()
    
    try:
        # Remover Z e adicionar timezone UTC
        clean_date = date_string.replace('Z', '+00:00')
        
        # Se tem microssegundos com mais de 6 dígitos, truncar para 6
        if '.' in clean_date and '+' in clean_date:
            parts = clean_date.split('+')
            date_part = parts[0]
            tz_part = '+' + parts[1]
            
            if '.' in date_part:
                main_part, microsec_part = date_part.split('.')
                # Truncar microssegundos para 6 dígitos
                microsec_part = microsec_part[:6].ljust(6, '0')
                clean_date = f"{main_part}.{microsec_part}{tz_part}"
        
        return datetime.fromisoformat(clean_date)
    except Exception as e:
        print(f"DEBUG: Erro ao parser data '{date_string}': {e}")
        return datetime.now()

async def get_company_data(company_id: str):
    """Busca dados da empresa"""
    try:
        response = supabase_admin().from_('companies').select('name').eq('id', company_id).single().execute()
        return response.data if response.data else None
    except Exception as e:
        print(f"DEBUG: Erro ao buscar empresa: {e}")
        return None

async def get_single_objective_for_report(company_id: str, objective_id: str) -> Optional[ObjectiveReportData]:
    """Busca dados detalhados de um objetivo específico para relatório"""
    try:
        # Buscar o objetivo
        response = supabase_admin().from_('objectives').select(
            '''
            id, title, description, owner_id, company_id, cycle_id, 
            status, progress, created_at, updated_at,
            owner:users!owner_id(name),
            cycle:cycles!cycle_id(name)
            '''
        ).eq('company_id', company_id).eq('id', objective_id).single().execute()
        
        if not response.data:
            return None
        
        obj = response.data
        
        # Buscar Key Results detalhados do objetivo
        kr_response = supabase_admin().from_('key_results').select(
            '''
            id, title, description, objective_id, owner_id, target_value,
            current_value, start_value, unit, status, progress, confidence_level,
            created_at, updated_at,
            owner:users!owner_id(name)
            '''
        ).eq('objective_id', objective_id).execute()
        
        kr_data = kr_response.data if kr_response.data else []
        
        # Contar Key Results
        kr_count = len(kr_data)
        kr_completed = len([kr for kr in kr_data if kr.get('status') == 'COMPLETED'])
        
        # Formatar Key Results para incluir no relatório
        formatted_key_results = []
        for kr in kr_data:
            # Buscar check-ins do Key Result
            checkins_response = supabase_admin().from_('kr_checkins').select(
                'id, checkin_date, value_at_checkin, notes, confidence_level_at_checkin'
            ).eq('key_result_id', kr['id']).order('checkin_date', desc=True).limit(5).execute()
            
            checkins_data = checkins_response.data if checkins_response.data else []
            
            formatted_key_results.append({
                'id': kr['id'],
                'title': kr['title'],
                'description': kr.get('description'),
                'objective_id': kr['objective_id'],
                'target_value': float(kr.get('target_value', 0)) if kr.get('target_value') else None,
                'current_value': float(kr.get('current_value', 0)) if kr.get('current_value') else None,
                'start_value': float(kr.get('start_value', 0)) if kr.get('start_value') else None,
                'unit': kr.get('unit'),
                'status': kr.get('status'),
                'progress': float(kr.get('progress', 0)) if kr.get('progress') else 0.0,
                'confidence_level': float(kr.get('confidence_level', 0)) if kr.get('confidence_level') else None,
                'owner_name': kr['owner']['name'] if kr.get('owner') else None,
                'created_at': kr['created_at'],
                'updated_at': kr['updated_at'],
                'recent_checkins': checkins_data
            })
        
        return ObjectiveReportData(
            id=obj['id'],
            title=obj['title'],
            description=obj.get('description'),
            owner_name=obj['owner']['name'] if obj.get('owner') else None,
            cycle_name=obj['cycle']['name'] if obj.get('cycle') else 'Sem ciclo',
            status=obj.get('status', 'PLANNED'),
            progress=float(obj.get('progress', 0)),
            created_at=safe_parse_datetime(obj['created_at']),
            updated_at=safe_parse_datetime(obj['updated_at']),
            key_results_count=kr_count,
            key_results_completed=kr_completed,
            key_results=formatted_key_results
        )
    
    except Exception as e:
        print(f"DEBUG: Erro ao buscar objetivo para relatório: {e}")
        return None

async def get_objectives_for_report(company_id: str, filters: ReportFilters) -> List[ObjectiveReportData]:
    """Busca objetivos formatados para relatório"""
    try:
        # Query base
        query = supabase_admin().from_('objectives').select(
            '''
            id, title, description, owner_id, company_id, cycle_id, 
            status, progress, created_at, updated_at,
            owner:users!owner_id(name),
            cycle:cycles!cycle_id(name)
            '''
        ).eq('company_id', company_id)
        
        # Aplicar filtros
        if filters.search:
            # Para busca, faremos client-side filtering (idealmente seria no banco)
            pass
        
        if filters.status:
            query = query.in_('status', filters.status)
            
        if filters.owner_id:
            query = query.eq('owner_id', filters.owner_id)
            
        if filters.cycle_id:
            query = query.eq('cycle_id', filters.cycle_id)
        
        response = query.execute()
        objectives_data = response.data if response.data else []
        
        # Buscar contagem de Key Results para cada objetivo
        objectives_with_kr_count = []
        
        for obj in objectives_data:
            # Filtrar por busca textual se necessário
            if filters.search:
                search_term = filters.search.lower()
                if (search_term not in obj.get('title', '').lower() and 
                    search_term not in obj.get('description', '').lower()):
                    continue
            
            # Contar Key Results
            kr_response = supabase_admin().from_('key_results').select(
                'id, status'
            ).eq('objective_id', obj['id']).execute()
            
            kr_data = kr_response.data if kr_response.data else []
            kr_count = len(kr_data)
            kr_completed = len([kr for kr in kr_data if kr.get('status') == 'COMPLETED'])
            
            # Incluir Key Results se solicitado
            key_results = None
            if filters.include_key_results:
                kr_detailed = supabase_admin().from_('key_results').select(
                    'id, title, current_value, target_value, unit, status, progress'
                ).eq('objective_id', obj['id']).execute()
                key_results = kr_detailed.data if kr_detailed.data else []
            
            objectives_with_kr_count.append(ObjectiveReportData(
                id=obj['id'],
                title=obj['title'],
                description=obj.get('description'),
                owner_name=obj['owner']['name'] if obj.get('owner') else None,
                cycle_name=obj['cycle']['name'] if obj.get('cycle') else 'Sem ciclo',
                status=obj.get('status', 'PLANNED'),
                progress=float(obj.get('progress', 0)),
                created_at=safe_parse_datetime(obj['created_at']),
                updated_at=safe_parse_datetime(obj['updated_at']),
                key_results_count=kr_count,
                key_results_completed=kr_completed,
                key_results=key_results
            ))
        
        return objectives_with_kr_count
    
    except Exception as e:
        print(f"DEBUG: Erro ao buscar objetivos para relatório: {e}")
        return []

async def get_key_results_for_report(company_id: str, filters: ReportFilters) -> List[KeyResultReportData]:
    """Busca Key Results formatados para relatório"""
    try:
        # Se filtro por objetivo específico, usar diretamente
        if filters.objective_id:
            objective_ids = [filters.objective_id]
        else:
            # Primeiro, buscar objetivos da empresa
            objectives_response = supabase_admin().from_('objectives').select('id').eq('company_id', company_id).execute()
            
            if not objectives_response.data:
                return []
            
            objective_ids = [obj['id'] for obj in objectives_response.data]
        
        # Buscar Key Results
        query = supabase_admin().from_('key_results').select(
            '''
            id, title, description, objective_id, owner_id, target_value,
            current_value, start_value, unit, status, progress, confidence_level,
            created_at, updated_at,
            owner:users!owner_id(name),
            objective:objectives!objective_id(title)
            '''
        ).in_('objective_id', objective_ids)
        
        # Aplicar filtros
        if filters.status:
            query = query.in_('status', filters.status)
            
        if filters.owner_id:
            query = query.eq('owner_id', filters.owner_id)
        
        response = query.execute()
        kr_data = response.data if response.data else []
        
        # Processar dados
        key_results = []
        
        for kr in kr_data:
            # Filtrar por busca textual se necessário
            if filters.search:
                search_term = filters.search.lower()
                if (search_term not in kr.get('title', '').lower() and 
                    search_term not in kr.get('description', '').lower()):
                    continue
            
            # Contar check-ins e buscar último
            checkins_response = supabase_admin().from_('kr_checkins').select(
                'id, checkin_date'
            ).eq('key_result_id', kr['id']).order('checkin_date', desc=True).execute()
            
            checkins_data = checkins_response.data if checkins_response.data else []
            checkins_count = len(checkins_data)
            last_checkin_date = None
            
            if checkins_data:
                last_checkin_date = safe_parse_datetime(checkins_data[0]['checkin_date'])
            
            key_results.append(KeyResultReportData(
                id=kr['id'],
                title=kr['title'],
                description=kr.get('description'),
                objective_title=kr['objective']['title'] if kr.get('objective') else 'Objetivo não encontrado',
                owner_name=kr['owner']['name'] if kr.get('owner') else None,
                target_value=float(kr.get('target_value', 0)),
                current_value=float(kr.get('current_value', 0)),
                start_value=float(kr.get('start_value', 0)),
                unit=kr.get('unit', 'NUMBER'),
                status=kr.get('status', 'PLANNED'),
                progress=float(kr.get('progress', 0)),
                confidence_level=float(kr.get('confidence_level', 0)) if kr.get('confidence_level') else None,
                created_at=safe_parse_datetime(kr['created_at']),
                updated_at=safe_parse_datetime(kr['updated_at']),
                checkins_count=checkins_count,
                last_checkin_date=last_checkin_date
            ))
        
        return key_results
    
    except Exception as e:
        print(f"DEBUG: Erro ao buscar Key Results para relatório: {e}")
        return []

async def get_dashboard_data_for_report(company_id: str) -> DashboardReportData:
    """Busca dados do dashboard para relatório"""
    try:
        # Buscar empresa
        company_data = await get_company_data(company_id)
        
        # Buscar estatísticas
        objectives_data = await get_objectives_for_report(company_id, ReportFilters())
        key_results_data = await get_key_results_for_report(company_id, ReportFilters())
        
        # Contar usuários ativos
        users_response = supabase_admin().from_('users').select('id').eq(
            'company_id', company_id
        ).eq('is_active', True).execute()
        active_users = len(users_response.data) if users_response.data else 0
        
        # Buscar ciclo ativo
        cycle_response = supabase_admin().from_('cycles').select(
            'name'
        ).eq('company_id', company_id).eq('is_active', True).execute()
        
        active_cycle_name = None
        if cycle_response.data:
            active_cycle_name = cycle_response.data[0]['name']
        
        # Calcular métricas
        total_objectives = len(objectives_data)
        total_key_results = len(key_results_data)
        
        # Progresso geral
        overall_progress = 0.0
        if objectives_data:
            overall_progress = sum(obj.progress for obj in objectives_data) / len(objectives_data)
        
        # Contadores por status
        objectives_by_status = {}
        for obj in objectives_data:
            status = obj.status
            objectives_by_status[status] = objectives_by_status.get(status, 0) + 1
        
        # Taxas de conclusão
        completed_count = objectives_by_status.get('COMPLETED', 0)
        on_track_count = objectives_by_status.get('ON_TRACK', 0)
        
        completion_rate = (completed_count / total_objectives * 100) if total_objectives > 0 else 0
        on_track_rate = ((completed_count + on_track_count) / total_objectives * 100) if total_objectives > 0 else 0
        
        return DashboardReportData(
            company_name=company_data.get('name', 'Empresa') if company_data else 'Empresa',
            report_period=f"Até {datetime.now().strftime('%d/%m/%Y')}",
            generation_date=datetime.now(),
            total_objectives=total_objectives,
            total_key_results=total_key_results,
            active_users=active_users,
            active_cycle_name=active_cycle_name,
            overall_progress=overall_progress,
            objectives_by_status=objectives_by_status,
            completion_rate=completion_rate,
            on_track_rate=on_track_rate
        )
    
    except Exception as e:
        print(f"DEBUG: Erro ao buscar dados do dashboard para relatório: {e}")
        # Retornar dados mínimos em caso de erro
        return DashboardReportData(
            company_name="Empresa",
            report_period=f"Até {datetime.now().strftime('%d/%m/%Y')}",
            generation_date=datetime.now(),
            total_objectives=0,
            total_key_results=0,
            active_users=0,
            active_cycle_name=None,
            overall_progress=0.0,
            objectives_by_status={},
            completion_rate=0.0,
            on_track_rate=0.0
        )

async def generate_report_async(report_id: str, content: ReportContent, format: ReportFormat):
    """Gerar relatório em background"""
    try:
        # Atualizar status para PROCESSING
        reports_cache[report_id].status = ReportStatus.PROCESSING
        
        # Gerar relatório
        generator = ReportGenerator(output_dir=tempfile.gettempdir())
        filepath = generator.generate_report(content, format)
        
        # Armazenar arquivo
        reports_files[report_id] = filepath
        
        # Atualizar metadados
        file_size = generator.get_file_size(filepath)
        reports_cache[report_id].status = ReportStatus.COMPLETED
        reports_cache[report_id].file_size = file_size
        reports_cache[report_id].file_path = filepath
        reports_cache[report_id].generation_completed_at = datetime.now()
        reports_cache[report_id].download_url = f"/api/reports/{report_id}/download"
        reports_cache[report_id].expires_at = datetime.now() + timedelta(hours=24)  # Expira em 24h
        
        print(f"DEBUG: Relatório {report_id} gerado com sucesso: {filepath}")
        
    except Exception as e:
        print(f"DEBUG: Erro ao gerar relatório {report_id}: {e}")
        reports_cache[report_id].status = ReportStatus.FAILED
        reports_cache[report_id].error_message = str(e)

@router.get("/formats", response_model=AvailableFormatsResponse, summary="Formatos disponíveis para exportação")
async def get_available_formats(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna os formatos de exportação disponíveis no sistema.
    """
    formats = [
        {
            "format": "CSV",
            "name": "CSV",
            "description": "Arquivo CSV separado por ponto e vírgula",
            "extension": ".csv",
            "supports_charts": False
        },
        {
            "format": "EXCEL",
            "name": "Excel",
            "description": "Planilha do Microsoft Excel com múltiplas abas",
            "extension": ".xlsx",
            "supports_charts": False,
            "note": "Requer pandas instalado"
        },
        {
            "format": "PDF",
            "name": "PDF",
            "description": "Documento PDF formatado com tabelas e resumo",
            "extension": ".pdf",
            "supports_charts": True,
            "note": "Requer reportlab instalado"
        }
    ]
    
    return AvailableFormatsResponse(formats=formats)

@router.post("/export", response_model=ReportResponse, summary="Gerar relatório para exportação")
async def export_report(
    report_request: ReportRequest,
    background_tasks: BackgroundTasks,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Gera um relatório para exportação baseado nos filtros especificados.
    O relatório é processado em background e fica disponível para download.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        company_id = str(current_user.company_id)
        
        # Gerar ID único para o relatório
        report_id = str(uuid4())
        
        # Criar metadados do relatório
        metadata = ReportMetadata(
            id=report_id,
            name=report_request.name,
            report_type=report_request.report_type,
            format=report_request.format,
            status=ReportStatus.PENDING,
            filters_applied=report_request.filters,
            records_count=0,
            generation_started_at=datetime.now()
        )
        
        # Armazenar no cache
        reports_cache[report_id] = metadata
        
        # Buscar dados baseado no tipo de relatório
        dashboard_data = None
        objectives = None
        key_results = None
        
        if report_request.report_type in [ReportType.DASHBOARD, ReportType.COMPLETE]:
            dashboard_data = await get_dashboard_data_for_report(company_id)
        
        if report_request.report_type == ReportType.SINGLE_OBJECTIVE:
            # Exportação de objetivo específico
            if not report_request.filters.objective_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="objective_id é obrigatório para relatório de objetivo único"
                )
            
            single_objective = await get_single_objective_for_report(
                company_id, 
                report_request.filters.objective_id
            )
            
            if not single_objective:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Objetivo não encontrado"
                )
            
            objectives = [single_objective]
            
            # Para objetivo individual, os Key Results já estão incluídos no objetivo
            # Não precisamos buscar separadamente
            key_results = []
        
        elif report_request.report_type in [ReportType.OBJECTIVES, ReportType.COMPLETE]:
            objectives = await get_objectives_for_report(company_id, report_request.filters)
        
        if report_request.report_type in [ReportType.KEY_RESULTS, ReportType.COMPLETE]:
            key_results = await get_key_results_for_report(company_id, report_request.filters)
        
        # Criar conteúdo do relatório
        content = ReportContent(
            metadata=metadata,
            dashboard_data=dashboard_data,
            objectives=objectives,
            key_results=key_results
        )
        
        # Atualizar contagem de registros
        records_count = 0
        if objectives:
            records_count += len(objectives)
        if key_results:
            records_count += len(key_results)
        
        metadata.records_count = records_count
        
        # Iniciar geração em background
        background_tasks.add_task(
            generate_report_async, 
            report_id, 
            content, 
            report_request.format
        )
        
        # Estimar tempo baseado no número de registros
        estimated_time = min(max(records_count * 0.1, 5), 60)  # Entre 5s e 60s
        
        return ReportResponse(
            id=report_id,
            message="Relatório enviado para processamento",
            status=ReportStatus.PENDING,
            estimated_time=int(estimated_time)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao processar solicitação de relatório: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/{report_id}/status", response_model=ReportMetadata, summary="Status do relatório")
async def get_report_status(
    report_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Retorna o status atual de um relatório em processamento.
    """
    if report_id not in reports_cache:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    return reports_cache[report_id]

@router.get("/{report_id}/download", summary="Download do relatório gerado")
async def download_report(
    report_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Faz download de um relatório gerado.
    """
    if report_id not in reports_cache:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    report_metadata = reports_cache[report_id]
    
    if report_metadata.status != ReportStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Relatório não está pronto. Status: {report_metadata.status}"
        )
    
    if report_id not in reports_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo do relatório não encontrado"
        )
    
    filepath = reports_files[report_id]
    
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo não existe no sistema"
        )
    
    # Verificar expiração
    if report_metadata.expires_at and datetime.now() > report_metadata.expires_at:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Relatório expirado"
        )
    
    # Determinar nome do arquivo
    extension_map = {
        ReportFormat.CSV: '.csv',
        ReportFormat.EXCEL: '.xlsx',
        ReportFormat.PDF: '.pdf'
    }
    
    extension = extension_map.get(report_metadata.format, '.txt')
    filename = f"{report_metadata.name.replace(' ', '_')}{extension}"
    
    return FileResponse(
        filepath,
        media_type='application/octet-stream',
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/", response_model=ReportListResponse, summary="Listar relatórios do usuário")
async def list_user_reports(current_user: UserProfile = Depends(get_current_user)):
    """
    Lista todos os relatórios gerados pelo usuário (últimos 50).
    """
    try:
        # Filtrar relatórios por usuário (simplificado - em produção seria no banco)
        user_reports = []
        
        for report_id, metadata in reports_cache.items():
            # Aqui idealmente filtraramos por user_id, mas como é um cache simples,
            # retornamos todos os relatórios para demonstração
            user_reports.append(metadata)
        
        # Ordenar por data de criação (mais recente primeiro)
        user_reports.sort(key=lambda x: x.generation_started_at, reverse=True)
        
        # Limitar a 50 resultados
        user_reports = user_reports[:50]
        
        return ReportListResponse(
            reports=user_reports,
            total=len(user_reports)
        )
        
    except Exception as e:
        print(f"DEBUG: Erro ao listar relatórios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.delete("/{report_id}", summary="Deletar relatório")
async def delete_report(
    report_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Deleta um relatório e remove o arquivo associado.
    """
    if report_id not in reports_cache:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    try:
        # Limpar arquivo se existir
        if report_id in reports_files:
            filepath = reports_files[report_id]
            if os.path.exists(filepath):
                os.remove(filepath)
            del reports_files[report_id]
        
        # Remover do cache
        del reports_cache[report_id]
        
        return {"message": "Relatório deletado com sucesso"}
        
    except Exception as e:
        print(f"DEBUG: Erro ao deletar relatório: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        ) 
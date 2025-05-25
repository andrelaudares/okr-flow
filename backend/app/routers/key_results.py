from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from ..dependencies import get_current_user
from ..models.user import UserProfile, UserRole
from ..models.key_result import (
    KeyResult, KeyResultCreate, KeyResultUpdate, KeyResultWithDetails,
    KeyResultFilter, KeyResultListResponse, KRStatus, KRUnit,
    Checkin, CheckinCreate, CheckinUpdate, CheckinWithDetails, CheckinListResponse
)
from ..utils.supabase import supabase_admin

router = APIRouter()

def calculate_progress(current_value: float, start_value: float, target_value: float) -> float:
    """Calcula o progresso do Key Result baseado nos valores"""
    if target_value == start_value:
        return 100.0 if current_value >= target_value else 0.0
    
    progress = ((current_value - start_value) / (target_value - start_value)) * 100
    return max(0.0, min(100.0, progress))  # Limita entre 0 e 100

def update_status_based_on_progress(progress: float) -> str:
    """Atualiza o status baseado no progresso"""
    if progress >= 100:
        return "COMPLETED"
    elif progress >= 70:
        return "ON_TRACK"
    elif progress >= 30:
        return "AT_RISK"
    else:
        return "BEHIND"

async def update_objective_progress(objective_id: str):
    """Atualiza o progresso do objetivo baseado nos Key Results"""
    try:
        # Buscar todos os Key Results do objetivo
        kr_response = supabase_admin.from_('key_results').select('progress').eq('objective_id', objective_id).execute()
        
        if kr_response.data:
            total_progress = sum(kr['progress'] for kr in kr_response.data)
            average_progress = total_progress / len(kr_response.data)
            
            # Atualizar progresso do objetivo
            supabase_admin.from_('objectives').update({
                'progress': round(average_progress, 2),
                'updated_at': 'now()'
            }).eq('id', objective_id).execute()
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar progresso do objetivo: {e}")

def apply_text_search_filter(query, search_term: str):
    """Aplica filtro de busca textual"""
    return query.or_(f"title.ilike.%{search_term}%,description.ilike.%{search_term}%")

def apply_status_filter(query, statuses: List[KRStatus]):
    """Aplica filtro de status"""
    status_values = [status.value for status in statuses]
    return query.in_('status', status_values)

def apply_unit_filter(query, units: List[KRUnit]):
    """Aplica filtro de unidade"""
    unit_values = [unit.value for unit in units]
    return query.in_('unit', unit_values)

# ============ ROTAS PARA KEY RESULTS ============

@router.get("/{objective_id}/key-results", response_model=KeyResultListResponse, summary="Listar Key Results do objetivo")
async def list_key_results(
    objective_id: UUID,
    search: Optional[str] = Query(None, description="Busca por título ou descrição"),
    status: Optional[List[KRStatus]] = Query(None, description="Filtrar por status"),
    owner_id: Optional[UUID] = Query(None, description="Filtrar por responsável"),
    unit: Optional[List[KRUnit]] = Query(None, description="Filtrar por unidade"),
    limit: int = Query(50, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Lista Key Results de um objetivo específico com filtros opcionais.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se objetivo existe na empresa
        objective_check = supabase_admin.from_('objectives').select('id').eq(
            'id', str(objective_id)
        ).eq('company_id', str(current_user.company_id)).execute()
        
        if not objective_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Objetivo não encontrado"
            )
        
        # Criar filtros
        filters = KeyResultFilter(
            search=search,
            status=status,
            owner_id=owner_id,
            unit=unit,
            limit=limit,
            offset=offset
        )
        
        # Query base
        query = supabase_admin.from_('key_results').select(
            "*, owner:users(name), objective:objectives(title)"
        ).eq('objective_id', str(objective_id))
        
        # Aplicar filtros
        if filters.search and filters.search.strip():
            query = apply_text_search_filter(query, filters.search.strip())
        
        if filters.status:
            query = apply_status_filter(query, filters.status)
        
        if filters.owner_id:
            query = query.eq('owner_id', str(filters.owner_id))
        
        if filters.unit:
            query = apply_unit_filter(query, filters.unit)
        
        # Contar total sem paginação
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Aplicar paginação e ordenação
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        
        # Executar query
        response = query.execute()
        kr_data = response.data if response.data else []
        
        # Converter dados para modelos
        key_results = []
        for kr in kr_data:
            formatted_data = {
                'id': kr['id'],
                'title': kr['title'],
                'description': kr['description'],
                'objective_id': kr['objective_id'],
                'owner_id': kr['owner_id'],
                'target_value': float(kr['target_value']),
                'current_value': float(kr['current_value']) if kr['current_value'] else 0.0,
                'start_value': float(kr['start_value']) if kr['start_value'] else 0.0,
                'unit': kr['unit'],
                'confidence_level': float(kr['confidence_level']) if kr['confidence_level'] else None,
                'status': kr['status'],
                'progress': float(kr['progress']) if kr['progress'] else 0.0,
                'created_at': kr['created_at'],
                'updated_at': kr['updated_at'],
                'owner_name': kr['owner']['name'] if kr.get('owner') else None,
                'objective_title': kr['objective']['title'] if kr.get('objective') else 'Objetivo não encontrado'
            }
            key_results.append(KeyResultWithDetails(**formatted_data))
        
        has_more = (offset + limit) < total
        
        return KeyResultListResponse(
            key_results=key_results,
            total=total,
            has_more=has_more,
            filters_applied=filters
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao listar key results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/{objective_id}/key-results", response_model=KeyResult, summary="Criar novo Key Result", status_code=201)
async def create_key_result(
    objective_id: UUID,
    kr_data: KeyResultCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Cria um novo Key Result para um objetivo.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se objetivo existe na empresa
        objective_check = supabase_admin.from_('objectives').select('id').eq(
            'id', str(objective_id)
        ).eq('company_id', str(current_user.company_id)).execute()
        
        if not objective_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Objetivo não encontrado"
            )
        
        # Verificar se owner_id existe na empresa (se informado)
        owner_id = kr_data.owner_id or current_user.id
        if owner_id != current_user.id:
            owner_check = supabase_admin.from_('users').select('id').eq(
                'id', str(owner_id)
            ).eq('company_id', str(current_user.company_id)).eq('is_active', True).execute()
            
            if not owner_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Responsável não encontrado na empresa"
                )
        
        # Calcular progresso inicial
        progress = calculate_progress(
            kr_data.current_value or 0.0,
            kr_data.start_value or 0.0,
            kr_data.target_value
        )
        
        # Determinar status inicial baseado no progresso
        initial_status = update_status_based_on_progress(progress)
        
        # Preparar dados do Key Result
        kr_db_data = {
            'title': kr_data.title,
            'description': kr_data.description,
            'objective_id': str(objective_id),
            'owner_id': str(owner_id),
            'target_value': kr_data.target_value,
            'current_value': kr_data.current_value or 0.0,
            'start_value': kr_data.start_value or 0.0,
            'unit': kr_data.unit.value,
            'confidence_level': kr_data.confidence_level,
            'status': initial_status,
            'progress': progress,
            'created_at': 'now()',
            'updated_at': 'now()'
        }
        
        # Inserir Key Result
        insert_response = supabase_admin.from_('key_results').insert(kr_db_data).execute()
        
        if not insert_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar Key Result"
            )
        
        # Atualizar progresso do objetivo
        await update_objective_progress(str(objective_id))
        
        # Buscar dados completos do Key Result criado
        kr_id = insert_response.data[0]['id']
        full_kr = supabase_admin.from_('key_results').select("*").eq('id', kr_id).single().execute()
        
        if not full_kr.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Key Result criado mas erro ao buscar dados"
            )
        
        # Preparar dados para retorno
        formatted_kr = {
            'id': full_kr.data['id'],
            'title': full_kr.data['title'],
            'description': full_kr.data['description'],
            'objective_id': full_kr.data['objective_id'],
            'owner_id': full_kr.data['owner_id'],
            'target_value': float(full_kr.data['target_value']),
            'current_value': float(full_kr.data['current_value']),
            'start_value': float(full_kr.data['start_value']),
            'unit': full_kr.data['unit'],
            'confidence_level': float(full_kr.data['confidence_level']) if full_kr.data['confidence_level'] else None,
            'status': full_kr.data['status'],
            'progress': float(full_kr.data['progress']),
            'created_at': full_kr.data['created_at'],
            'updated_at': full_kr.data['updated_at']
        }
        
        return KeyResult(**formatted_kr)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao criar Key Result: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/key-results/{kr_id}", response_model=KeyResultWithDetails, summary="Detalhes do Key Result")
async def get_key_result(
    kr_id: UUID,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Retorna detalhes completos de um Key Result específico.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Buscar Key Result com detalhes
        response = supabase_admin.from_('key_results').select(
            "*, owner:users(name), objective:objectives(title, company_id)"
        ).eq('id', str(kr_id)).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        kr_data = response.data
        
        # Verificar se pertence à empresa do usuário
        if kr_data['objective']['company_id'] != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        # Preparar dados para o modelo
        formatted_data = {
            'id': kr_data['id'],
            'title': kr_data['title'],
            'description': kr_data['description'],
            'objective_id': kr_data['objective_id'],
            'owner_id': kr_data['owner_id'],
            'target_value': float(kr_data['target_value']),
            'current_value': float(kr_data['current_value']) if kr_data['current_value'] else 0.0,
            'start_value': float(kr_data['start_value']) if kr_data['start_value'] else 0.0,
            'unit': kr_data['unit'],
            'confidence_level': float(kr_data['confidence_level']) if kr_data['confidence_level'] else None,
            'status': kr_data['status'],
            'progress': float(kr_data['progress']) if kr_data['progress'] else 0.0,
            'created_at': kr_data['created_at'],
            'updated_at': kr_data['updated_at'],
            'owner_name': kr_data['owner']['name'] if kr_data.get('owner') else None,
            'objective_title': kr_data['objective']['title'] if kr_data.get('objective') else 'Objetivo não encontrado'
        }
        
        return KeyResultWithDetails(**formatted_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar Key Result: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.put("/key-results/{kr_id}", response_model=KeyResult, summary="Atualizar Key Result")
async def update_key_result(
    kr_id: UUID,
    kr_data: KeyResultUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Atualiza um Key Result.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se Key Result existe e pertence à empresa
        existing_kr = supabase_admin.from_('key_results').select(
            "*, objective:objectives(company_id)"
        ).eq('id', str(kr_id)).single().execute()
        
        if not existing_kr.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        if existing_kr.data['objective']['company_id'] != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        # Preparar dados para atualização
        update_data = {}
        for field, value in kr_data.dict(exclude_unset=True).items():
            if value is not None:
                if field == 'owner_id':
                    # Verificar se owner_id existe na empresa
                    if value != current_user.id:
                        owner_check = supabase_admin.from_('users').select('id').eq(
                            'id', str(value)
                        ).eq('company_id', str(current_user.company_id)).eq('is_active', True).execute()
                        
                        if not owner_check.data:
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Responsável não encontrado na empresa"
                            )
                    update_data[field] = str(value)
                elif field in ['status', 'unit']:
                    update_data[field] = value.value
                else:
                    update_data[field] = value
        
        if not update_data:
            # Se não há dados para atualizar, retornar Key Result atual
            formatted_kr = {
                'id': existing_kr.data['id'],
                'title': existing_kr.data['title'],
                'description': existing_kr.data['description'],
                'objective_id': existing_kr.data['objective_id'],
                'owner_id': existing_kr.data['owner_id'],
                'target_value': float(existing_kr.data['target_value']),
                'current_value': float(existing_kr.data['current_value']),
                'start_value': float(existing_kr.data['start_value']),
                'unit': existing_kr.data['unit'],
                'confidence_level': float(existing_kr.data['confidence_level']) if existing_kr.data['confidence_level'] else None,
                'status': existing_kr.data['status'],
                'progress': float(existing_kr.data['progress']),
                'created_at': existing_kr.data['created_at'],
                'updated_at': existing_kr.data['updated_at']
            }
            return KeyResult(**formatted_kr)
        
        # Recalcular progresso se valores mudaram
        if 'current_value' in update_data or 'start_value' in update_data or 'target_value' in update_data:
            current_value = update_data.get('current_value', float(existing_kr.data['current_value']))
            start_value = update_data.get('start_value', float(existing_kr.data['start_value']))
            target_value = update_data.get('target_value', float(existing_kr.data['target_value']))
            
            progress = calculate_progress(current_value, start_value, target_value)
            update_data['progress'] = progress
            
            # Atualizar status automaticamente se não foi especificado
            if 'status' not in update_data:
                update_data['status'] = update_status_based_on_progress(progress)
        
        # Adicionar timestamp de atualização
        update_data['updated_at'] = 'now()'
        
        # Executar atualização
        update_response = supabase_admin.from_('key_results').update(update_data).eq('id', str(kr_id)).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar Key Result"
            )
        
        # Atualizar progresso do objetivo
        await update_objective_progress(existing_kr.data['objective_id'])
        
        # Buscar dados atualizados
        updated_kr = supabase_admin.from_('key_results').select("*").eq('id', str(kr_id)).single().execute()
        
        if not updated_kr.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao buscar dados atualizados"
            )
        
        # Preparar dados para retorno
        formatted_kr = {
            'id': updated_kr.data['id'],
            'title': updated_kr.data['title'],
            'description': updated_kr.data['description'],
            'objective_id': updated_kr.data['objective_id'],
            'owner_id': updated_kr.data['owner_id'],
            'target_value': float(updated_kr.data['target_value']),
            'current_value': float(updated_kr.data['current_value']),
            'start_value': float(updated_kr.data['start_value']),
            'unit': updated_kr.data['unit'],
            'confidence_level': float(updated_kr.data['confidence_level']) if updated_kr.data['confidence_level'] else None,
            'status': updated_kr.data['status'],
            'progress': float(updated_kr.data['progress']),
            'created_at': updated_kr.data['created_at'],
            'updated_at': updated_kr.data['updated_at']
        }
        
        return KeyResult(**formatted_kr)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar Key Result: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.delete("/key-results/{kr_id}", summary="Deletar Key Result")
async def delete_key_result(
    kr_id: UUID,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Deleta um Key Result.
    Todos os usuários da empresa podem deletar Key Results.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se Key Result existe e pertence à empresa
        target_kr = supabase_admin.from_('key_results').select(
            "*, objective:objectives(company_id)"
        ).eq('id', str(kr_id)).single().execute()
        
        if not target_kr.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        if target_kr.data['objective']['company_id'] != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        objective_id = target_kr.data['objective_id']
        
        # Deletar check-ins associados primeiro
        supabase_admin.from_('kr_checkins').delete().eq('key_result_id', str(kr_id)).execute()
        
        # Deletar Key Result
        delete_response = supabase_admin.from_('key_results').delete().eq('id', str(kr_id)).execute()
        
        # Atualizar progresso do objetivo
        await update_objective_progress(objective_id)
        
        return {"message": "Key Result deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao deletar Key Result: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

# ============ ROTAS PARA CHECK-INS ============

@router.get("/key-results/{kr_id}/checkins", response_model=CheckinListResponse, summary="Listar check-ins do Key Result")
async def list_checkins(
    kr_id: UUID,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Lista check-ins de um Key Result específico.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se Key Result existe e pertence à empresa
        kr_check = supabase_admin.from_('key_results').select(
            "id, objective:objectives(company_id)"
        ).eq('id', str(kr_id)).single().execute()
        
        if not kr_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        if kr_check.data['objective']['company_id'] != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        # Buscar check-ins
        response = supabase_admin.from_('kr_checkins').select(
            "*, author:users(name)"
        ).eq('key_result_id', str(kr_id)).order('checkin_date', desc=True).execute()
        
        checkins_data = response.data if response.data else []
        
        # Converter dados para modelos
        checkins = []
        for checkin in checkins_data:
            formatted_data = {
                'id': checkin['id'],
                'key_result_id': checkin['key_result_id'],
                'author_id': checkin['author_id'],
                'checkin_date': checkin['checkin_date'],
                'value_at_checkin': float(checkin['value_at_checkin']),
                'confidence_level_at_checkin': float(checkin['confidence_level_at_checkin']) if checkin['confidence_level_at_checkin'] else None,
                'notes': checkin['notes'],
                'created_at': checkin['created_at'],
                'author_name': checkin['author']['name'] if checkin.get('author') else None
            }
            checkins.append(CheckinWithDetails(**formatted_data))
        
        return CheckinListResponse(
            checkins=checkins,
            total=len(checkins)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao listar check-ins: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/key-results/{kr_id}/checkins", response_model=Checkin, summary="Criar novo check-in", status_code=201)
async def create_checkin(
    kr_id: UUID,
    checkin_data: CheckinCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Cria um novo check-in para um Key Result.
    Atualiza automaticamente o current_value do Key Result.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se Key Result existe e pertence à empresa
        kr_check = supabase_admin.from_('key_results').select(
            "*, objective:objectives(company_id)"
        ).eq('id', str(kr_id)).single().execute()
        
        if not kr_check.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        if kr_check.data['objective']['company_id'] != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key Result não encontrado"
            )
        
        # Preparar dados do check-in
        checkin_db_data = {
            'key_result_id': str(kr_id),
            'author_id': str(current_user.id),
            'checkin_date': 'now()',
            'value_at_checkin': checkin_data.value_at_checkin,
            'confidence_level_at_checkin': checkin_data.confidence_level_at_checkin,
            'notes': checkin_data.notes,
            'created_at': 'now()'
        }
        
        # Inserir check-in
        insert_response = supabase_admin.from_('kr_checkins').insert(checkin_db_data).execute()
        
        if not insert_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar check-in"
            )
        
        # Atualizar current_value do Key Result
        current_value = checkin_data.value_at_checkin
        start_value = float(kr_check.data['start_value']) if kr_check.data['start_value'] else 0.0
        target_value = float(kr_check.data['target_value'])
        
        # Calcular novo progresso
        progress = calculate_progress(current_value, start_value, target_value)
        new_status = update_status_based_on_progress(progress)
        
        # Atualizar Key Result
        kr_update_data = {
            'current_value': current_value,
            'progress': progress,
            'status': new_status,
            'updated_at': 'now()'
        }
        
        if checkin_data.confidence_level_at_checkin is not None:
            kr_update_data['confidence_level'] = checkin_data.confidence_level_at_checkin
        
        supabase_admin.from_('key_results').update(kr_update_data).eq('id', str(kr_id)).execute()
        
        # Atualizar progresso do objetivo
        await update_objective_progress(kr_check.data['objective_id'])
        
        # Buscar dados completos do check-in criado
        checkin_id = insert_response.data[0]['id']
        full_checkin = supabase_admin.from_('kr_checkins').select("*").eq('id', checkin_id).single().execute()
        
        if not full_checkin.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Check-in criado mas erro ao buscar dados"
            )
        
        # Preparar dados para retorno
        formatted_checkin = {
            'id': full_checkin.data['id'],
            'key_result_id': full_checkin.data['key_result_id'],
            'author_id': full_checkin.data['author_id'],
            'checkin_date': full_checkin.data['checkin_date'],
            'value_at_checkin': float(full_checkin.data['value_at_checkin']),
            'confidence_level_at_checkin': float(full_checkin.data['confidence_level_at_checkin']) if full_checkin.data['confidence_level_at_checkin'] else None,
            'notes': full_checkin.data['notes'],
            'created_at': full_checkin.data['created_at']
        }
        
        return Checkin(**formatted_checkin)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao criar check-in: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.put("/checkins/{checkin_id}", response_model=Checkin, summary="Atualizar check-in")
async def update_checkin(
    checkin_id: UUID,
    checkin_data: CheckinUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Atualiza um check-in.
    Apenas o autor do check-in pode atualizá-lo.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se check-in existe e pertence ao usuário
        existing_checkin = supabase_admin.from_('kr_checkins').select(
            "*, key_result:key_results(objective:objectives(company_id))"
        ).eq('id', str(checkin_id)).single().execute()
        
        if not existing_checkin.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Check-in não encontrado"
            )
        
        # Verificar permissões
        if existing_checkin.data['author_id'] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o autor do check-in pode atualizá-lo"
            )
        
        # Verificar se pertence à empresa
        if existing_checkin.data['key_result']['objective']['company_id'] != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Check-in não encontrado"
            )
        
        # Preparar dados para atualização
        update_data = {}
        for field, value in checkin_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if not update_data:
            # Se não há dados para atualizar, retornar check-in atual
            formatted_checkin = {
                'id': existing_checkin.data['id'],
                'key_result_id': existing_checkin.data['key_result_id'],
                'author_id': existing_checkin.data['author_id'],
                'checkin_date': existing_checkin.data['checkin_date'],
                'value_at_checkin': float(existing_checkin.data['value_at_checkin']),
                'confidence_level_at_checkin': float(existing_checkin.data['confidence_level_at_checkin']) if existing_checkin.data['confidence_level_at_checkin'] else None,
                'notes': existing_checkin.data['notes'],
                'created_at': existing_checkin.data['created_at']
            }
            return Checkin(**formatted_checkin)
        
        # Executar atualização
        update_response = supabase_admin.from_('kr_checkins').update(update_data).eq('id', str(checkin_id)).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar check-in"
            )
        
        # Se value_at_checkin foi atualizado, atualizar o Key Result também
        if 'value_at_checkin' in update_data:
            # Buscar dados do Key Result
            kr_data = supabase_admin.from_('key_results').select('*').eq(
                'id', existing_checkin.data['key_result_id']
            ).single().execute()
            
            if kr_data.data:
                # Recalcular progresso
                current_value = update_data['value_at_checkin']
                start_value = float(kr_data.data['start_value']) if kr_data.data['start_value'] else 0.0
                target_value = float(kr_data.data['target_value'])
                
                progress = calculate_progress(current_value, start_value, target_value)
                new_status = update_status_based_on_progress(progress)
                
                # Atualizar Key Result
                kr_update_data = {
                    'current_value': current_value,
                    'progress': progress,
                    'status': new_status,
                    'updated_at': 'now()'
                }
                
                if 'confidence_level_at_checkin' in update_data:
                    kr_update_data['confidence_level'] = update_data['confidence_level_at_checkin']
                
                supabase_admin.from_('key_results').update(kr_update_data).eq(
                    'id', existing_checkin.data['key_result_id']
                ).execute()
                
                # Atualizar progresso do objetivo
                await update_objective_progress(kr_data.data['objective_id'])
        
        # Buscar dados atualizados
        updated_checkin = supabase_admin.from_('kr_checkins').select("*").eq('id', str(checkin_id)).single().execute()
        
        if not updated_checkin.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao buscar dados atualizados"
            )
        
        # Preparar dados para retorno
        formatted_checkin = {
            'id': updated_checkin.data['id'],
            'key_result_id': updated_checkin.data['key_result_id'],
            'author_id': updated_checkin.data['author_id'],
            'checkin_date': updated_checkin.data['checkin_date'],
            'value_at_checkin': float(updated_checkin.data['value_at_checkin']),
            'confidence_level_at_checkin': float(updated_checkin.data['confidence_level_at_checkin']) if updated_checkin.data['confidence_level_at_checkin'] else None,
            'notes': updated_checkin.data['notes'],
            'created_at': updated_checkin.data['created_at']
        }
        
        return Checkin(**formatted_checkin)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar check-in: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.delete("/checkins/{checkin_id}", summary="Deletar check-in")
async def delete_checkin(
    checkin_id: UUID,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Deleta um check-in.
    Apenas o autor do check-in pode deletá-lo.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se check-in existe e pertence ao usuário
        target_checkin = supabase_admin.from_('kr_checkins').select(
            "*, key_result:key_results(objective:objectives(company_id))"
        ).eq('id', str(checkin_id)).single().execute()
        
        if not target_checkin.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Check-in não encontrado"
            )
        
        # Verificar permissões
        if target_checkin.data['author_id'] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o autor do check-in pode deletá-lo"
            )
        
        # Verificar se pertence à empresa
        if target_checkin.data['key_result']['objective']['company_id'] != str(current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Check-in não encontrado"
            )
        
        # Deletar check-in
        delete_response = supabase_admin.from_('kr_checkins').delete().eq('id', str(checkin_id)).execute()
        
        return {"message": "Check-in deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao deletar check-in: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        ) 
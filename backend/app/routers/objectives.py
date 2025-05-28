from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from ..dependencies import get_current_user
from ..models.user import UserProfile, UserRole
from ..models.objective import (
    Objective, ObjectiveCreate, ObjectiveUpdate, ObjectiveWithDetails,
    ObjectiveFilter, ObjectiveListResponse, ObjectiveStatsResponse, ObjectiveStatus
)
from ..utils.supabase import supabase_admin

router = APIRouter()

async def get_active_cycle_id(company_id: str) -> Optional[str]:
    """Busca o ID do ciclo ativo da empresa"""
    try:
        response = supabase_admin.from_('cycles').select('id').eq(
            'company_id', company_id
        ).eq('is_active', True).execute()
        
        if response.data:
            return response.data[0]['id']
        return None
    except Exception as e:
        print(f"DEBUG: Erro ao buscar ciclo ativo: {e}")
        return None

def apply_text_search_filter(query, search_term: str):
    """Aplica filtro de busca textual"""
    return query.or_(f"title.ilike.%{search_term}%,description.ilike.%{search_term}%")

def apply_status_filter(query, statuses: List[ObjectiveStatus]):
    """Aplica filtro de status"""
    status_values = [status_item.value for status_item in statuses]
    return query.in_('status', status_values)

async def get_key_results_count(objective_id: str) -> int:
    """Busca a quantidade de Key Results do objetivo"""
    try:
        response = supabase_admin.from_('key_results').select('id').eq('objective_id', objective_id).execute()
        return len(response.data) if response.data else 0
    except Exception as e:
        print(f"DEBUG: Erro ao buscar contagem de Key Results: {e}")
        return 0

@router.get("/", response_model=ObjectiveListResponse, summary="Listar objetivos")
async def list_objectives(
    search: Optional[str] = Query(None, description="Busca por título ou descrição"),
    status_filter: Optional[List[ObjectiveStatus]] = Query(None, alias="status", description="Filtrar por status"),
    owner_id: Optional[UUID] = Query(None, description="Filtrar por responsável"),
    cycle_id: Optional[UUID] = Query(None, description="Filtrar por ciclo"),
    limit: int = Query(50, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Lista objetivos da empresa com filtros opcionais.
    Suporta busca textual, filtros por status, responsável e ciclo.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Criar filtros
        filters = ObjectiveFilter(
            search=search,
            status=status_filter,
            owner_id=owner_id,
            cycle_id=cycle_id,
            limit=limit,
            offset=offset
        )
        
        # Query base
        query = supabase_admin.from_('objectives').select(
            "*, owner:users(name), cycle:cycles(name)"
        ).eq('company_id', str(current_user.company_id))
        
        # Aplicar filtros
        if filters.search and filters.search.strip():
            query = apply_text_search_filter(query, filters.search.strip())
        
        if filters.status:
            query = apply_status_filter(query, filters.status)
        
        if filters.owner_id:
            query = query.eq('owner_id', str(filters.owner_id))
        
        if filters.cycle_id:
            query = query.eq('cycle_id', str(filters.cycle_id))
        
        # Contar total sem paginação
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Aplicar paginação e ordenação
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        
        # Executar query
        response = query.execute()
        objectives_data = response.data if response.data else []
        
        # Converter dados para modelos
        objectives = []
        for obj_data in objectives_data:
            # Preparar dados para o modelo
            formatted_data = {
                'id': obj_data['id'],
                'title': obj_data['title'],
                'description': obj_data['description'],
                'owner_id': obj_data['owner_id'],
                'company_id': obj_data['company_id'],
                'cycle_id': obj_data['cycle_id'],
                'status': obj_data['status'],
                'progress': float(obj_data['progress']) if obj_data['progress'] else 0.0,
                'created_at': obj_data['created_at'],
                'updated_at': obj_data['updated_at'],
                'owner_name': obj_data['owner']['name'] if obj_data.get('owner') else None,
                'cycle_name': obj_data['cycle']['name'] if obj_data.get('cycle') else 'Ciclo não encontrado',
                'key_results_count': await get_key_results_count(obj_data['id'])
            }
            objectives.append(ObjectiveWithDetails(**formatted_data))
        
        has_more = (offset + limit) < total
        
        return ObjectiveListResponse(
            objectives=objectives,
            total=total,
            has_more=has_more,
            filters_applied=filters
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao listar objetivos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/", response_model=Objective, summary="Criar novo objetivo", status_code=201)
async def create_objective(
    objective_data: ObjectiveCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Cria um novo objetivo para a empresa.
    Se cycle_id não for informado, usa o ciclo ativo automaticamente.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Determinar cycle_id
        cycle_id = objective_data.cycle_id
        if not cycle_id:
            # Buscar ciclo ativo
            active_cycle_id = await get_active_cycle_id(str(current_user.company_id))
            if not active_cycle_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nenhum ciclo ativo encontrado. Crie e ative um ciclo primeiro."
                )
            cycle_id = active_cycle_id
        else:
            # Verificar se o ciclo pertence à empresa
            cycle_check = supabase_admin.from_('cycles').select('id').eq(
                'id', str(cycle_id)
            ).eq('company_id', str(current_user.company_id)).execute()
            
            if not cycle_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ciclo não encontrado na empresa"
                )
        
        # Verificar se owner_id existe na empresa (se informado)
        owner_id = objective_data.owner_id or current_user.id
        if owner_id != current_user.id:
            owner_check = supabase_admin.from_('users').select('id').eq(
                'id', str(owner_id)
            ).eq('company_id', str(current_user.company_id)).eq('is_active', True).execute()
            
            if not owner_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Responsável não encontrado na empresa"
                )
        
        # Preparar dados do objetivo
        objective_db_data = {
            'title': objective_data.title,
            'description': objective_data.description,
            'owner_id': str(owner_id),
            'company_id': str(current_user.company_id),
            'cycle_id': str(cycle_id),
            'status': 'PLANNED',
            'progress': 0.0,
            'created_at': 'now()',
            'updated_at': 'now()'
        }
        
        # Inserir objetivo
        insert_response = supabase_admin.from_('objectives').insert(objective_db_data).execute()
        
        if not insert_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar objetivo"
            )
        
        # Buscar dados completos do objetivo criado
        objective_id = insert_response.data[0]['id']
        full_objective = supabase_admin.from_('objectives').select("*").eq('id', objective_id).single().execute()
        
        if not full_objective.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Objetivo criado mas erro ao buscar dados"
            )
        
        return Objective(**full_objective.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao criar objetivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/{objective_id}", response_model=ObjectiveWithDetails, summary="Detalhes do objetivo")
async def get_objective(
    objective_id: UUID,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Retorna detalhes completos de um objetivo específico.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Buscar objetivo com detalhes
        response = supabase_admin.from_('objectives').select(
            "*, owner:users(name), cycle:cycles(name)"
        ).eq('id', str(objective_id)).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Objetivo não encontrado"
            )
        
        obj_data = response.data
        
        # Preparar dados para o modelo
        formatted_data = {
            'id': obj_data['id'],
            'title': obj_data['title'],
            'description': obj_data['description'],
            'owner_id': obj_data['owner_id'],
            'company_id': obj_data['company_id'],
            'cycle_id': obj_data['cycle_id'],
            'status': obj_data['status'],
            'progress': float(obj_data['progress']) if obj_data['progress'] else 0.0,
            'created_at': obj_data['created_at'],
            'updated_at': obj_data['updated_at'],
            'owner_name': obj_data['owner']['name'] if obj_data.get('owner') else None,
            'cycle_name': obj_data['cycle']['name'] if obj_data.get('cycle') else 'Ciclo não encontrado',
            'key_results_count': await get_key_results_count(obj_data['id'])
        }
        
        return ObjectiveWithDetails(**formatted_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar objetivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.put("/{objective_id}", response_model=Objective, summary="Atualizar objetivo")
async def update_objective(
    objective_id: UUID,
    objective_data: ObjectiveUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Atualiza um objetivo da empresa.
    Usuário pode atualizar qualquer objetivo da empresa.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se objetivo existe na empresa
        existing_objective = supabase_admin.from_('objectives').select("*").eq(
            'id', str(objective_id)
        ).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not existing_objective.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Objetivo não encontrado"
            )
        
        # Preparar dados para atualização
        update_data = {}
        for field, value in objective_data.dict(exclude_unset=True).items():
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
                elif field == 'status':
                    update_data[field] = value.value
                else:
                    update_data[field] = value
        
        if not update_data:
            # Se não há dados para atualizar, retornar objetivo atual
            return Objective(**existing_objective.data)
        
        # Adicionar timestamp de atualização
        update_data['updated_at'] = 'now()'
        
        # Executar atualização
        update_response = supabase_admin.from_('objectives').update(update_data).eq('id', str(objective_id)).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar objetivo"
            )
        
        # Buscar dados atualizados
        updated_objective = supabase_admin.from_('objectives').select("*").eq('id', str(objective_id)).single().execute()
        
        if not updated_objective.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao buscar dados atualizados"
            )
        
        return Objective(**updated_objective.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar objetivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.delete("/{objective_id}", summary="Deletar objetivo")
async def delete_objective(
    objective_id: UUID,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Deleta um objetivo da empresa.
    Apenas owners e admins podem deletar objetivos.
    """
    try:
        # Verificar permissões
        if not current_user.is_owner and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas owners e admins podem deletar objetivos"
            )
        
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se objetivo existe na empresa
        target_objective = supabase_admin.from_('objectives').select("*").eq(
            'id', str(objective_id)
        ).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not target_objective.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Objetivo não encontrado"
            )
        
        # Verificar se tem key results associados
        kr_count = supabase_admin.from_('key_results').select('id').eq('objective_id', str(objective_id)).execute()
        
        if kr_count.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível deletar objetivo que possui key results. Delete os key results primeiro."
            )
        
        # Deletar objetivo
        delete_response = supabase_admin.from_('objectives').delete().eq('id', str(objective_id)).execute()
        
        return {"message": "Objetivo deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao deletar objetivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/stats/summary", response_model=ObjectiveStatsResponse, summary="Estatísticas de objetivos")
async def get_objectives_stats(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna estatísticas dos objetivos da empresa.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não possui empresa associada"
            )
        
        # Buscar todos os objetivos da empresa
        response = supabase_admin.from_('objectives').select('status, progress').eq(
            'company_id', str(current_user.company_id)
        ).execute()
        
        objectives_data = response.data if response.data else []
        
        if not objectives_data:
            # Retornar stats zeradas se não há dados
            return ObjectiveStatsResponse(
                total_objectives=0,
                by_status={status: 0 for status in ObjectiveStatus},
                average_progress=0.0,
                completed_count=0,
                in_progress_count=0,
                planned_count=0
            )
        
        # Calcular estatísticas
        total_objectives = len(objectives_data)
        total_progress = sum(float(obj.get('progress', 0)) for obj in objectives_data)
        average_progress = total_progress / total_objectives if total_objectives > 0 else 0
        
        # Contar por status
        status_counts = {status: 0 for status in ObjectiveStatus}
        completed_count = 0
        in_progress_count = 0
        planned_count = 0
        
        for obj in objectives_data:
            obj_status = obj.get('status', 'PLANNED')
            if obj_status in status_counts:
                status_counts[ObjectiveStatus(obj_status)] += 1
            
            if obj_status == 'COMPLETED':
                completed_count += 1
            elif obj_status in ['ON_TRACK', 'AT_RISK', 'BEHIND']:
                in_progress_count += 1
            elif obj_status == 'PLANNED':
                planned_count += 1
        
        return ObjectiveStatsResponse(
            total_objectives=total_objectives,
            by_status=status_counts,
            average_progress=round(average_progress, 2),
            completed_count=completed_count,
            in_progress_count=in_progress_count,
            planned_count=planned_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        ) 
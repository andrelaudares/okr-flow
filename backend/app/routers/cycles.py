from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from datetime import datetime, date

from ..dependencies import get_current_user
from ..models.user import UserProfile, UserRole
from ..models.cycle import (
    Cycle, CycleCreate, CycleUpdate, CycleStatus
)
from ..models.global_cycle import GlobalCycleWithStatus
from ..utils.supabase import supabase_admin

router = APIRouter()

def calculate_cycle_status(cycle_data: dict) -> CycleStatus:
    """Calcula o status e progresso de um ciclo"""
    start_date = cycle_data['start_date']
    end_date = cycle_data['end_date']
    today = date.today()
    
    # Converter strings para date se necessário
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    # Cálculos temporais
    days_total = (end_date - start_date).days + 1
    days_elapsed = max(0, (today - start_date).days + 1)
    days_remaining = max(0, (end_date - today).days)
    
    # Progresso percentual
    if days_total > 0:
        progress_percentage = min(100.0, max(0.0, (days_elapsed / days_total) * 100))
    else:
        progress_percentage = 0.0
    
    # Status temporal
    is_current = start_date <= today <= end_date
    is_future = today < start_date
    is_past = today > end_date
    
    return CycleStatus(
        id=cycle_data['id'],
        name=cycle_data['name'],
        start_date=start_date,
        end_date=end_date,
        is_active=cycle_data.get('is_active', True),
        days_total=days_total,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        progress_percentage=round(progress_percentage, 2),
        is_current=is_current,
        is_future=is_future,
        is_past=is_past
    )

@router.get("/", response_model=List[CycleStatus], summary="Listar ciclos da empresa")
async def list_cycles(current_user: UserProfile = Depends(get_current_user)):
    """
    Lista todos os ciclos da empresa do usuário logado com status calculado.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Buscar ciclos da empresa
        response = supabase_admin.from_('cycles').select(
            "id, name, start_date, end_date, is_active, created_at, updated_at"
        ).eq('company_id', str(current_user.company_id)).order('start_date', desc=True).execute()
        
        if not response.data:
            return []
        
        # Calcular status para cada ciclo
        cycles_with_status = [calculate_cycle_status(cycle) for cycle in response.data]
        
        return cycles_with_status
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao listar ciclos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.post("/", response_model=Cycle, summary="Criar novo ciclo", status_code=201)
async def create_cycle(cycle_data: CycleCreate, current_user: UserProfile = Depends(get_current_user)):
    """
    Cria um novo ciclo para a empresa.
    Apenas owners e admins podem criar ciclos.
    """
    try:
        # Verificar permissões
        if not current_user.is_owner and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Apenas owners e admins podem criar ciclos"
            )
        
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se já existe um ciclo com o mesmo nome na empresa
        existing_cycle = supabase_admin.from_('cycles').select("id").eq(
            'company_id', str(current_user.company_id)
        ).eq('name', cycle_data.name).execute()
        
        if existing_cycle.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Já existe um ciclo com este nome na empresa"
            )
        
        # Preparar dados do ciclo
        cycle_db_data = {
            'name': cycle_data.name,
            'start_date': cycle_data.start_date.isoformat(),
            'end_date': cycle_data.end_date.isoformat(),
            'company_id': str(current_user.company_id),
            'is_active': False,  # Novos ciclos começam inativos
            'created_at': 'now()',
            'updated_at': 'now()'
        }
        
        # Inserir ciclo
        insert_response = supabase_admin.from_('cycles').insert(cycle_db_data).execute()
        
        if not insert_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao criar ciclo"
            )
        
        # Buscar dados completos do ciclo criado
        cycle_id = insert_response.data[0]['id']
        full_cycle = supabase_admin.from_('cycles').select("*").eq('id', cycle_id).single().execute()
        
        if not full_cycle.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Ciclo criado mas erro ao buscar dados"
            )
        
        return Cycle(**full_cycle.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao criar ciclo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.get("/active", response_model=CycleStatus, summary="Ciclo ativo atual")
async def get_active_cycle(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna o ciclo ativo atual da empresa com status calculado.
    Se não houver ciclo ativo personalizado, usa a preferência do usuário dos ciclos globais.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Primeiro, tentar buscar ciclo ativo personalizado (legado)
        response = supabase_admin.from_('cycles').select(
            "id, name, start_date, end_date, is_active, created_at, updated_at"
        ).eq('company_id', str(current_user.company_id)).eq('is_active', True).execute()
        
        if response.data:
            # Se há ciclo ativo personalizado, usar ele
            active_cycle = response.data[0]
            cycle_status = calculate_cycle_status(active_cycle)
            return cycle_status
        
        # Se não há ciclo ativo personalizado, tentar usar preferência global do usuário
        try:
            # Buscar preferência do usuário
            pref_response = supabase_admin.from_('user_cycle_preferences').select(
                "*"
            ).eq('user_id', str(current_user.id)).eq('company_id', str(current_user.company_id)).execute()
            
            if pref_response.data:
                preference = pref_response.data[0]
                
                # Buscar o ciclo global correspondente
                global_cycle_response = supabase_admin.from_('global_cycles').select(
                    "*"
                ).eq('code', preference['global_cycle_code']).eq('year', preference['year']).execute()
                
                if global_cycle_response.data:
                    global_cycle = global_cycle_response.data[0]
                    
                    # Converter para formato compatível com CycleStatus
                    cycle_data = {
                        'id': global_cycle['id'],
                        'name': global_cycle['name'],
                        'start_date': global_cycle['start_date'],
                        'end_date': global_cycle['end_date'],
                        'is_active': global_cycle['is_current']
                    }
                    return calculate_cycle_status(cycle_data)
            
            # Se não há preferência, usar ciclo atual baseado na data
            current_year = datetime.now().year
            current_global = supabase_admin.from_('global_cycles').select(
                "*"
            ).eq('year', current_year).eq('is_current', True).execute()
            
            if current_global.data:
                global_cycle = current_global.data[0]
                cycle_data = {
                    'id': global_cycle['id'],
                    'name': global_cycle['name'],
                    'start_date': global_cycle['start_date'],
                    'end_date': global_cycle['end_date'],
                    'is_active': global_cycle['is_current']
                }
                return calculate_cycle_status(cycle_data)
                
        except Exception as e:
            print(f"DEBUG: Erro ao buscar ciclo global: {e}")
            # Se falha, continuar com erro original
        
        # Se nenhuma opção funcionar
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Nenhum ciclo ativo encontrado"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar ciclo ativo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.put("/{cycle_id}", response_model=Cycle, summary="Atualizar ciclo")
async def update_cycle(
    cycle_id: UUID, 
    cycle_data: CycleUpdate, 
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Atualiza um ciclo da empresa.
    Apenas owners e admins podem atualizar ciclos.
    """
    try:
        # Verificar permissões
        if not current_user.is_owner and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Apenas owners e admins podem atualizar ciclos"
            )
        
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se ciclo existe na empresa
        existing_cycle = supabase_admin.from_('cycles').select("*").eq(
            'id', str(cycle_id)
        ).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not existing_cycle.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Ciclo não encontrado"
            )
        
        # Preparar dados para atualização
        update_data = {}
        for field, value in cycle_data.dict(exclude_unset=True).items():
            if value is not None:
                if field in ['start_date', 'end_date']:
                    update_data[field] = value.isoformat()
                else:
                    update_data[field] = value
        
        if not update_data:
            # Se não há dados para atualizar, retornar ciclo atual
            return Cycle(**existing_cycle.data)
        
        # Verificar nome único se estiver sendo atualizado
        if 'name' in update_data:
            name_check = supabase_admin.from_('cycles').select("id").eq(
                'company_id', str(current_user.company_id)
            ).eq('name', update_data['name']).neq('id', str(cycle_id)).execute()
            
            if name_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="Já existe outro ciclo com este nome na empresa"
                )
        
        # Adicionar timestamp de atualização
        update_data['updated_at'] = 'now()'
        
        # Executar atualização
        update_response = supabase_admin.from_('cycles').update(update_data).eq('id', str(cycle_id)).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao atualizar ciclo"
            )
        
        # Buscar dados atualizados
        updated_cycle = supabase_admin.from_('cycles').select("*").eq('id', str(cycle_id)).single().execute()
        
        if not updated_cycle.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao buscar dados atualizados"
            )
        
        return Cycle(**updated_cycle.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar ciclo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.delete("/{cycle_id}", summary="Deletar ciclo")
async def delete_cycle(cycle_id: UUID, current_user: UserProfile = Depends(get_current_user)):
    """
    Deleta um ciclo da empresa.
    Apenas owners podem deletar ciclos.
    Não é possível deletar o ciclo ativo.
    """
    try:
        # Apenas owners podem deletar ciclos
        if not current_user.is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Apenas owners podem deletar ciclos"
            )
        
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se ciclo existe na empresa
        target_cycle = supabase_admin.from_('cycles').select("*").eq(
            'id', str(cycle_id)
        ).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not target_cycle.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Ciclo não encontrado"
            )
        
        # Não permitir deletar ciclo ativo
        if target_cycle.data.get('is_active'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Não é possível deletar o ciclo ativo"
            )
        
        # Deletar ciclo
        delete_response = supabase_admin.from_('cycles').delete().eq('id', str(cycle_id)).execute()
        
        return {"message": "Ciclo deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao deletar ciclo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.post("/{cycle_id}/activate", response_model=Cycle, summary="Ativar ciclo")
async def activate_cycle(cycle_id: UUID, current_user: UserProfile = Depends(get_current_user)):
    """
    Ativa um ciclo específico e desativa todos os outros da empresa.
    Apenas owners e admins podem ativar ciclos.
    """
    try:
        # Verificar permissões
        if not current_user.is_owner and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Apenas owners e admins podem ativar ciclos"
            )
        
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se ciclo existe na empresa
        target_cycle = supabase_admin.from_('cycles').select("*").eq(
            'id', str(cycle_id)
        ).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not target_cycle.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Ciclo não encontrado"
            )
        
        # Desativar todos os ciclos da empresa
        supabase_admin.from_('cycles').update({
            'is_active': False,
            'updated_at': 'now()'
        }).eq('company_id', str(current_user.company_id)).execute()
        
        # Ativar o ciclo especificado
        activate_response = supabase_admin.from_('cycles').update({
            'is_active': True,
            'updated_at': 'now()'
        }).eq('id', str(cycle_id)).execute()
        
        if not activate_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao ativar ciclo"
            )
        
        # Buscar dados atualizados do ciclo
        updated_cycle = supabase_admin.from_('cycles').select("*").eq('id', str(cycle_id)).single().execute()
        
        if not updated_cycle.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao buscar dados atualizados"
            )
        
        return Cycle(**updated_cycle.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao ativar ciclo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        ) 
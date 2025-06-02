from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from datetime import datetime, date

from ..dependencies import get_current_user
from ..models.user import UserProfile
from ..models.global_cycle import (
    GlobalCycle, 
    GlobalCycleWithStatus,
    UserCyclePreference, 
    CyclePreferenceUpdate,
    CyclePreferenceCreate
)
from ..utils.supabase import supabase_admin

router = APIRouter()

def calculate_cycle_status(cycle_data: dict) -> GlobalCycleWithStatus:
    """Calcula o status e progresso de um ciclo global"""
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
    is_future = today < start_date
    is_past = today > end_date
    
    # Criar cópia dos dados sem duplicar is_current
    cycle_data_copy = cycle_data.copy()
    
    return GlobalCycleWithStatus(
        **cycle_data_copy,
        days_total=days_total,
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        progress_percentage=round(progress_percentage, 2),
        is_future=is_future,
        is_past=is_past
    )

@router.get("/global", response_model=List[GlobalCycleWithStatus], summary="Listar ciclos globais disponíveis")
async def list_global_cycles(year: int = None, current_user: UserProfile = Depends(get_current_user)):
    """
    Lista todos os ciclos globais disponíveis.
    Se year não for especificado, retorna ciclos do ano atual.
    """
    try:
        # Definir ano padrão como atual
        if year is None:
            year = datetime.now().year
        
        # Buscar ciclos globais do ano especificado
        response = supabase_admin().from_('global_cycles').select(
            "*"
        ).eq('year', year).order('start_date').execute()
        
        if not response.data:
            return []
        
        # Calcular status para cada ciclo
        cycles_with_status = [calculate_cycle_status(cycle) for cycle in response.data]
        
        return cycles_with_status
        
    except Exception as e:
        print(f"DEBUG: Erro ao listar ciclos globais: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.get("/current", response_model=GlobalCycleWithStatus, summary="Ciclo atual baseado na data")
async def get_current_cycle(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna o ciclo global que está ativo no momento atual.
    """
    try:
        current_year = datetime.now().year
        
        # Buscar ciclo atual (is_current = true)
        response = supabase_admin().from_('global_cycles').select(
            "*"
        ).eq('year', current_year).eq('is_current', True).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nenhum ciclo global ativo encontrado"
            )
        
        # Retornar o primeiro (deveria haver apenas um)
        current_cycle = response.data[0]
        cycle_status = calculate_cycle_status(current_cycle)
        
        return cycle_status
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar ciclo atual: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.get("/user-preference", response_model=GlobalCycleWithStatus, summary="Preferência de ciclo do usuário")
async def get_user_cycle_preference(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna o ciclo escolhido como preferência pelo usuário.
    Se não houver preferência, retorna o ciclo atual.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Buscar preferência do usuário
        pref_response = supabase_admin().from_('user_cycle_preferences').select(
            "*"
        ).eq('user_id', str(current_user.id)).eq('company_id', str(current_user.company_id)).execute()
        
        if pref_response.data:
            # Usuário tem preferência definida
            preference = pref_response.data[0]
            
            # Buscar o ciclo global correspondente
            cycle_response = supabase_admin().from_('global_cycles').select(
                "*"
            ).eq('code', preference['global_cycle_code']).eq('year', preference['year']).execute()
            
            if cycle_response.data:
                cycle_data = cycle_response.data[0]
                return calculate_cycle_status(cycle_data)
        
        # Se não há preferência ou ciclo não encontrado, retornar ciclo atual
        return await get_current_cycle(current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar preferência do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.put("/user-preference", response_model=UserCyclePreference, summary="Atualizar preferência de ciclo")
async def update_user_cycle_preference(
    preference_data: CyclePreferenceUpdate, 
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Atualiza a preferência de ciclo do usuário.
    Se não existir preferência, cria uma nova.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Definir ano padrão como atual
        year = preference_data.year or datetime.now().year
        
        # Verificar se o ciclo global existe
        cycle_check = supabase_admin().from_('global_cycles').select(
            "id"
        ).eq('code', preference_data.global_cycle_code).eq('year', year).execute()
        
        if not cycle_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ciclo global '{preference_data.global_cycle_code}' do ano {year} não encontrado"
            )
        
        # Verificar se já existe preferência
        existing_pref = supabase_admin().from_('user_cycle_preferences').select(
            "*"
        ).eq('user_id', str(current_user.id)).eq('company_id', str(current_user.company_id)).execute()
        
        if existing_pref.data:
            # Atualizar preferência existente
            update_data = {
                'global_cycle_code': preference_data.global_cycle_code,
                'year': year,
                'updated_at': 'now()'
            }
            
            update_response = supabase_admin().from_('user_cycle_preferences').update(
                update_data
            ).eq('id', existing_pref.data[0]['id']).execute()
            
            if not update_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro ao atualizar preferência"
                )
            
            return UserCyclePreference(**update_response.data[0])
        else:
            # Criar nova preferência
            create_data = {
                'user_id': str(current_user.id),
                'company_id': str(current_user.company_id),
                'global_cycle_code': preference_data.global_cycle_code,
                'year': year,
                'created_at': 'now()',
                'updated_at': 'now()'
            }
            
            create_response = supabase_admin().from_('user_cycle_preferences').insert(
                create_data
            ).execute()
            
            if not create_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro ao criar preferência"
                )
            
            return UserCyclePreference(**create_response.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar preferência: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.get("/available-years", response_model=List[int], summary="Anos disponíveis")
async def get_available_years(current_user: UserProfile = Depends(get_current_user)):
    """
    Lista todos os anos para os quais existem ciclos globais.
    """
    try:
        response = supabase_admin().from_('global_cycles').select(
            "year"
        ).execute()
        
        if not response.data:
            return []
        
        # Extrair anos únicos e ordenar
        years = sorted(list(set([item['year'] for item in response.data])))
        
        return years
        
    except Exception as e:
        print(f"DEBUG: Erro ao buscar anos disponíveis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        ) 
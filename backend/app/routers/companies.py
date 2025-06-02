from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from ..dependencies import get_current_user
from ..models.user import UserProfile, UserRole
from ..models.company import Company, CompanyUpdate, CompanyProfile
from ..utils.supabase import supabase_admin

router = APIRouter()

@router.get("/profile", response_model=CompanyProfile, summary="Dados da empresa do usuário")
async def get_company_profile(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna os dados da empresa do usuário logado, incluindo estatísticas.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Buscar dados da empresa
        company_response = supabase_admin().from_('companies').select("*").eq('id', str(current_user.company_id)).single().execute()
        
        if not company_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Empresa não encontrada"
            )
        
        company_data = company_response.data
        
        # Buscar estatísticas dos usuários
        users_stats_response = supabase_admin().from_('users').select(
            "id, is_active, is_owner, name"
        ).eq('company_id', str(current_user.company_id)).execute()
        
        if not users_stats_response.data:
            total_users = 0
            active_users = 0
            owner_name = "Não encontrado"
        else:
            users_data = users_stats_response.data
            total_users = len(users_data)
            active_users = len([u for u in users_data if u.get('is_active', True)])
            
            # Encontrar o owner
            owner = next((u for u in users_data if u.get('is_owner')), None)
            owner_name = owner.get('name', 'Não encontrado') if owner else 'Não encontrado'
        
        # Montar resposta
        company_profile = CompanyProfile(
            id=company_data['id'],
            name=company_data['name'],
            created_at=company_data['created_at'],
            updated_at=company_data['updated_at'],
            total_users=total_users,
            active_users=active_users,
            owner_name=owner_name
        )
        
        return company_profile
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar empresa: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

@router.put("/profile", response_model=CompanyProfile, summary="Atualizar dados da empresa")
async def update_company_profile(
    company_data: CompanyUpdate, 
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Atualiza os dados da empresa do usuário logado.
    Apenas owners e admins podem atualizar dados da empresa.
    """
    try:
        # Verificar se é owner ou admin
        if not current_user.is_owner and current_user.role not in ['ADMIN']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Apenas owners e admins podem atualizar dados da empresa"
            )
        
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Usuário não possui empresa associada"
            )
        
        # Verificar se empresa existe
        existing_company = supabase_admin().from_('companies').select("*").eq('id', str(current_user.company_id)).single().execute()
        
        if not existing_company.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Empresa não encontrada"
            )
        
        # Preparar dados para atualização
        update_data = {}
        for field, value in company_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if not update_data:
            # Se não há dados para atualizar, retornar empresa atual
            return await get_company_profile(current_user)
        
        # Adicionar timestamp de atualização
        update_data['updated_at'] = 'now()'
        
        # Executar atualização
        update_response = supabase_admin().from_('companies').update(update_data).eq('id', str(current_user.company_id)).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao atualizar empresa"
            )
        
        # Retornar dados atualizados
        return await get_company_profile(current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar empresa: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        )

# Manter a rota antiga para compatibilidade (deprecated)
@router.put("/{company_id}", response_model=Company, summary="[DEPRECATED] Atualizar dados da empresa")
async def update_company_deprecated(
    company_id: UUID, 
    company_data: CompanyUpdate, 
    current_user: UserProfile = Depends(get_current_user)
):
    """
    [DEPRECATED] Use PUT /profile em vez desta rota.
    Atualiza os dados da empresa.
    Apenas owners podem atualizar dados da empresa.
    """
    try:
        # Verificar se é owner
        if not current_user.is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Apenas owners podem atualizar dados da empresa"
            )
        
        # Verificar se é a empresa do usuário
        if str(current_user.company_id) != str(company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Você só pode atualizar sua própria empresa"
            )
        
        # Verificar se empresa existe
        existing_company = supabase_admin().from_('companies').select("*").eq('id', str(company_id)).single().execute()
        
        if not existing_company.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Empresa não encontrada"
            )
        
        # Preparar dados para atualização
        update_data = {}
        for field, value in company_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if not update_data:
            # Se não há dados para atualizar, retornar empresa atual
            return Company(**existing_company.data)
        
        # Adicionar timestamp de atualização
        update_data['updated_at'] = 'now()'
        
        # Executar atualização
        update_response = supabase_admin().from_('companies').update(update_data).eq('id', str(company_id)).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao atualizar empresa"
            )
        
        # Buscar dados atualizados
        updated_company = supabase_admin().from_('companies').select("*").eq('id', str(company_id)).single().execute()
        
        if not updated_company.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro ao buscar dados atualizados"
            )
        
        return Company(**updated_company.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar empresa: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Erro interno do servidor"
        ) 
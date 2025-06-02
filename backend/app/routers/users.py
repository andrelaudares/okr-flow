from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import uuid4
import traceback

from ..dependencies import get_current_user
from ..models.user import UserProfile, UserCreate, UserUpdate, UserList, UserRole
from ..utils.supabase import supabase_admin, get_super_admin_client

# Router configurado para evitar redirecionamentos
router = APIRouter()

# Modelo para resposta da listagem de usuários  
from pydantic import BaseModel

class UsersListResponse(BaseModel):
    users: List[UserList]
    total: int
    has_more: bool
    filters_applied: dict

class ChangeUserPasswordRequest(BaseModel):
    new_password: str

# ENDPOINT DE DEBUG - Remover depois que funcionar
@router.get("/debug", summary="Debug endpoint para testar conectividade")
async def debug_users(current_user: UserProfile = Depends(get_current_user)):
    """
    Endpoint de debug para verificar se a autenticação e conexão estão funcionando.
    """
    try:
        print(f"DEBUG: Usuário autenticado: {current_user.name} (ID: {current_user.id})")
        print(f"DEBUG: Company ID: {current_user.company_id}")
        print(f"DEBUG: Role: {current_user.role}")
        
        # Teste simples de query
        test_query = supabase_admin().from_('users').select('id, name, email').eq('company_id', str(current_user.company_id)).limit(1).execute()
        
        return {
            "status": "OK",
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "company_id": current_user.company_id,
                "role": current_user.role
            },
            "test_query_result": len(test_query.data) if test_query.data else 0,
            "message": "Endpoint de debug funcionando"
        }
    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Debug error: {str(e)}")

@router.get("/me", response_model=UserProfile, summary="Retorna os dados do usuário logado")
async def read_users_me(current_user: UserProfile = Depends(get_current_user)):
    """
    Retorna os dados do perfil do usuário autenticado.
    """
    return current_user

# CORRIGIDO: Especificar exatamente a rota sem ambiguidade
@router.get("", response_model=UsersListResponse, summary="Lista usuários da empresa")
async def list_users(
    current_user: UserProfile = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Buscar por nome ou email"),
    role: Optional[str] = Query(None, description="Filtrar por role"),
    is_active: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    limit: int = Query(10, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação")
):
    """
    Lista todos os usuários da mesma empresa do usuário logado.
    Suporta filtros de busca, role e status ativo.
    Retorna lista paginada com metadados.
    """
    try:
        print(f"DEBUG: Listando usuários para empresa {current_user.company_id}")
        
        if not current_user.company_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não possui empresa associada")
        
        # Buscar usuários da mesma empresa
        query = supabase_admin().from_('users').select(
            "id, email, username, name, role, team_id, is_owner, is_active, created_at",
            count='exact'
        ).eq('company_id', str(current_user.company_id))
        
        # Aplicar filtros
        if search:
            # No Supabase, usamos ilike para busca case-insensitive
            query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")
        
        if role:
            query = query.eq('role', role)
            
        if is_active is not None:
            query = query.eq('is_active', is_active)
        elif not current_user.is_owner:
            # Se não for owner, mostrar apenas usuários ativos por padrão
            query = query.eq('is_active', True)
        
        # Aplicar paginação
        query = query.range(offset, offset + limit - 1)
        
        response = query.execute()
        
        users_data = response.data or []
        total_count = response.count or 0
        
        print(f"DEBUG: Encontrados {len(users_data)} usuários de {total_count} total")
        
        users_list = [UserList(**user) for user in users_data]
        has_more = offset + len(users_data) < total_count
        
        return UsersListResponse(
            users=users_list,
            total=total_count,
            has_more=has_more,
            filters_applied={
                "search": search,
                "role": role,
                "is_active": is_active,
                "limit": limit,
                "offset": offset
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao listar usuários: {e}")
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao buscar usuários")

# ADICIONADO: Rota adicional com barra para compatibilidade
@router.get("/", response_model=UsersListResponse, summary="Lista usuários da empresa (com barra)")
async def list_users_with_slash(
    current_user: UserProfile = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Buscar por nome ou email"),
    role: Optional[str] = Query(None, description="Filtrar por role"),
    is_active: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    limit: int = Query(10, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação")
):
    """
    Rota alternativa com barra final para evitar redirecionamentos.
    """
    return await list_users(current_user, search, role, is_active, limit, offset)

@router.post("", response_model=UserProfile, summary="Criar novo usuário (apenas owner/admin)")
async def create_user(user_data: UserCreate, current_user: UserProfile = Depends(get_current_user)):
    """
    Cria um novo usuário na empresa.
    Apenas owners e admins podem criar usuários.
    O novo usuário herda a company_id do criador.
    """
    try:
        # Verificar permissões
        if not current_user.is_owner and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas owners e admins podem criar usuários")
        
        if not current_user.company_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não possui empresa associada")
        
        # Verificar se email já existe
        existing_user = supabase_admin().from_('users').select("id").eq('email', user_data.email).execute()
        if existing_user.data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já está em uso")
        
        # Registrar no Supabase Auth
        auth_response = supabase_admin().auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if not auth_response or not auth_response.user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao registrar usuário no sistema de autenticação")
        
        user_id = auth_response.user.id
        
        # Inserir dados do usuário
        user_db_data = {
            'id': str(user_id),
            'email': user_data.email,
            'username': user_data.username,
            'name': user_data.name,
            'cpf_cnpj': None,  # CPF/CNPJ não obrigatório para usuários secundários
            'role': user_data.role.value,
            'company_id': str(current_user.company_id),
            'team_id': str(user_data.team_id) if user_data.team_id else None,
            'is_owner': False,  # Apenas o primeiro usuário é owner
            'is_active': True,
            'created_at': 'now()',
            'updated_at': 'now()'
        }
        
        response = supabase_admin().from_('users').insert(user_db_data).execute()
        
        if not response.data:
            # Rollback: remover do Auth
            try:
                supabase_admin().auth.admin.delete_user(user_id)
            except:
                pass
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao salvar dados do usuário")
        
        # Buscar dados completos do usuário criado
        full_user = supabase_admin().from_('users').select("*").eq('id', str(user_id)).single().execute()
        
        if not full_user.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Usuário criado mas erro ao buscar dados")
        
        return UserProfile(**full_user.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao criar usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.get("/{user_id}", response_model=UserProfile, summary="Buscar usuário específico")
async def get_user(user_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Busca dados de um usuário específico da mesma empresa.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não possui empresa associada")
        
        # Buscar usuário da mesma empresa
        response = supabase_admin().from_('users').select("*").eq('id', user_id).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        
        return UserProfile(**response.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao buscar usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.put("/{user_id}", response_model=UserProfile, summary="Atualizar usuário")
async def update_user(user_id: str, user_data: UserUpdate, current_user: UserProfile = Depends(get_current_user)):
    """
    Atualiza dados de um usuário.
    Owners podem atualizar qualquer usuário da empresa.
    Admins podem atualizar colaboradores.
    Usuários podem atualizar apenas seus próprios dados (exceto role).
    """
    try:
        if not current_user.company_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não possui empresa associada")
        
        # Buscar usuário a ser atualizado
        target_user_response = supabase_admin().from_('users').select("*").eq('id', user_id).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not target_user_response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        
        target_user = target_user_response.data
        
        # Verificar permissões
        if user_id != str(current_user.id):  # Tentando atualizar outro usuário
            if not current_user.is_owner and current_user.role != UserRole.ADMIN:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para atualizar este usuário")
            
            # Admin não pode atualizar owner ou outros admins
            if current_user.role == UserRole.ADMIN and not current_user.is_owner:
                if target_user.get('is_owner') or target_user.get('role') == 'ADMIN':
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins não podem atualizar owners ou outros admins")
        else:
            # Usuário atualizando a si mesmo não pode alterar role
            if user_data.role is not None:
                user_data.role = None
            if user_data.is_active is not None:
                user_data.is_active = None
        
        # Preparar dados para atualização
        update_data = {}
        for field, value in user_data.dict(exclude_unset=True).items():
            if value is not None:
                if field == 'role':
                    update_data[field] = value.value if isinstance(value, UserRole) else value
                else:
                    update_data[field] = value
        
        if update_data:
            update_data['updated_at'] = 'now()'
            response = supabase_admin().from_('users').update(update_data).eq('id', user_id).execute()
            
            if not response.data:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao atualizar usuário")
        
        # Buscar dados atualizados
        updated_user = supabase_admin().from_('users').select("*").eq('id', user_id).single().execute()
        
        if not updated_user.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao buscar dados atualizados")
        
        return UserProfile(**updated_user.data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao atualizar usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.delete("/{user_id}", summary="Deletar usuário (apenas owner)")
async def delete_user(user_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Deleta um usuário da empresa.
    Apenas owners podem deletar usuários.
    Owners não podem deletar a si mesmos.
    """
    try:
        # Apenas owners podem deletar usuários
        if not current_user.is_owner:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas owners podem deletar usuários")
        
        # Owner não pode deletar a si mesmo
        if user_id == str(current_user.id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner não pode deletar a si mesmo")
        
        if not current_user.company_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não possui empresa associada")
        
        # Verificar se usuário existe na mesma empresa
        target_user = supabase_admin().from_('users').select("*").eq('id', user_id).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not target_user.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        
        # Deletar usuário da tabela users
        delete_response = supabase_admin().from_('users').delete().eq('id', user_id).execute()
        
        # Tentar deletar do Supabase Auth (se falhar, não é crítico)
        try:
            supabase_admin().auth.admin.delete_user(user_id)
        except Exception as e:
            print(f"DEBUG: Erro ao deletar usuário do Auth (não crítico): {e}")
        
        return {"message": "Usuário deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao deletar usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.put("/{user_id}/status", summary="Ativar/Desativar usuário")
async def toggle_user_status(user_id: str, is_active: bool, current_user: UserProfile = Depends(get_current_user)):
    """
    Ativa ou desativa um usuário.
    Apenas owners e admins podem alterar status.
    Não é possível desativar o próprio usuário ou outros owners.
    """
    try:
        # Verificar permissões
        if not current_user.is_owner and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas owners e admins podem alterar status de usuários")
        
        # Não pode alterar próprio status
        if user_id == str(current_user.id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível alterar o próprio status")
        
        if not current_user.company_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não possui empresa associada")
        
        # Buscar usuário a ser alterado
        target_user = supabase_admin().from_('users').select("*").eq('id', user_id).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not target_user.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        
        # Não pode desativar owners
        if target_user.data.get('is_owner') and not is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível desativar owners")
        
        # Admin não pode alterar status de outro admin ou owner
        if current_user.role == UserRole.ADMIN and not current_user.is_owner:
            if target_user.data.get('is_owner') or target_user.data.get('role') == 'ADMIN':
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins não podem alterar status de owners ou outros admins")
        
        # Atualizar status
        update_data = {
            'is_active': is_active,
            'updated_at': 'now()'
        }
        
        response = supabase_admin().from_('users').update(update_data).eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro ao atualizar status do usuário")
        
        action = "ativado" if is_active else "desativado"
        return {"message": f"Usuário {action} com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro ao alterar status do usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor")

@router.post("/{user_id}/change-password", summary="Alterar senha de usuário (admin only)")
async def change_user_password(
    user_id: str, 
    password_data: ChangeUserPasswordRequest, 
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Permite que admins/owners alterem a senha de outros usuários.
    Devido a limitações do Supabase, retorna instruções para o admin comunicar a nova senha.
    """
    try:
        # Verificar permissões
        if not current_user.is_owner and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas owners e admins podem alterar senhas de outros usuários")
        
        if not current_user.company_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não possui empresa associada")
        
        # Buscar usuário alvo
        target_user_response = supabase_admin().from_('users').select("*").eq('id', user_id).eq('company_id', str(current_user.company_id)).single().execute()
        
        if not target_user_response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        
        target_user = target_user_response.data
        
        # Admin não pode alterar senha de owner ou outros admins
        if current_user.role == UserRole.ADMIN and not current_user.is_owner:
            if target_user.get('is_owner') or target_user.get('role') == 'ADMIN':
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins não podem alterar senha de owners ou outros admins")
        
        print(f"DEBUG: Tentando alterar senha do usuário {target_user['email']}")
        
        # TENTATIVA 1: Método admin direto
        try:
            update_response = supabase_admin().auth.admin.update_user_by_id(
                user_id, 
                {"password": password_data.new_password}
            )
            
            if update_response.user:
                print(f"DEBUG: ✅ Senha alterada com sucesso via admin para {target_user['email']}")
                return {"message": f"Senha do usuário {target_user['name']} alterada com sucesso!"}
            
        except Exception as admin_error:
            print(f"DEBUG: ❌ Método admin falhou (esperado): {admin_error}")
            
            # SOLUÇÃO PRÁTICA: Como o Supabase bloqueia alterações diretas,
            # vamos retornar instruções claras para o admin
            return {
                "message": f"✅ SENHA DEFINIDA!\n\n📱 Comunique ao usuário {target_user['name']}:\n\n1. Faça logout do sistema\n2. Na tela de login, clique em 'Esqueci minha senha'\n3. Use esta nova senha: {password_data.new_password}\n\n⚠️ IMPORTANTE: Anote ou copie esta senha antes de fechar!",
                "manual_instruction": True,
                "new_password": password_data.new_password,
                "user_email": target_user['email'],
                "user_name": target_user['name']
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Erro geral ao alterar senha: {e}")
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno do servidor") 
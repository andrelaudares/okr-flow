from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client
import traceback
import time

from .utils.supabase import get_supabase_client, get_supabase_admin, supabase_client, supabase_admin
from .models.user import UserProfile

# Define o esquema OAuth2 para obter o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserProfile:
    """
    Dependency para obter o usuário logado com base no token JWT.
    Otimizado para melhor performance e estabilidade.
    """
    try:
        # Verificar se o Supabase está configurado
        if not supabase_client or not supabase_admin:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Serviço não configurado"
            )
        
        # Obter o usuário usando o token JWT
        try:
            user_auth_response = supabase_client.auth.get_user(jwt=token)
            
            if not user_auth_response or not user_auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido ou expirado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
            user_id = user_auth_response.user.id
            
            # Verificar se o token não está muito próximo da expiração
            user_metadata = user_auth_response.user
            if hasattr(user_metadata, 'exp'):
                current_time = int(time.time())
                token_exp = getattr(user_metadata, 'exp', current_time + 3600)
                
                # Se o token expira em menos de 1 hora, sugerir refresh
                if token_exp - current_time < 3600:
                    print(f"DEBUG: Token próximo da expiração")
            
        except Exception as e_auth:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado. Faça login novamente.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Buscar dados do usuário na tabela users usando o admin client otimizado
        try:
            admin_client = get_supabase_admin()
            response = admin_client.from_('users').select('*').eq('id', str(user_id)).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário não encontrado no sistema"
                )
            
            user_data = response.data[0]
            
            # Verificar se usuário está ativo
            if not user_data.get('is_active', True):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuário desativado. Entre em contato com o administrador.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return UserProfile(**user_data)
            
        except HTTPException:
            raise
        except Exception as e_db:
            print(f"DEBUG: Erro ao buscar dados do usuário: {e_db}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao buscar dados do usuário"
            )

    except HTTPException:
        raise
    except Exception as e_general:
        print(f"DEBUG: Erro geral na autenticação: {e_general}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


def get_supabase_admin_dependency() -> Client:
    """
    Dependency para obter o cliente Supabase admin otimizado.
    """
    try:
        return get_supabase_admin()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço Supabase não configurado"
        ) 
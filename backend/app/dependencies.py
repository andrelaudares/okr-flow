from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client
import traceback
import time
from functools import lru_cache

from .utils.supabase import get_client, get_admin_client
from .models.user import UserProfile

# Define o esquema OAuth2 para obter o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserProfile:
    """
    Dependency otimizada para obter o usuário logado com base no token JWT.
    Agora com mensagens mais claras para tokens expirados.
    """
    try:
        print(f"DEBUG: Validando token JWT...")
        
        # Usar a função otimizada para obter clientes
        try:
            supabase_client = get_client()
            supabase_admin = get_admin_client()
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Serviço não configurado: {str(e)}"
            )
        
        # Obter o usuário usando o token JWT
        try:
            # Usar o token para autenticar e obter user info
            user_auth_response = supabase_client.auth.get_user(jwt=token)
            
            if not user_auth_response or not user_auth_response.user:
                print(f"DEBUG: Token inválido ou usuário não encontrado")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido ou expirado. Faça login novamente.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
            user_id = user_auth_response.user.id
            print(f"DEBUG: Token válido para usuário: {user_id}")
            
            # Verificar se o token não está muito próximo da expiração
            user_metadata = user_auth_response.user
            if hasattr(user_metadata, 'exp'):
                current_time = int(time.time())
                token_exp = getattr(user_metadata, 'exp', current_time + 3600)
                
                # Se o token expira em menos de 1 hora, sugerir refresh
                if token_exp - current_time < 3600:
                    print(f"DEBUG: Token próximo da expiração. Exp: {token_exp}, Current: {current_time}")
            
        except Exception as e_auth:
            error_str = str(e_auth).lower()
            print(f"DEBUG: Erro na validação do token: {e_auth}")
            
            # Detectar diferentes tipos de erro de token
            if any(phrase in error_str for phrase in ['expired', 'expirado', 'invalid jwt', 'token has invalid claims']):
                # Token expirado - mensagem clara
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Sua sessão expirou. Faça login novamente para continuar.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            elif any(phrase in error_str for phrase in ['invalid signature', 'malformed', 'invalid token']):
                # Token inválido/malformado 
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de autenticação inválido. Faça login novamente.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                # Erro genérico de autenticação
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Erro de autenticação. Faça login novamente.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        
        # Buscar dados completos do usuário na tabela users
        try:
            # Buscar dados do usuário usando o cliente admin
            user_response = supabase_admin.from_('users').select("*").eq('id', str(user_id)).single().execute()
            
            if not user_response.data:
                print(f"DEBUG: Usuário {user_id} não encontrado na tabela users")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Dados do usuário não encontrados. Entre em contato com o administrador."
                )
            
            user_data = user_response.data
            print(f"DEBUG: Dados do usuário carregados: {user_data['name']} ({user_data['role']})")
            
            # Verificar se usuário está ativo
            if not user_data.get('is_active', True):
                print(f"DEBUG: Usuário {user_id} está inativo")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Sua conta foi desativada. Entre em contato com o administrador."
                )
            
            # Criar o objeto UserProfile
            return UserProfile(**user_data)
            
        except HTTPException:
            # Re-raise HTTPExceptions específicas
            raise
        except Exception as e_db:
            print(f"DEBUG: Erro ao buscar dados do usuário: {e_db}")
            print(f"DEBUG: Stack trace: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao validar usuário. Tente novamente."
            )
            
    except HTTPException:
        # Re-raise HTTPExceptions (já tratadas)
        raise
    except Exception as e_general:
        print(f"DEBUG: Erro geral na validação do usuário: {e_general}")
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno de autenticação. Tente novamente."
        )


def get_supabase_admin() -> Client:
    """
    Dependency otimizada para obter o cliente Supabase admin.
    """
    try:
        return get_admin_client()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Serviço Supabase não configurado: {str(e)}"
        ) 
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client
import traceback
import time
from functools import lru_cache
import os

from .utils.supabase import get_client, get_admin_client, get_connectivity_status
from .models.user import UserProfile

# Define o esquema OAuth2 para obter o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def _is_local_environment() -> bool:
    """Detecta se está executando em ambiente local"""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    return environment in ["development", "dev", "local"]

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserProfile:
    """
    Dependency otimizada para obter o usuário logado com base no token JWT.
    Agora com mensagens mais claras para tokens expirados e problemas de conectividade local.
    """
    try:
        print(f"DEBUG: Validando token JWT...")
        
        # Verificar status de conectividade primeiro
        connectivity = get_connectivity_status()
        if not connectivity["credentials_configured"]:
            error_msg = ("Credenciais Supabase não configuradas. " + 
                        "Verifique as variáveis SUPABASE_URL, SUPABASE_KEY e SUPABASE_SERVICE_KEY no arquivo .env" 
                        if _is_local_environment() else 
                        "Serviço de autenticação não configurado")
            
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_msg
            )
        
        # Usar a função otimizada para obter clientes
        try:
            supabase_client = get_client()
            supabase_admin = get_admin_client()
        except ValueError as e:
            error_msg = str(e)
            
            # Em ambiente local, dar dicas mais específicas
            if _is_local_environment() and "não configurado" in error_msg:
                error_msg += ". Execute 'cp backend/env.example backend/.env' e configure suas credenciais."
            
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_msg
            )
        
        # Verificar se os clientes foram criados com sucesso
        if not supabase_client or not supabase_admin:
            if _is_local_environment():
                # Dar informações mais detalhadas sobre conectividade local
                connectivity_info = get_connectivity_status()
                error_detail = f"Erro de conectividade Supabase. Status: {connectivity_info}"
            else:
                error_detail = "Serviço de autenticação temporariamente indisponível"
            
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_detail
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
            elif any(phrase in error_str for phrase in ['connection', 'timeout', 'network']):
                # Problemas de conectividade
                if _is_local_environment():
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Erro de conectividade com Supabase. Verifique sua conexão de internet e as credenciais no arquivo .env"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Serviço de autenticação temporariamente indisponível"
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
            
            # Fornecer informação mais específica sobre problemas de conectividade
            error_str = str(e_db).lower()
            if any(phrase in error_str for phrase in ['connection', 'timeout', 'network']):
                if _is_local_environment():
                    detail = "Erro de conectividade com banco de dados. Verifique sua conexão e as credenciais Supabase no arquivo .env"
                else:
                    detail = "Erro temporário no banco de dados. Tente novamente."
                
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=detail
                )
            else:
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
        
        # Em ambiente local, dar mais detalhes sobre erros gerais
        if _is_local_environment():
            detail = f"Erro de configuração local: {str(e_general)}. Verifique o arquivo .env e sua conexão com internet."
        else:
            detail = "Erro interno de autenticação. Tente novamente."
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


def get_supabase_admin() -> Client:
    """
    Dependency otimizada para obter o cliente Supabase admin com tratamento melhorado de erro.
    """
    try:
        return get_admin_client()
    except ValueError as e:
        error_msg = str(e)
        
        # Em ambiente local, dar dicas mais específicas
        if _is_local_environment() and "não configurado" in error_msg:
            error_msg += ". Execute 'cp backend/env.example backend/.env' e configure suas credenciais Supabase."
        
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=error_msg
        ) 
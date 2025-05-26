from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client, create_client
import traceback

from .utils.supabase import supabase_client, supabase_admin
from .models.user import UserProfile
from .core.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

# Define o esquema OAuth2 para obter o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserProfile:
    """
    Dependency para obter o usuário logado com base no token JWT.
    Simplificado para não depender de expiração automática.
    """
    try:
        print(f"DEBUG: Validando token JWT...")
        
        # Verificar se o Supabase está configurado
        if not supabase_client or not supabase_admin:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Serviço não configurado"
            )
        
        # Obter o usuário usando o token JWT (usando supabase_client com token)
        try:
            # Usar o token para autenticar e obter user info
            user_auth_response = supabase_client.auth.get_user(jwt=token)
            
            if not user_auth_response or not user_auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
            user_id = user_auth_response.user.id
            print(f"DEBUG: Token válido para usuário: {user_id}")
            
        except Exception as e_auth:
            print(f"DEBUG: Erro na validação do token: {e_auth}")
            # Se der qualquer erro de autenticação, consideramos inválido
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Buscar dados do usuário na tabela users usando uma instância limpa do admin client
        try:
            # Criar nova instância do admin client para evitar problemas de JWT
            if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
                raise Exception("Variáveis de ambiente do Supabase não configuradas")
                
            admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            response = admin_client.from_('users').select('*').eq('id', str(user_id)).execute()
            
            if not response.data:
                print(f"DEBUG: Usuário {user_id} não encontrado na tabela users")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário não encontrado no sistema"
                )
            
            user_data = response.data[0]
            
            # Verificar se usuário está ativo
            if not user_data.get('is_active', True):
                print(f"DEBUG: Usuário {user_id} está desativado")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuário desativado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            print(f"DEBUG: Dados do usuário recuperados com sucesso")
            return UserProfile(**user_data)
            
        except HTTPException:
            raise
        except Exception as e_db:
            print(f"DEBUG: Erro ao buscar dados do usuário na tabela: {e_db}")
            print(f"DEBUG: Stack trace: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno ao buscar dados do usuário"
            )

    except HTTPException:
        raise
    except Exception as e_general:
        print(f"DEBUG: Erro geral na autenticação: {e_general}")
        print(f"DEBUG: Stack trace: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor na autenticação"
        )


def get_supabase_admin() -> Client:
    """
    Dependency para obter o cliente Supabase admin.
    """
    if not supabase_admin:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço Supabase não configurado"
        )
    return supabase_admin 
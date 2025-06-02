"""
Serviço avançado para gerenciamento de tokens JWT no banco de dados
"""
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID

from ..utils.supabase import get_admin_client
from ..models.session import (
    UserSession, 
    CreateSessionRequest, 
    SessionInfo, 
    UserSessionsResponse,
    RefreshTokenResponse
)
from ..core.settings import settings, get_environment_config

class TokenService:
    """Serviço para gerenciamento de tokens JWT no banco de dados"""
    
    @staticmethod
    def _hash_token(token: str) -> str:
        """Gera hash SHA-256 do token para armazenamento seguro"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    def _parse_user_agent(user_agent: Optional[str]) -> Dict[str, Any]:
        """Extrai informações do user agent"""
        if not user_agent:
            return {"browser": "Unknown", "os": "Unknown", "device": "Unknown"}
        
        # Simplificado - pode usar biblioteca como user-agents para parsing completo
        device_info = {
            "browser": "Unknown",
            "os": "Unknown", 
            "device": "Unknown",
            "raw": user_agent
        }
        
        # Detectar navegadores principais
        if "Chrome" in user_agent:
            device_info["browser"] = "Chrome"
        elif "Firefox" in user_agent:
            device_info["browser"] = "Firefox"
        elif "Safari" in user_agent and "Chrome" not in user_agent:
            device_info["browser"] = "Safari"
        elif "Edge" in user_agent:
            device_info["browser"] = "Edge"
        
        # Detectar OS
        if "Windows" in user_agent:
            device_info["os"] = "Windows"
        elif "Mac OS" in user_agent or "macOS" in user_agent:
            device_info["os"] = "macOS"
        elif "Linux" in user_agent:
            device_info["os"] = "Linux"
        elif "Android" in user_agent:
            device_info["os"] = "Android"
        elif "iOS" in user_agent:
            device_info["os"] = "iOS"
        
        # Detectar tipo de dispositivo
        if "Mobile" in user_agent or "Android" in user_agent:
            device_info["device"] = "Mobile"
        elif "Tablet" in user_agent or "iPad" in user_agent:
            device_info["device"] = "Tablet"
        else:
            device_info["device"] = "Desktop"
            
        return device_info
    
    @classmethod
    async def create_session(
        cls,
        user_id: UUID,
        access_token: str,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        expires_in_seconds: Optional[int] = None
    ) -> UserSession:
        """
        Cria nova sessão no banco de dados
        """
        supabase = get_admin_client()
        
        # Obter configurações de expiração
        env_config = get_environment_config()
        if expires_in_seconds is None:
            expires_in_seconds = env_config["JWT_EXPIRATION_TIME"]
        
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in_seconds)
        
        # Processar informações do dispositivo
        device_info = cls._parse_user_agent(user_agent)
        
        # Criar sessão
        session_data = {
            "user_id": str(user_id),
            "access_token_hash": cls._hash_token(access_token),
            "refresh_token_hash": cls._hash_token(refresh_token),
            "device_info": device_info,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "expires_at": expires_at.isoformat(),
        }
        
        try:
            # Note: Como a tabela pode não existir ainda, vamos usar try/except
            response = supabase.from_('user_sessions').insert(session_data).execute()
            
            if response.data:
                session_data_response = response.data[0]
                session_data_response["id"] = UUID(session_data_response["id"])
                session_data_response["user_id"] = UUID(session_data_response["user_id"])
                session_data_response["created_at"] = datetime.fromisoformat(session_data_response["created_at"].replace("Z", "+00:00"))
                session_data_response["last_used_at"] = datetime.fromisoformat(session_data_response["last_used_at"].replace("Z", "+00:00"))
                session_data_response["expires_at"] = datetime.fromisoformat(session_data_response["expires_at"].replace("Z", "+00:00"))
                
                return UserSession(**session_data_response)
            else:
                raise Exception("Falha ao criar sessão")
                
        except Exception as e:
            print(f"DEBUG: Erro ao criar sessão no banco - tabela pode não existir ainda: {e}")
            # Se a tabela não existe, criar sessão simulada para manter compatibilidade
            return UserSession(
                id=UUID(secrets.token_hex(16)),
                user_id=user_id,
                access_token_hash=cls._hash_token(access_token),
                refresh_token_hash=cls._hash_token(refresh_token),
                device_info=device_info,
                ip_address=ip_address,
                user_agent=user_agent,
                created_at=datetime.utcnow(),
                last_used_at=datetime.utcnow(),
                expires_at=expires_at,
                is_revoked=False
            )
    
    @classmethod
    async def validate_access_token(
        cls,
        access_token: str,
        update_last_used: bool = True
    ) -> Optional[UserSession]:
        """
        Valida access token e opcionalmente atualiza last_used_at
        """
        try:
            supabase = get_admin_client()
            token_hash = cls._hash_token(access_token)
            
            # Buscar sessão ativa
            response = supabase.from_('user_sessions').select("*").eq(
                'access_token_hash', token_hash
            ).eq('is_revoked', False).gte('expires_at', datetime.utcnow().isoformat()).execute()
            
            if response.data:
                session_data = response.data[0]
                
                # Atualizar last_used_at se solicitado
                if update_last_used:
                    supabase.from_('user_sessions').update({
                        'last_used_at': datetime.utcnow().isoformat()
                    }).eq('id', session_data['id']).execute()
                
                # Converter para modelo
                session_data["id"] = UUID(session_data["id"])
                session_data["user_id"] = UUID(session_data["user_id"])
                session_data["created_at"] = datetime.fromisoformat(session_data["created_at"].replace("Z", "+00:00"))
                session_data["last_used_at"] = datetime.fromisoformat(session_data["last_used_at"].replace("Z", "+00:00"))
                session_data["expires_at"] = datetime.fromisoformat(session_data["expires_at"].replace("Z", "+00:00"))
                
                return UserSession(**session_data)
                
            return None
            
        except Exception as e:
            print(f"DEBUG: Erro ao validar token - usando validação padrão: {e}")
            return None
    
    @classmethod
    async def refresh_session(
        cls,
        refresh_token: str,
        new_access_token: str,
        new_refresh_token: str
    ) -> Optional[RefreshTokenResponse]:
        """
        Renova sessão usando refresh token
        """
        try:
            supabase = get_admin_client()
            refresh_token_hash = cls._hash_token(refresh_token)
            
            # Buscar sessão pelo refresh token
            response = supabase.from_('user_sessions').select("*").eq(
                'refresh_token_hash', refresh_token_hash
            ).eq('is_revoked', False).gte('expires_at', datetime.utcnow().isoformat()).execute()
            
            if response.data:
                session = response.data[0]
                
                # Obter nova expiração
                env_config = get_environment_config()
                expires_in_seconds = env_config["JWT_EXPIRATION_TIME"]
                new_expires_at = datetime.utcnow() + timedelta(seconds=expires_in_seconds)
                
                # Atualizar sessão com novos tokens
                update_data = {
                    'access_token_hash': cls._hash_token(new_access_token),
                    'refresh_token_hash': cls._hash_token(new_refresh_token),
                    'expires_at': new_expires_at.isoformat(),
                    'last_used_at': datetime.utcnow().isoformat()
                }
                
                supabase.from_('user_sessions').update(update_data).eq('id', session['id']).execute()
                
                return RefreshTokenResponse(
                    access_token=new_access_token,
                    refresh_token=new_refresh_token,
                    expires_in=expires_in_seconds,
                    expires_at=new_expires_at
                )
            
            return None
            
        except Exception as e:
            print(f"DEBUG: Erro ao renovar sessão: {e}")
            return None
    
    @classmethod
    async def revoke_session(
        cls,
        session_id: UUID,
        reason: str = "manual_logout"
    ) -> bool:
        """
        Revoga sessão específica
        """
        try:
            supabase = get_admin_client()
            
            update_data = {
                'is_revoked': True,
                'revoked_at': datetime.utcnow().isoformat(),
                'revoked_reason': reason
            }
            
            response = supabase.from_('user_sessions').update(update_data).eq('id', str(session_id)).execute()
            
            return bool(response.data)
            
        except Exception as e:
            print(f"DEBUG: Erro ao revogar sessão: {e}")
            return False
    
    @classmethod
    async def revoke_user_sessions(
        cls,
        user_id: UUID,
        except_session_id: Optional[UUID] = None,
        reason: str = "logout_all"
    ) -> int:
        """
        Revoga todas as sessões do usuário, exceto a especificada
        """
        try:
            supabase = get_admin_client()
            
            query = supabase.from_('user_sessions').update({
                'is_revoked': True,
                'revoked_at': datetime.utcnow().isoformat(),
                'revoked_reason': reason
            }).eq('user_id', str(user_id)).eq('is_revoked', False)
            
            if except_session_id:
                query = query.neq('id', str(except_session_id))
            
            response = query.execute()
            
            return len(response.data) if response.data else 0
            
        except Exception as e:
            print(f"DEBUG: Erro ao revogar sessões do usuário: {e}")
            return 0
    
    @classmethod
    async def get_user_sessions(
        cls,
        user_id: UUID,
        current_token: Optional[str] = None
    ) -> UserSessionsResponse:
        """
        Lista sessões ativas do usuário
        """
        try:
            supabase = get_admin_client()
            
            # Buscar sessões ativas do usuário
            response = supabase.from_('user_sessions').select("*").eq(
                'user_id', str(user_id)
            ).eq('is_revoked', False).gte('expires_at', datetime.utcnow().isoformat()).order('created_at', desc=True).execute()
            
            sessions = []
            current_session_id = None
            
            if response.data:
                current_token_hash = cls._hash_token(current_token) if current_token else None
                
                for session_data in response.data:
                    is_current = (current_token_hash and 
                                session_data['access_token_hash'] == current_token_hash)
                    
                    if is_current:
                        current_session_id = UUID(session_data['id'])
                    
                    session_info = SessionInfo(
                        id=UUID(session_data['id']),
                        device_info=session_data['device_info'],
                        ip_address=session_data['ip_address'],
                        user_agent=session_data['user_agent'],
                        created_at=datetime.fromisoformat(session_data['created_at'].replace("Z", "+00:00")),
                        last_used_at=datetime.fromisoformat(session_data['last_used_at'].replace("Z", "+00:00")),
                        expires_at=datetime.fromisoformat(session_data['expires_at'].replace("Z", "+00:00")),
                        is_current=is_current
                    )
                    sessions.append(session_info)
            
            return UserSessionsResponse(
                sessions=sessions,
                total=len(sessions),
                current_session_id=current_session_id
            )
            
        except Exception as e:
            print(f"DEBUG: Erro ao buscar sessões do usuário: {e}")
            return UserSessionsResponse(sessions=[], total=0)
    
    @classmethod
    async def cleanup_expired_sessions(cls, older_than_days: int = 7) -> int:
        """
        Remove sessões expiradas há mais de X dias
        """
        try:
            supabase = get_admin_client()
            
            cutoff_date = datetime.utcnow() - timedelta(days=older_than_days)
            
            response = supabase.from_('user_sessions').delete().lt(
                'expires_at', cutoff_date.isoformat()
            ).execute()
            
            return len(response.data) if response.data else 0
            
        except Exception as e:
            print(f"DEBUG: Erro ao limpar sessões expiradas: {e}")
            return 0 
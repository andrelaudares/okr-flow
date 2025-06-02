"""
Modelos para sessões de usuário e gerenciamento de tokens
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class UserSession(BaseModel):
    """Modelo para sessão de usuário"""
    id: UUID
    user_id: UUID
    access_token_hash: str
    refresh_token_hash: str
    device_info: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    last_used_at: datetime
    expires_at: datetime
    is_revoked: bool = False
    revoked_at: Optional[datetime] = None
    revoked_reason: Optional[str] = None

    class Config:
        from_attributes = True

class CreateSessionRequest(BaseModel):
    """Dados para criar nova sessão"""
    user_id: UUID
    access_token: str
    refresh_token: str
    device_info: Optional[Dict[str, Any]] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    expires_at: datetime

class SessionInfo(BaseModel):
    """Informações da sessão para resposta da API"""
    id: UUID
    device_info: Dict[str, Any]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    last_used_at: datetime
    expires_at: datetime
    is_current: bool = False

class UserSessionsResponse(BaseModel):
    """Resposta com lista de sessões do usuário"""
    sessions: list[SessionInfo]
    total: int
    current_session_id: Optional[UUID] = None

class RevokeSessionRequest(BaseModel):
    """Dados para revogar sessão"""
    session_id: UUID
    reason: Optional[str] = "manual_logout"

class RefreshTokenRequest(BaseModel):
    """Dados para refresh de token"""
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    """Resposta do refresh de token"""
    access_token: str
    refresh_token: str
    expires_in: int
    expires_at: datetime 
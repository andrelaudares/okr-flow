"""
Configurações avançadas para otimização de performance
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

class Settings:
    """Configurações otimizadas para o sistema"""
    
    # 🔑 Configurações do Supabase - OBRIGATÓRIAS
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Configurações de Cache
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "300"))  # 5 minutos
    CACHE_MAXSIZE: int = int(os.getenv("CACHE_MAXSIZE", "1000"))
    
    # Configurações de Conexão
    CONNECTION_POOL_SIZE: int = int(os.getenv("CONNECTION_POOL_SIZE", "20"))
    CONNECTION_TIMEOUT: int = int(os.getenv("CONNECTION_TIMEOUT", "30"))
    
    # Configurações de Performance
    ENABLE_GZIP: bool = os.getenv("ENABLE_GZIP", "true").lower() == "true"
    MAX_REQUEST_SIZE: int = int(os.getenv("MAX_REQUEST_SIZE", "16777216"))  # 16MB
    
    # Configurações de Log
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    ENABLE_DEBUG_LOGS: bool = os.getenv("ENABLE_DEBUG_LOGS", "false").lower() == "true"
    
    # Configurações de Workers
    WORKERS_COUNT: Optional[int] = None
    if os.getenv("WORKERS_COUNT"):
        WORKERS_COUNT = int(os.getenv("WORKERS_COUNT"))
    
    # Configurações de Timeout
    TIMEOUT_KEEP_ALIVE: int = int(os.getenv("TIMEOUT_KEEP_ALIVE", "30"))
    TIMEOUT_GRACEFUL_SHUTDOWN: int = int(os.getenv("TIMEOUT_GRACEFUL_SHUTDOWN", "5"))
    
    # 🔑 Configurações de JWT - NOVO!
    # Tempo de expiração do JWT em segundos (padrão: 30 dias)
    JWT_EXPIRATION_TIME: int = int(os.getenv("JWT_EXPIRATION_TIME", str(30 * 24 * 3600)))  # 30 dias
    
    # Tempo de expiração do refresh token em segundos (padrão: 90 dias)  
    JWT_REFRESH_EXPIRATION_TIME: int = int(os.getenv("JWT_REFRESH_EXPIRATION_TIME", str(90 * 24 * 3600)))  # 90 dias
    
    # Configurações de sessão - para controle adicional
    SESSION_TIMEOUT: int = int(os.getenv("SESSION_TIMEOUT", str(24 * 3600)))  # 24 horas default
    EXTEND_SESSION_ON_ACTIVITY: bool = os.getenv("EXTEND_SESSION_ON_ACTIVITY", "true").lower() == "true"
    
    # 🌐 Configurações de URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8080")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # 💳 Configurações de pagamento
    ASAAS_API_KEY: str = os.getenv("ASAAS_API_KEY", "")

# Instância global das configurações
settings = Settings() 

# Configurações específicas para ambientes
def get_environment_config():
    """Retorna configurações baseadas no ambiente"""
    is_production = settings.ENVIRONMENT == "production"
    
    if is_production:
        return {
            "JWT_EXPIRATION_TIME": settings.JWT_EXPIRATION_TIME,
            "JWT_REFRESH_EXPIRATION_TIME": settings.JWT_REFRESH_EXPIRATION_TIME,
            "SESSION_TIMEOUT": settings.SESSION_TIMEOUT * 2,  # Dobrar em produção
            "LOG_LEVEL": "WARNING",
            "ENABLE_DEBUG_LOGS": False,
            "FRONTEND_URL": settings.FRONTEND_URL or "https://okr-flow.vercel.app",
            "ENVIRONMENT": "production"
        }
    else:
        return {
            "JWT_EXPIRATION_TIME": 7 * 24 * 3600,  # 7 dias em desenvolvimento
            "JWT_REFRESH_EXPIRATION_TIME": 30 * 24 * 3600,  # 30 dias em desenvolvimento  
            "SESSION_TIMEOUT": 8 * 3600,  # 8 horas em desenvolvimento
            "LOG_LEVEL": "INFO",
            "ENABLE_DEBUG_LOGS": True,
            "FRONTEND_URL": settings.FRONTEND_URL or "http://localhost:8080",
            "ENVIRONMENT": "development"
        } 
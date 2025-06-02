"""
Configurações avançadas para otimização de performance
"""
import os
from typing import Optional

class Settings:
    """Configurações otimizadas para o sistema"""
    
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

# Instância global das configurações
settings = Settings() 
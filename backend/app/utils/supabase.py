import os
from supabase import create_client, Client
from functools import lru_cache
import time
from typing import Optional
import asyncio

# Configurações do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # anon key
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # service_role key

# Cache para controle de reconexão
_client_cache = {}
_admin_cache = {}
_last_refresh_time = 0
REFRESH_INTERVAL = 3600  # Renovar conexões a cada 1 hora

# Status de conectividade
_connectivity_status = {
    "last_check": 0,
    "is_connected": True,
    "error_count": 0,
    "last_error": None
}

def _is_local_environment() -> bool:
    """Detecta se está executando em ambiente local"""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    return environment in ["development", "dev", "local"]

def _should_refresh_connection() -> bool:
    """Verifica se deve renovar as conexões"""
    global _last_refresh_time
    current_time = time.time()
    
    # Em ambiente local, verificar a cada 30 minutos em vez de 1 hora
    interval = 1800 if _is_local_environment() else REFRESH_INTERVAL
    
    if current_time - _last_refresh_time > interval:
        _last_refresh_time = current_time
        return True
    return False

def _check_connectivity() -> bool:
    """Verifica conectividade básica com mais tolerância para ambiente local"""
    global _connectivity_status
    
    current_time = time.time()
    
    # Verificar apenas a cada 30 segundos para evitar spam
    if current_time - _connectivity_status["last_check"] < 30:
        return _connectivity_status["is_connected"]
    
    _connectivity_status["last_check"] = current_time
    
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            _connectivity_status["is_connected"] = False
            _connectivity_status["last_error"] = "Credenciais não configuradas"
            return False
        
        # Teste rápido de conectividade
        test_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Timeout mais baixo para teste local
        response = test_client.from_('users').select('id').limit(1).execute()
        
        _connectivity_status["is_connected"] = True
        _connectivity_status["error_count"] = 0
        _connectivity_status["last_error"] = None
        return True
        
    except Exception as e:
        _connectivity_status["error_count"] += 1
        _connectivity_status["last_error"] = str(e)
        
        # Em ambiente local, ser mais tolerante a erros de conectividade
        if _is_local_environment():
            # Permitir até 3 erros consecutivos antes de marcar como desconectado
            _connectivity_status["is_connected"] = _connectivity_status["error_count"] < 3
        else:
            # Em produção, marcar como desconectado imediatamente
            _connectivity_status["is_connected"] = False
        
        print(f"DEBUG: Erro de conectividade Supabase (tentativa {_connectivity_status['error_count']}): {e}")
        return _connectivity_status["is_connected"]

def get_supabase_client(force_refresh: bool = False) -> Optional[Client]:
    """Cliente Supabase para operações normais (anon key) com renovação automática"""
    global _client_cache
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("DEBUG: Credenciais Supabase não configuradas")
        return None
    
    cache_key = f"{SUPABASE_URL}_{SUPABASE_KEY}"
    
    if force_refresh or _should_refresh_connection() or cache_key not in _client_cache:
        try:
            print("DEBUG: Criando novo cliente Supabase (anon)")
            client = create_client(SUPABASE_URL, SUPABASE_KEY)
            _client_cache[cache_key] = client
        except Exception as e:
            print(f"DEBUG: Erro ao criar cliente Supabase: {e}")
            # Retornar cliente existente se houver
            return _client_cache.get(cache_key)
    
    return _client_cache.get(cache_key)

def get_supabase_admin(force_refresh: bool = False) -> Optional[Client]:
    """Cliente Supabase para operações administrativas (service_role key) com renovação automática"""
    global _admin_cache
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("DEBUG: Credenciais Supabase Admin não configuradas")
        return None
    
    cache_key = f"{SUPABASE_URL}_{SUPABASE_SERVICE_KEY}"
    
    if force_refresh or _should_refresh_connection() or cache_key not in _admin_cache:
        try:
            print("DEBUG: Criando novo cliente Supabase Admin (service_role)")
            admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            _admin_cache[cache_key] = admin_client
        except Exception as e:
            print(f"DEBUG: Erro ao criar cliente Supabase Admin: {e}")
            # Retornar cliente existente se houver
            return _admin_cache.get(cache_key)
    
    return _admin_cache.get(cache_key)

@lru_cache(maxsize=None)
def get_supabase_super_admin() -> Optional[Client]:
    """Cliente Supabase com configurações especiais para operações críticas como alteração de senha"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("DEBUG: Credenciais Supabase Super Admin não configuradas")
        return None
    
    try:
        super_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        return super_admin
    except Exception as e:
        print(f"DEBUG: Erro ao criar cliente Supabase Super Admin: {e}")
        return None

# Instâncias globais com inicialização lazy
_supabase_client = None
_supabase_admin = None
_supabase_super_admin = None

def supabase_client():
    """Retorna cliente Supabase global, criando se necessário"""
    global _supabase_client
    if not _supabase_client:
        _supabase_client = get_supabase_client()
    return _supabase_client

def supabase_admin():
    """Retorna cliente Supabase admin global, criando se necessário"""
    global _supabase_admin
    if not _supabase_admin:
        _supabase_admin = get_supabase_admin()
    return _supabase_admin

def supabase_super_admin():
    """Retorna cliente Supabase super admin global, criando se necessário"""
    global _supabase_super_admin
    if not _supabase_super_admin:
        _supabase_super_admin = get_supabase_super_admin()
    return _supabase_super_admin

def check_connection() -> bool:
    """Verifica se a conexão está funcionando com sistema de tolerância para ambiente local"""
    try:
        if not _check_connectivity():
            print("DEBUG: Conectividade Supabase com problemas")
            
            # Em ambiente local, tentar renovar automaticamente
            if _is_local_environment():
                print("DEBUG: Ambiente local detectado - tentando renovar conexão...")
                admin = get_supabase_admin(force_refresh=True)
                if admin:
                    test = admin.from_('users').select('id').limit(1).execute()
                    print("DEBUG: Renovação bem-sucedida")
                    return True
            
            return False
        
        # Se a conectividade está OK, fazer teste final
        admin = get_supabase_admin()
        if admin:
            test = admin.from_('users').select('id').limit(1).execute()
            return True
            
    except Exception as e:
        print(f"DEBUG: Erro final na verificação de conexão: {e}")
        return False
    
    return False

# Funções de acesso otimizadas com fallback de renovação
def get_client() -> Client:
    """Retorna o cliente Supabase, inicializando se necessário com melhor tratamento de erro"""
    client = get_supabase_client()
    if not client:
        if _is_local_environment():
            raise ValueError("Cliente Supabase não configurado. Verifique as variáveis SUPABASE_URL e SUPABASE_KEY no arquivo .env")
        else:
            raise ValueError("Cliente Supabase não está disponível")
    return client

def get_admin_client() -> Client:
    """Retorna o cliente Supabase admin, inicializando se necessário com melhor tratamento de erro"""
    admin = get_supabase_admin()
    if not admin:
        if _is_local_environment():
            raise ValueError("Cliente Supabase admin não configurado. Verifique as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env")
        else:
            raise ValueError("Cliente Supabase admin não está disponível")
    return admin

def get_super_admin_client() -> Client:
    """Retorna o cliente Supabase super admin, inicializando se necessário com melhor tratamento de erro"""
    super_admin = get_supabase_super_admin()
    if not super_admin:
        if _is_local_environment():
            raise ValueError("Cliente Supabase super admin não configurado. Verifique as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env")
        else:
            raise ValueError("Cliente Supabase super admin não está disponível")
    return super_admin

def refresh_all_connections():
    """Força a renovação de todas as conexões - chamada periodicamente"""
    global _client_cache, _admin_cache, _last_refresh_time, _connectivity_status
    
    print("DEBUG: Renovando todas as conexões Supabase...")
    _client_cache.clear()
    _admin_cache.clear()
    _last_refresh_time = time.time()
    
    # Resetar status de conectividade
    _connectivity_status["error_count"] = 0
    _connectivity_status["last_error"] = None
    _connectivity_status["last_check"] = 0
    
    # Recriar conexões
    get_supabase_client(force_refresh=True)
    get_supabase_admin(force_refresh=True)

def get_connectivity_status():
    """Retorna informações detalhadas sobre o status de conectividade"""
    return {
        "is_connected": _connectivity_status["is_connected"],
        "error_count": _connectivity_status["error_count"],
        "last_error": _connectivity_status["last_error"],
        "environment": "local" if _is_local_environment() else "production",
        "credentials_configured": bool(SUPABASE_URL and SUPABASE_KEY and SUPABASE_SERVICE_KEY)
    } 
import os
from supabase import create_client, Client
from functools import lru_cache
import time
from typing import Optional

# Configurações do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # anon key
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # service_role key

# Cache para controle de reconexão
_client_cache = {}
_admin_cache = {}
_last_refresh_time = 0
REFRESH_INTERVAL = 3600  # Renovar conexões a cada 1 hora

def _should_refresh_connection() -> bool:
    """Verifica se deve renovar as conexões"""
    global _last_refresh_time
    current_time = time.time()
    if current_time - _last_refresh_time > REFRESH_INTERVAL:
        _last_refresh_time = current_time
        return True
    return False

def get_supabase_client(force_refresh: bool = False) -> Client:
    """Cliente Supabase para operações normais (anon key) com renovação automática"""
    global _client_cache
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    
    cache_key = f"{SUPABASE_URL}_{SUPABASE_KEY}"
    
    if force_refresh or _should_refresh_connection() or cache_key not in _client_cache:
        try:
            print("DEBUG: Criando novo cliente Supabase (anon)")
            client = create_client(SUPABASE_URL, SUPABASE_KEY)
            _client_cache[cache_key] = client
        except Exception as e:
            print(f"DEBUG: Erro ao criar cliente Supabase: {e}")
            return _client_cache.get(cache_key)
    
    return _client_cache.get(cache_key)

def get_supabase_admin(force_refresh: bool = False) -> Client:
    """Cliente Supabase para operações administrativas (service_role key) com renovação automática"""
    global _admin_cache
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    
    cache_key = f"{SUPABASE_URL}_{SUPABASE_SERVICE_KEY}"
    
    if force_refresh or _should_refresh_connection() or cache_key not in _admin_cache:
        try:
            print("DEBUG: Criando novo cliente Supabase Admin (service_role)")
            # Criar cliente admin com configurações especiais para longevidade
            admin_client = create_client(
                SUPABASE_URL, 
                SUPABASE_SERVICE_KEY,
                options={
                    "auth": {
                        "auto_refresh_token": True,
                        "persist_session": True,
                        "detect_session_in_url": False,
                    },
                    "db": {
                        "schema": "public",
                    },
                    "global": {
                        "headers": {
                            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                            "apikey": SUPABASE_SERVICE_KEY,
                        }
                    }
                }
            )
            _admin_cache[cache_key] = admin_client
        except Exception as e:
            print(f"DEBUG: Erro ao criar cliente Supabase Admin: {e}")
            return _admin_cache.get(cache_key)
    
    return _admin_cache.get(cache_key)

@lru_cache(maxsize=None)
def get_supabase_super_admin() -> Client:
    """Cliente Supabase com configurações especiais para operações críticas como alteração de senha"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    
    # Criar um cliente especial com configurações máximas de privilégio
    super_admin = create_client(
        SUPABASE_URL, 
        SUPABASE_SERVICE_KEY,
        options={
            "auth": {
                "auto_refresh_token": True,
                "persist_session": True,
            },
            "global": {
                "headers": {
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "apikey": SUPABASE_SERVICE_KEY,
                }
            }
        }
    )
    return super_admin

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

# Para compatibilidade com código existente
def check_connection():
    """Verifica se a conexão está funcionando e renova se necessário"""
    try:
        admin = get_supabase_admin()
        if admin:
            # Teste simples de conectividade
            test = admin.from_('users').select('id').limit(1).execute()
            return True
    except Exception as e:
        print(f"DEBUG: Erro de conexão Supabase - tentando renovar: {e}")
        # Tentar renovar conexão
        try:
            admin = get_supabase_admin(force_refresh=True)
            if admin:
                test = admin.from_('users').select('id').limit(1).execute()
                return True
        except Exception as e2:
            print(f"DEBUG: Erro após renovação: {e2}")
            return False
    return False

# Funções de acesso otimizadas com fallback de renovação
def get_client() -> Client:
    """Retorna o cliente Supabase, inicializando se necessário"""
    client = get_supabase_client()
    if not client:
        raise ValueError("Cliente Supabase não está disponível")
    return client

def get_admin_client() -> Client:
    """Retorna o cliente Supabase admin, inicializando se necessário"""
    admin = get_supabase_admin()
    if not admin:
        raise ValueError("Cliente Supabase admin não está disponível")
    return admin

def get_super_admin_client() -> Client:
    """Retorna o cliente Supabase super admin, inicializando se necessário"""
    super_admin = get_supabase_super_admin()
    if not super_admin:
        raise ValueError("Cliente Supabase super admin não está disponível")
    return super_admin

def refresh_all_connections():
    """Força a renovação de todas as conexões - chamada periodicamente"""
    global _client_cache, _admin_cache, _last_refresh_time
    
    print("DEBUG: Renovando todas as conexões Supabase...")
    _client_cache.clear()
    _admin_cache.clear()
    _last_refresh_time = time.time()
    
    # Recriar conexões
    get_supabase_client(force_refresh=True)
    get_supabase_admin(force_refresh=True) 
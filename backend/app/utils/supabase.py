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
_last_connectivity_check = 0

# Configurações ajustadas para melhor performance
REFRESH_INTERVAL = 1800  # Renovar conexões a cada 30 minutos em vez de 1 hora
CONNECTIVITY_CHECK_INTERVAL = 60  # Verificar conectividade a cada 1 minuto

# Status de conectividade melhorado
_connectivity_status = {
    "last_check": 0,
    "is_connected": True,
    "error_count": 0,
    "last_error": None,
    "consecutive_failures": 0,
    "last_success": time.time()
}

def _is_local_environment() -> bool:
    """Detecta se está executando em ambiente local"""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    return environment in ["development", "dev", "local"]

def _should_refresh_connection() -> bool:
    """Verifica se deve renovar as conexões com intervalo menor"""
    global _last_refresh_time
    current_time = time.time()
    
    # Usar intervalo menor para evitar JWT expirado
    interval = 900 if _is_local_environment() else REFRESH_INTERVAL  # 15 min local, 30 min produção
    
    if current_time - _last_refresh_time > interval:
        _last_refresh_time = current_time
        return True
    return False

def _check_connectivity() -> bool:
    """Verifica conectividade com sistema mais inteligente de detecção de problemas"""
    global _connectivity_status
    
    current_time = time.time()
    
    # Verificar apenas a cada minuto para reduzir spam mas manter responsividade
    if current_time - _connectivity_status["last_check"] < CONNECTIVITY_CHECK_INTERVAL:
        return _connectivity_status["is_connected"]
    
    _connectivity_status["last_check"] = current_time
    
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            _connectivity_status["is_connected"] = False
            _connectivity_status["last_error"] = "Credenciais não configuradas"
            _connectivity_status["consecutive_failures"] += 1
            return False
        
        # Criar um novo cliente para teste (não usar cache)
        test_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Teste mais simples e rápido
        response = test_client.from_('users').select('id').limit(1).execute()
        
        # Reset em caso de sucesso
        _connectivity_status["is_connected"] = True
        _connectivity_status["error_count"] = 0
        _connectivity_status["consecutive_failures"] = 0
        _connectivity_status["last_error"] = None
        _connectivity_status["last_success"] = current_time
        return True
        
    except Exception as e:
        _connectivity_status["error_count"] += 1
        _connectivity_status["consecutive_failures"] += 1
        _connectivity_status["last_error"] = str(e)
        
        # Sistema de tolerância melhorado
        max_failures = 5 if _is_local_environment() else 3
        
        if _connectivity_status["consecutive_failures"] >= max_failures:
            _connectivity_status["is_connected"] = False
            print(f"DEBUG: Conectividade perdida após {_connectivity_status['consecutive_failures']} falhas consecutivas")
        
        print(f"DEBUG: Erro de conectividade Supabase (tentativa {_connectivity_status['error_count']}): {e}")
        return _connectivity_status["is_connected"]

def _test_client_health(client: Optional[Client]) -> bool:
    """Testa se um cliente específico está funcionando"""
    if not client:
        return False
    
    try:
        # Teste rápido para verificar se o cliente está funcionando
        response = client.from_('users').select('id').limit(1).execute()
        return True
    except Exception as e:
        error_str = str(e).lower()
        # Detectar especificamente erro de JWT expirado
        if any(jwt_error in error_str for jwt_error in ['jwt expired', 'pgrst301', 'expired', 'invalid jwt']):
            print(f"DEBUG: Cliente com JWT expirado detectado: {e}")
            return False
        return False

def get_supabase_client(force_refresh: bool = False) -> Optional[Client]:
    """Cliente Supabase para operações normais (anon key) com renovação automática melhorada"""
    global _client_cache
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("DEBUG: Credenciais Supabase não configuradas")
        return None
    
    cache_key = f"{SUPABASE_URL}_{SUPABASE_KEY}"
    
    # Verificar se precisa renovar ou se o cliente existente está com problema
    should_refresh = (
        force_refresh or 
        _should_refresh_connection() or 
        cache_key not in _client_cache or
        not _test_client_health(_client_cache.get(cache_key))
    )
    
    if should_refresh:
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
    """Cliente Supabase para operações administrativas (service_role key) com renovação automática melhorada"""
    global _admin_cache
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("DEBUG: Credenciais Supabase Admin não configuradas")
        return None
    
    cache_key = f"{SUPABASE_URL}_{SUPABASE_SERVICE_KEY}"
    
    # Verificar se precisa renovar ou se o cliente existente está com problema
    should_refresh = (
        force_refresh or 
        _should_refresh_connection() or 
        cache_key not in _admin_cache or
        not _test_client_health(_admin_cache.get(cache_key))
    )
    
    if should_refresh:
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
    """Verifica se a conexão está funcionando com sistema de tolerância melhorado"""
    try:
        if not _check_connectivity():
            print("DEBUG: Conectividade Supabase com problemas - tentando renovar...")
            
            # Tentar renovar automaticamente em qualquer ambiente
            admin = get_supabase_admin(force_refresh=True)
            if admin and _test_client_health(admin):
                print("DEBUG: Renovação bem-sucedida")
                return True
            
            print("DEBUG: Renovação falhou")
            return False
        
        # Se a conectividade está OK, fazer teste final
        admin = get_supabase_admin()
        if admin and _test_client_health(admin):
            return True
        else:
            # Se o teste falhou, forçar renovação
            print("DEBUG: Teste de saúde do cliente falhou, renovando...")
            admin = get_supabase_admin(force_refresh=True)
            return admin and _test_client_health(admin)
            
    except Exception as e:
        print(f"DEBUG: Erro final na verificação de conexão: {e}")
        return False
    
    return False

# Funções de acesso otimizadas com fallback de renovação melhorado
def get_client() -> Client:
    """Retorna o cliente Supabase, inicializando se necessário com melhor tratamento de erro"""
    client = get_supabase_client()
    
    # Se o cliente não existe ou não está funcionando, tentar renovar
    if not client or not _test_client_health(client):
        print("DEBUG: Cliente principal com problemas, renovando...")
        client = get_supabase_client(force_refresh=True)
    
    if not client:
        if _is_local_environment():
            raise ValueError("Cliente Supabase não configurado. Verifique as variáveis SUPABASE_URL e SUPABASE_KEY no arquivo .env")
        else:
            raise ValueError("Cliente Supabase não está disponível")
    return client

def get_admin_client() -> Client:
    """Retorna o cliente Supabase admin, inicializando se necessário com melhor tratamento de erro"""
    admin = get_supabase_admin()
    
    # Se o cliente não existe ou não está funcionando, tentar renovar
    if not admin or not _test_client_health(admin):
        print("DEBUG: Cliente admin com problemas, renovando...")
        admin = get_supabase_admin(force_refresh=True)
    
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
    """Força a renovação de todas as conexões - chamada periodicamente com melhorias"""
    global _client_cache, _admin_cache, _last_refresh_time, _connectivity_status
    
    print("DEBUG: Renovando todas as conexões Supabase...")
    _client_cache.clear()
    _admin_cache.clear()
    _last_refresh_time = time.time()
    
    # Resetar status de conectividade
    _connectivity_status["error_count"] = 0
    _connectivity_status["consecutive_failures"] = 0
    _connectivity_status["last_error"] = None
    _connectivity_status["last_check"] = 0
    
    # Limpar cache do super admin também
    get_supabase_super_admin.cache_clear()
    
    # Recriar conexões
    get_supabase_client(force_refresh=True)
    get_supabase_admin(force_refresh=True)
    
    print("DEBUG: Renovação de conexões concluída")

def get_connectivity_status():
    """Retorna informações detalhadas sobre o status de conectividade"""
    return {
        "is_connected": _connectivity_status["is_connected"],
        "error_count": _connectivity_status["error_count"],
        "consecutive_failures": _connectivity_status["consecutive_failures"],
        "last_error": _connectivity_status["last_error"],
        "last_success": _connectivity_status["last_success"],
        "environment": "local" if _is_local_environment() else "production",
        "credentials_configured": bool(SUPABASE_URL and SUPABASE_KEY and SUPABASE_SERVICE_KEY),
        "refresh_interval": 900 if _is_local_environment() else REFRESH_INTERVAL
    } 
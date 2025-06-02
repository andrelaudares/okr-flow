import os
from supabase import create_client, Client
from functools import lru_cache
from ..core.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY

# Cache das instâncias de clientes Supabase para evitar recriação desnecessária
@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Retorna uma instância cached do cliente Supabase normal"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL e SUPABASE_KEY devem estar configuradas")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """Retorna uma instância cached do cliente Supabase admin"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar configuradas")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Instâncias globais otimizadas (lazy loading)
supabase_client: Client = None
supabase_admin: Client = None

def init_supabase_clients():
    """Inicializa os clientes Supabase de forma lazy"""
    global supabase_client, supabase_admin
    
    try:
        if SUPABASE_URL and SUPABASE_KEY and not supabase_client:
            supabase_client = get_supabase_client()
            print("✅ Cliente Supabase inicializado com sucesso")
    except Exception as e:
        print(f"⚠️ Erro ao inicializar cliente Supabase: {e}")

    try:
        if SUPABASE_URL and SUPABASE_SERVICE_KEY and not supabase_admin:
            supabase_admin = get_supabase_admin()
            print("✅ Cliente Supabase Admin inicializado com sucesso")
    except Exception as e:
        print(f"⚠️ Erro ao inicializar cliente Supabase Admin: {e}")

# Inicializar automaticamente
init_supabase_clients()

# Funções de acesso otimizadas
def get_client() -> Client:
    """Retorna o cliente Supabase, inicializando se necessário"""
    global supabase_client
    if not supabase_client:
        init_supabase_clients()
    if not supabase_client:
        raise ValueError("Cliente Supabase não está disponível")
    return supabase_client

def get_admin_client() -> Client:
    """Retorna o cliente Supabase admin, inicializando se necessário"""
    global supabase_admin
    if not supabase_admin:
        init_supabase_clients()
    if not supabase_admin:
        raise ValueError("Cliente Supabase admin não está disponível")
    return supabase_admin

# Remover a função get_supabase_client, pois usaremos as instâncias globais
# def get_supabase_client() -> Client:
#     url: str = os.environ.get("SUPABASE_URL")
#     key: str = os.environ.get("SUPABASE_KEY")
#     if not url or not key:
#         raise ValueError("Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem estar configuradas.")
#     return create_client(url, key) 
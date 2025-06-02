import os
from functools import lru_cache
from supabase import create_client, Client
from ..core.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY

@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Cria e retorna um cliente Supabase otimizado com cache.
    Usa LRU cache para evitar múltiplas instâncias.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL e SUPABASE_KEY devem estar configuradas")
    
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """
    Cria e retorna um cliente Supabase admin otimizado com cache.
    Usa LRU cache para evitar múltiplas instâncias.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar configuradas")
    
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Instâncias dos clientes Supabase (lazy loading com cache)
try:
    supabase_client = get_supabase_client()
    supabase_admin = get_supabase_admin()
    print("✅ Clientes Supabase inicializados com sucesso")
except ValueError as e:
    print(f"⚠️ AVISO: {e}")
    supabase_client = None
    supabase_admin = None
except Exception as e:
    print(f"❌ ERRO ao inicializar Supabase: {e}")
    supabase_client = None
    supabase_admin = None

# Remover a função get_supabase_client, pois usaremos as instâncias globais
# def get_supabase_client() -> Client:
#     url: str = os.environ.get("SUPABASE_URL")
#     key: str = os.environ.get("SUPABASE_KEY")
#     if not url or not key:
#         raise ValueError("Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem estar configuradas.")
#     return create_client(url, key) 
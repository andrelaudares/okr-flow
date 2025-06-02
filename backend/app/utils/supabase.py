import os
from supabase import create_client, Client
from functools import lru_cache

# Configurações do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # anon key
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # service_role key

@lru_cache(maxsize=None)
def get_supabase_client() -> Client:
    """Cliente Supabase para operações normais (anon key)"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@lru_cache(maxsize=None) 
def get_supabase_admin() -> Client:
    """Cliente Supabase para operações administrativas (service_role key)"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    
    # Criar cliente admin com service_role key para máximos privilégios
    admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return admin_client

@lru_cache(maxsize=None)
def get_supabase_super_admin() -> Client:
    """Cliente Supabase com configurações especiais para operações críticas como alteração de senha"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    
    # Criar um cliente especial com configurações máximas de privilégio
    super_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return super_admin

# Instâncias globais
supabase_client = get_supabase_client()
supabase_admin = get_supabase_admin()
supabase_super_admin = get_supabase_super_admin()

# Para compatibilidade com código existente
def check_connection():
    """Verifica se a conexão está funcionando"""
    try:
        if supabase_admin:
            # Teste simples de conectividade
            test = supabase_admin.from_('users').select('id').limit(1).execute()
            return True
    except Exception as e:
        print(f"Erro de conexão Supabase: {e}")
        return False
    return False

# Funções de acesso otimizadas
def get_client() -> Client:
    """Retorna o cliente Supabase, inicializando se necessário"""
    global supabase_client
    if not supabase_client:
        supabase_client = get_supabase_client()
    if not supabase_client:
        raise ValueError("Cliente Supabase não está disponível")
    return supabase_client

def get_admin_client() -> Client:
    """Retorna o cliente Supabase admin, inicializando se necessário"""
    global supabase_admin
    if not supabase_admin:
        supabase_admin = get_supabase_admin()
    if not supabase_admin:
        raise ValueError("Cliente Supabase admin não está disponível")
    return supabase_admin

def get_super_admin_client() -> Client:
    """Retorna o cliente Supabase super admin, inicializando se necessário"""
    global supabase_super_admin
    if not supabase_super_admin:
        supabase_super_admin = get_supabase_super_admin()
    if not supabase_super_admin:
        raise ValueError("Cliente Supabase super admin não está disponível")
    return supabase_super_admin

# Remover a função get_supabase_client, pois usaremos as instâncias globais
# def get_supabase_client() -> Client:
#     url: str = os.environ.get("SUPABASE_URL")
#     key: str = os.environ.get("SUPABASE_KEY")
#     if not url or not key:
#         raise ValueError("Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem estar configuradas.")
#     return create_client(url, key) 
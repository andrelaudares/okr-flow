import os
from supabase import create_client, Client
from ..core.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY

# Instâncias dos clientes Supabase (apenas se as variáveis estiverem definidas)
supabase_client: Client = None
supabase_admin: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("AVISO: Cliente Supabase não inicializado - variáveis de ambiente não configuradas")

if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
else:
    print("AVISO: Cliente Supabase Admin não inicializado - variáveis de ambiente não configuradas")

# Remover a função get_supabase_client, pois usaremos as instâncias globais
# def get_supabase_client() -> Client:
#     url: str = os.environ.get("SUPABASE_URL")
#     key: str = os.environ.get("SUPABASE_KEY")
#     if not url or not key:
#         raise ValueError("Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem estar configuradas.")
#     return create_client(url, key) 
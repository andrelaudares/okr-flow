import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
ASAAS_API_KEY = os.getenv("ASAAS_API_KEY")

# Verificar se as variáveis essenciais estão definidas apenas em produção
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if ENVIRONMENT == "production":
    if not SUPABASE_URL or not SUPABASE_KEY or not SUPABASE_SERVICE_KEY or not ASAAS_API_KEY:
        raise EnvironmentError("Uma ou mais variáveis de ambiente essenciais (SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY, ASAAS_API_KEY) não estão configuradas.")
else:
    # Em desenvolvimento, usar valores padrão se não estiverem definidos
    if not SUPABASE_URL:
        print("AVISO: SUPABASE_URL não definida. Configure o arquivo .env para testar.")
    if not SUPABASE_KEY:
        print("AVISO: SUPABASE_KEY não definida. Configure o arquivo .env para testar.")
    if not SUPABASE_SERVICE_KEY:
        print("AVISO: SUPABASE_SERVICE_KEY não definida. Configure o arquivo .env para testar.")
    if not ASAAS_API_KEY:
        print("AVISO: ASAAS_API_KEY não definida. Configure o arquivo .env para testar.") 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
import asyncio
import time
from .routers import auth, users, subscriptions, companies, cycles, dashboard, objectives, key_results, reports, analytics, notifications, global_cycles
from .core.settings import settings

# Task para renovação automática de conexões
_refresh_task = None

async def refresh_connections_periodically():
    """Task que roda em background para renovar conexões do Supabase periodicamente"""
    from .utils.supabase import refresh_all_connections, check_connection
    
    while True:
        try:
            # Aguardar 1 hora (3600 segundos)
            await asyncio.sleep(3600)
            
            print("🔄 Verificando conexões Supabase...")
            
            # Verificar se a conexão está funcionando
            if not check_connection():
                print("⚠️  Conexão Supabase com problemas, renovando...")
                refresh_all_connections()
            else:
                print("✅ Conexões Supabase funcionando normalmente")
                
        except asyncio.CancelledError:
            print("🛑 Task de renovação de conexões cancelada")
            break
        except Exception as e:
            print(f"❌ Erro na task de renovação: {e}")
            # Continuar mesmo com erro
            await asyncio.sleep(300)  # Aguardar 5 minutos antes de tentar novamente

# Lifecycle manager otimizado para startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _refresh_task
    
    # Startup
    print("🚀 Sistema OKR Backend iniciando...")
    print(f"   🗜️  Compressão GZip: {'Ativada' if settings.ENABLE_GZIP else 'Desativada'}")
    print(f"   💾 Cache TTL: {settings.CACHE_TTL}s")
    print(f"   🔧 Configurações carregadas com sucesso")
    
    # Verificar conexão inicial
    from .utils.supabase import check_connection
    if check_connection():
        print("✅ Conexão inicial com Supabase: OK")
    else:
        print("⚠️  Conexão inicial com Supabase: FALHOU")
    
    # Iniciar task de renovação automática de conexões
    print("🔄 Iniciando sistema de renovação automática de conexões...")
    _refresh_task = asyncio.create_task(refresh_connections_periodically())
    
    yield
    
    # Shutdown
    print("🛑 Sistema OKR Backend finalizando...")
    print("   🧹 Limpando recursos...")
    
    # Cancelar task de renovação
    if _refresh_task:
        _refresh_task.cancel()
        try:
            await _refresh_task
        except asyncio.CancelledError:
            pass
    
    print("✅ Shutdown completo")

# Configuração otimizada do FastAPI
app = FastAPI(
    title="Sistema OKR - Backend API", 
    version="1.0.0",
    description="Backend para sistema de gestão de OKRs com autenticação hierárquica",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    # Fix para redirecionamentos 307 - IMPORTANTE!
    redirect_slashes=False,  # Evita redirecionamentos automáticos
    root_path=""  # Fix para proxy reverso
)

# Middleware de compressão GZip para melhorar performance
if settings.ENABLE_GZIP:
    app.add_middleware(GZipMiddleware, minimum_size=1000)

# Middleware de hosts confiáveis (segurança) - ATUALIZADO
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=[
        "localhost", 
        "127.0.0.1", 
        "*.vercel.app", 
        "*.railway.app",
        "*.up.railway.app",
        "*"  # Permite todos em produção (Railway configura isso)
    ]
)

# CORS otimizado e mais limpo - CORRIGIDO para produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://okr.nobug.com.br",  # Novo domínio personalizado
        "https://okr-flow.vercel.app",
        "https://okr-flow-andrelaudares-projects.vercel.app",
        "https://okr-flow-*.vercel.app",  # Para preview deploys
        "http://localhost:3000",
        "http://localhost:5173",
        "*"  # Fallback para desenvolvimento
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
# Incluir os roteadores com prefixos da API - SEM barra final!
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(users.router, prefix="/api/users", tags=["Usuários"])
app.include_router(companies.router, prefix="/api/companies", tags=["Empresas"])
app.include_router(cycles.router, prefix="/api/cycles", tags=["Ciclos"])
app.include_router(objectives.router, prefix="/api/objectives", tags=["Objetivos"])
app.include_router(key_results.router, prefix="/api/objectives", tags=["Key Results"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(reports.router, prefix="/api/reports", tags=["Relatórios"])
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notificações"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Assinaturas"])
app.include_router(global_cycles.router, prefix="/api/global-cycles", tags=["Ciclos Globais"])

@app.get("/")
async def root():
    """Health Check endpoint otimizado"""
    from .utils.supabase import check_connection
    
    supabase_status = "OK" if check_connection() else "ERROR"
    
    return {
        "message": "Bem-vindo à API do Sistema OKR",
        "status": "API está online",
        "version": "1.0.0",
        "sprint": "Sprint 9 - Sistema de Notificações e Integrações",
        "supabase_connection": supabase_status,
        "performance": {
            "gzip_enabled": settings.ENABLE_GZIP,
            "cache_ttl": settings.CACHE_TTL,
            "connection_timeout": settings.CONNECTION_TIMEOUT
        }
    }

@app.get("/health")
async def health_check():
    """Endpoint adicional para verificação de saúde"""
    from .utils.supabase import check_connection
    
    supabase_status = check_connection()
    
    return {
        "status": "healthy" if supabase_status else "degraded", 
        "timestamp": "2024",
        "supabase": "connected" if supabase_status else "disconnected",
        "config": {
            "workers": settings.WORKERS_COUNT,
            "timeout_keep_alive": settings.TIMEOUT_KEEP_ALIVE,
            "environment": "production" if settings.LOG_LEVEL == "WARNING" else "development"
        }
    }

@app.post("/admin/refresh-connections")
async def force_refresh_connections():
    """Endpoint administrativo para forçar renovação de conexões"""
    try:
        from .utils.supabase import refresh_all_connections, check_connection
        
        print("🔧 Renovação manual de conexões solicitada...")
        refresh_all_connections()
        
        # Verificar se funcionou
        status = check_connection()
        
        return {
            "message": "Conexões renovadas com sucesso",
            "supabase_status": "OK" if status else "ERROR",
            "timestamp": time.time()
        }
    except Exception as e:
        print(f"❌ Erro na renovação manual: {e}")
        return {
            "message": "Erro ao renovar conexões",
            "error": str(e),
            "timestamp": time.time()
        }

# Configuração para execução direta (opcional)
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        timeout_keep_alive=settings.TIMEOUT_KEEP_ALIVE,
        timeout_graceful_shutdown=settings.TIMEOUT_GRACEFUL_SHUTDOWN
    )

# Nota: Para rodar esta aplicação, você precisará de um arquivo .env
# com as variáveis SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY e ASAAS_API_KEY.
# Use `uvicorn app.main:app --reload --timeout-keep-alive 30` no diretório backend/ 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
from .routers import auth, users, subscriptions, companies, cycles, dashboard, objectives, key_results, reports, analytics, notifications, global_cycles
from .core.settings import settings

# Lifecycle manager otimizado para startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Sistema OKR Backend iniciando...")
    print(f"   🗜️  Compressão GZip: {'Ativada' if settings.ENABLE_GZIP else 'Desativada'}")
    print(f"   💾 Cache TTL: {settings.CACHE_TTL}s")
    print(f"   🔧 Configurações carregadas com sucesso")
    # Aqui você pode adicionar inicializações de pools de conexão, cache, etc.
    yield
    # Shutdown
    print("🛑 Sistema OKR Backend finalizando...")
    print("   🧹 Limpando recursos...")
    # Aqui você pode limpar recursos, fechar conexões, etc.

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
    allow_origins=["*"],  # Modificado para wildcard
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # Modificado para wildcard
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
    return {
        "message": "Bem-vindo à API do Sistema OKR",
        "status": "API está online",
        "version": "1.0.0",
        "sprint": "Sprint 9 - Sistema de Notificações e Integrações",
        "performance": {
            "gzip_enabled": settings.ENABLE_GZIP,
            "cache_ttl": settings.CACHE_TTL,
            "connection_timeout": settings.CONNECTION_TIMEOUT
        }
    }

@app.get("/health")
async def health_check():
    """Endpoint adicional para verificação de saúde"""
    return {
        "status": "healthy", 
        "timestamp": "2024",
        "config": {
            "workers": settings.WORKERS_COUNT,
            "timeout_keep_alive": settings.TIMEOUT_KEEP_ALIVE,
            "environment": "production" if settings.LOG_LEVEL == "WARNING" else "development"
        }
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
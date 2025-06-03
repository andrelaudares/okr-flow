from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi import HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import asyncio
import time
from .routers import auth, users, subscriptions, companies, cycles, dashboard, objectives, key_results, reports, analytics, notifications, global_cycles
from .core.settings import settings

# Task para renovação automática de conexões
_refresh_task = None

# 🔧 Middleware personalizado para detectar e resolver problemas de JWT automaticamente
class JWTHealthMiddleware:
    """Middleware que detecta problemas de JWT e renova conexões automaticamente"""
    
    def __init__(self, app):
        self.app = app
        self.last_jwt_error_time = 0
        self.jwt_error_count = 0
        
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
            
        request = Request(scope, receive)
        
        # Detectar se é uma rota que usa Supabase
        path = request.url.path
        uses_supabase = any(route in path for route in [
            "/api/auth", "/api/users", "/api/companies", "/api/cycles", 
            "/api/objectives", "/api/dashboard", "/api/reports"
        ])
        
        if not uses_supabase:
            await self.app(scope, receive, send)
            return
        
        # Função para capturar respostas
        response_body = b""
        status_code = 200
        
        async def send_wrapper(message):
            nonlocal response_body, status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            elif message["type"] == "http.response.body":
                response_body += message.get("body", b"")
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
            
            # Se houve erro 500 e suspeita de JWT expirado
            if status_code == 500:
                response_text = response_body.decode('utf-8', errors='ignore').lower()
                jwt_expired = any(error in response_text for error in [
                    'jwt expired', 'pgrst301', 'expired', 'invalid jwt', 'token has expired'
                ])
                
                if jwt_expired:
                    current_time = time.time()
                    
                    # Evitar renovações muito frequentes (máximo 1 por minuto)
                    if current_time - self.last_jwt_error_time > 60:
                        print("🔧 Middleware: JWT expirado detectado, renovando conexões...")
                        
                        try:
                            from .utils.supabase import refresh_all_connections
                            refresh_all_connections()
                            self.last_jwt_error_time = current_time
                            self.jwt_error_count += 1
                            print(f"✅ Middleware: Conexões renovadas (total: {self.jwt_error_count})")
                        except Exception as e:
                            print(f"❌ Middleware: Erro ao renovar conexões: {e}")
                    
        except Exception as e:
            print(f"🚨 Middleware: Erro inesperado: {e}")
            await self.app(scope, receive, send)

async def refresh_connections_periodically():
    """Task que roda em background para renovar conexões do Supabase periodicamente"""
    from .utils.supabase import refresh_all_connections, check_connection
    
    while True:
        try:
            # Aguardar 30 minutos em vez de 1 hora para evitar JWT expirado
            await asyncio.sleep(1800)  # 30 minutos
            
            print("🔄 Verificando conexões Supabase...")
            
            # Verificar se a conexão está funcionando
            if not check_connection():
                print("⚠️  Conexão Supabase com problemas, renovando...")
                refresh_all_connections()
                
                # Verificar novamente após renovação
                if check_connection():
                    print("✅ Conexões renovadas com sucesso")
                else:
                    print("❌ Falha na renovação - problemas persistem")
            else:
                print("✅ Conexões Supabase funcionando normalmente")
                # Renovar proativamente mesmo quando funcionando (evitar JWT expirar)
                refresh_all_connections()
                print("🔄 Renovação proativa concluída")
                
        except asyncio.CancelledError:
            print("🛑 Task de renovação de conexões cancelada")
            break
        except Exception as e:
            print(f"❌ Erro na task de renovação: {e}")
            # Tentar renovar mesmo com erro
            try:
                refresh_all_connections()
                print("🔧 Renovação de emergência executada")
            except Exception as e_emergency:
                print(f"❌ Falha na renovação de emergência: {e_emergency}")
            
            # Aguardar menos tempo antes de tentar novamente
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

# 🔧 Middleware personalizado para detectar problemas de JWT (DEVE ser adicionado ANTES dos outros)
app.add_middleware(JWTHealthMiddleware)

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
    """Endpoint adicional para verificação de saúde com informações detalhadas"""
    from .utils.supabase import check_connection, get_connectivity_status
    import os
    
    supabase_status = check_connection()
    connectivity_info = get_connectivity_status()
    
    # Detectar ambiente
    environment = os.getenv("ENVIRONMENT", "development").lower()
    is_local = environment in ["development", "dev", "local"]
    
    health_data = {
        "status": "healthy" if supabase_status else "degraded", 
        "timestamp": time.time(),
        "environment": environment,
        "supabase": "connected" if supabase_status else "disconnected",
        "connectivity_details": connectivity_info,
        "jwt_health": {
            "needs_refresh": not supabase_status,
            "last_refresh": connectivity_info.get("last_success", 0),
            "error_count": connectivity_info.get("error_count", 0)
        },
        "config": {
            "workers": settings.WORKERS_COUNT,
            "timeout_keep_alive": settings.TIMEOUT_KEEP_ALIVE,
            "environment": "production" if settings.LOG_LEVEL == "WARNING" else "development"
        }
    }
    
    # Em ambiente local, adicionar informações de diagnóstico
    if is_local:
        health_data["local_diagnostics"] = {
            "supabase_url_configured": bool(os.getenv("SUPABASE_URL")),
            "supabase_key_configured": bool(os.getenv("SUPABASE_KEY")),
            "supabase_service_key_configured": bool(os.getenv("SUPABASE_SERVICE_KEY")),
            "cors_origins": [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8080"
            ],
            "tips": [
                "Verifique se o arquivo backend/.env existe",
                "Confirme se as credenciais Supabase estão corretas",
                "Teste a conectividade com internet"
            ]
        }
    
    return health_data

@app.get("/monitor/jwt-status")
async def monitor_jwt_status():
    """Endpoint de monitoramento específico para status dos JWTs (pode ser chamado pelo frontend)"""
    try:
        from .utils.supabase import get_admin_client, _test_client_health, get_connectivity_status
        
        # Testar cliente admin
        admin_client = get_admin_client()
        admin_healthy = _test_client_health(admin_client) if admin_client else False
        
        connectivity = get_connectivity_status()
        
        current_time = time.time()
        last_success = connectivity.get("last_success", 0)
        time_since_success = current_time - last_success
        
        # Determinar se precisa de renovação
        needs_refresh = (
            not admin_healthy or 
            time_since_success > 1800 or  # Mais de 30 minutos sem sucesso
            connectivity.get("consecutive_failures", 0) > 2
        )
        
        return {
            "jwt_healthy": admin_healthy,
            "needs_refresh": needs_refresh,
            "time_since_last_success_minutes": round(time_since_success / 60, 1),
            "consecutive_failures": connectivity.get("consecutive_failures", 0),
            "error_count": connectivity.get("error_count", 0),
            "last_error": connectivity.get("last_error"),
            "timestamp": current_time,
            "recommended_action": "refresh_tokens" if needs_refresh else "none"
        }
        
    except Exception as e:
        return {
            "jwt_healthy": False,
            "needs_refresh": True,
            "error": str(e),
            "timestamp": time.time(),
            "recommended_action": "refresh_tokens"
        }

@app.get("/debug/connectivity")
async def debug_connectivity():
    """Endpoint de debug para problemas de conectividade (apenas ambiente local)"""
    import os
    from .utils.supabase import get_connectivity_status, refresh_all_connections
    
    environment = os.getenv("ENVIRONMENT", "development").lower()
    if environment not in ["development", "dev", "local"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint não disponível em produção"
        )
    
    # Obter status atual
    connectivity_status = get_connectivity_status()
    
    # Tentar renovar conexões
    try:
        print("DEBUG: Renovando conexões para diagnóstico...")
        refresh_all_connections()
        renewed_status = get_connectivity_status()
        renewal_success = True
    except Exception as e:
        renewed_status = str(e)
        renewal_success = False
    
    return {
        "message": "Diagnóstico de conectividade",
        "current_status": connectivity_status,
        "renewal_attempted": True,
        "renewal_success": renewal_success,
        "renewed_status": renewed_status,
        "environment_variables": {
            "SUPABASE_URL": "✓ Configurada" if os.getenv("SUPABASE_URL") else "✗ Não configurada",
            "SUPABASE_KEY": "✓ Configurada" if os.getenv("SUPABASE_KEY") else "✗ Não configurada", 
            "SUPABASE_SERVICE_KEY": "✓ Configurada" if os.getenv("SUPABASE_SERVICE_KEY") else "✗ Não configurada",
            "ENVIRONMENT": os.getenv("ENVIRONMENT", "development")
        },
        "recommendations": [
            "Execute: cp backend/env.example backend/.env",
            "Configure suas credenciais Supabase no arquivo .env",
            "Verifique sua conexão com internet",
            "Reinicie o servidor backend após configurar"
        ]
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

@app.post("/admin/check-jwt-health")
async def check_jwt_health():
    """Endpoint para verificar saúde dos JWTs e renovar se necessário"""
    try:
        from .utils.supabase import get_admin_client, _test_client_health, refresh_all_connections
        
        print("🔍 Verificando saúde dos tokens JWT...")
        
        # Testar cliente admin
        admin_client = get_admin_client()
        admin_healthy = _test_client_health(admin_client)
        
        result = {
            "admin_jwt_healthy": admin_healthy,
            "timestamp": time.time(),
            "action_taken": None
        }
        
        if not admin_healthy:
            print("🔧 JWT admin com problemas, renovando...")
            refresh_all_connections()
            
            # Testar novamente
            admin_client_new = get_admin_client()
            admin_healthy_new = _test_client_health(admin_client_new)
            
            result.update({
                "admin_jwt_healthy_after_refresh": admin_healthy_new,
                "action_taken": "refresh_connections",
                "message": "Conexões renovadas devido a JWT expirado"
            })
        else:
            result["message"] = "Todos os JWTs estão funcionando normalmente"
        
        return result
        
    except Exception as e:
        print(f"❌ Erro na verificação de JWT: {e}")
        return {
            "error": str(e),
            "timestamp": time.time(),
            "message": "Erro ao verificar saúde dos JWTs"
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
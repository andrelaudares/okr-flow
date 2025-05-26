from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, subscriptions, companies, cycles, dashboard, objectives, key_results, reports, analytics, notifications

app = FastAPI(
    title="Sistema OKR - Backend API", 
    version="1.0.0",
    description="Backend para sistema de gestão de OKRs com autenticação hierárquica"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://127.0.0.1:5173", "http://127.0.0.1:8080"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Incluir os roteadores com prefixos da API
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

@app.get("/", summary="Health Check")
async def read_root():
    return {
        "status": "API está online",
        "version": "1.0.0",
        "sprint": "Sprint 9 - Sistema de Notificações e Integrações"
    }

@app.get("/health", summary="Health Check Detalhado")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "sprint": "Sprint 9",
        "features": [
            "Autenticação com Supabase",
            "Registro de usuário owner",
            "Gestão hierárquica de usuários",
            "Sistema de permissões",
            "CRUD completo de usuários",
            "Gestão de empresas",
            "Sistema de ciclos temporais",
            "Cards estáticos do dashboard",
            "CRUD completo de objetivos",
            "Sistema de filtros e busca",
            "CRUD completo de Key Results",
            "Sistema de check-ins",
            "Cálculo automático de progresso",
            "Dashboard cards variáveis",
            "Estatísticas em tempo real",
            "Métricas de progresso",
            "Contadores de objetivos",
            "Evolução temporal",
            "Sistema de relatórios",
            "Exportação em múltiplos formatos",
            "Geração em background",
            "Download de arquivos",
            "Sistema de histórico e analytics",
            "Análise de tendências",
            "Métricas de performance",
            "Insights automáticos",
            "Evolução temporal de objetivos",
            "Sistema de notificações",
            "Alertas automáticos",
            "Configurações de notificação por usuário",
            "Notificações de check-in pendente",
            "Notificações de objetivo atrasado",
            "Notificações de fim de ciclo",
            "Notificações de meta atingida",
            "Estatísticas de notificações",
            "Filtros e paginação de notificações"
        ]
    }

# Nota: Para rodar esta aplicação, você precisará de um arquivo .env
# com as variáveis SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY e ASAAS_API_KEY.
# Use `uvicorn app.main:app --reload` no diretório backend/ 
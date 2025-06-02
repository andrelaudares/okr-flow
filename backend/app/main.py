from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, subscriptions, companies, cycles, dashboard, objectives, key_results, reports, analytics, notifications, global_cycles

# Criar aplicação FastAPI simples e robusta
app = FastAPI(
    title="Sistema OKR - Backend API", 
    version="1.0.0",
    description="Backend para sistema de gestão de OKRs com autenticação hierárquica"
)

# Configurar CORS otimizado
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:8080", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:8080",
        "https://okr-flow-git-main-andrelaudares-projects.vercel.app", 
        "https://okr-flow.vercel.app", 
        "https://okr-flow-production.up.railway.app", 
        "https://okr-flow-kdzrqf3ft-andrelaudares-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
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
app.include_router(global_cycles.router, prefix="/api/global-cycles", tags=["Ciclos Globais"])

@app.get("/")
async def root():
    return {
        "status": "API está online",
        "version": "1.0.0",
        "sprint": "Sprint 9 - Sistema de Notificações e Integrações"
    }

# Nota: Para rodar esta aplicação, você precisará de um arquivo .env
# com as variáveis SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY e ASAAS_API_KEY.
# Use `uvicorn app.main:app --reload --timeout-keep-alive 30` no diretório backend/ # Executar servidor diretamente (sem script separado)
#
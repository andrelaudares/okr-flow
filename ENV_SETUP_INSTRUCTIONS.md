# 🔧 Configuração de Variáveis de Ambiente

Antes de executar o Docker, você precisa criar o arquivo `backend/.env` com suas credenciais.

## 📝 Crie o arquivo backend/.env

Crie um arquivo chamado `.env` dentro da pasta `backend` com o seguinte conteúdo:

```env
# =================================================================
# CONFIGURAÇÃO SUPABASE (SUAS CREDENCIAIS)
# =================================================================
SUPABASE_URL=https://tqdhcxzioahowqapftxb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZGhjeHppb2Fob3dxYXBmdHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjQ3OTMsImV4cCI6MjA2MzQ0MDc5M30.2gjDsqrT_Kx39-XmenGBgU4pvwpTPoKAYIedsh_H7XU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZGhjeHppb2Fob3dxYXBmdHhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg2NDc5MywiZXhwIjoyMDYzNDQwNzkzfQ.elgZeOXS5LA6SK4ni1034VkUHP0VuAkJN_70n-efqJM

# =================================================================
# CONFIGURAÇÃO DE PAGAMENTO
# =================================================================
ASAAS_API_KEY=aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjE5YzNhZmM0LTMwZGQtNDkzNy05YmNlLWZiNmRiYTkwM2EzYzo6JGFhY2hfMmEwOWIwNjEtMDU5Mi00MzRkLWE4YzYtOWQwNzBjYmU5ZGJm
ASAAS_BASE_URL=https://www.asaas.com/api/v3

# =================================================================
# CONFIGURAÇÕES PARA DOCKER (IMPORTANTES!)
# =================================================================
ENVIRONMENT=production
LOG_LEVEL=INFO
WORKERS_COUNT=4
TIMEOUT_KEEP_ALIVE=65
ENABLE_GZIP=true

# CORS E FRONTEND - AJUSTADO PARA DOCKER
FRONTEND_URL=http://localhost:3002
ALLOWED_ORIGINS=http://localhost:3002,http://localhost:3000

# =================================================================
# CONFIGURAÇÕES DE CACHE E PERFORMANCE
# =================================================================
CACHE_TTL=300
CACHE_MAXSIZE=1000
CONNECTION_POOL_SIZE=20
CONNECTION_TIMEOUT=30

# =================================================================
# CONFIGURAÇÕES DE JWT
# =================================================================
JWT_EXPIRATION_TIME=2592000
JWT_REFRESH_EXPIRATION_TIME=7776000
SESSION_TIMEOUT=86400
EXTEND_SESSION_ON_ACTIVITY=true
```

## 📝 Para o frontend, crie/atualize frontend/.env

```env
# CONFIGURAÇÃO PARA DOCKER
VITE_API_URL=http://localhost:8001
VITE_ENVIRONMENT=production
```

## 🚨 Diferenças importantes para Docker:

### Portas no Docker:
- **Backend**: Roda internamente na porta 8000, mas é exposto na **8001**
- **Frontend**: Roda internamente na porta 80, mas é exposto na **3002**

### URLs de comunicação:
- Frontend acessa backend via: `http://localhost:8001`
- CORS do backend permite: `http://localhost:3002`

## ⚡ Execução Rápida

```bash
# Na raiz do projeto
docker-compose up -d --build
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs 
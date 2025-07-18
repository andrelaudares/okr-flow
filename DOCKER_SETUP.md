# 🐳 Setup Docker - OKR Flow

Este guia explica como executar a aplicação OKR Flow usando Docker com frontend e backend integrados.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Git

## 🚀 Configuração Rápida

### 1. Clone o repositório (se ainda não tiver)
```bash
git clone <seu-repositorio>
cd okr-flow
```

### 2. Configure as variáveis de ambiente do backend

Crie o arquivo `backend/.env` com suas credenciais do Supabase:

```env
# Credenciais do Supabase (OBRIGATÓRIAS)
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_publica_do_supabase
SUPABASE_SERVICE_KEY=sua_chave_de_servico_do_supabase

# Opcionais - Configurações de Performance
WORKERS_COUNT=4
TIMEOUT_KEEP_ALIVE=65
ENABLE_GZIP=true
LOG_LEVEL=WARNING

# Opcionais - Configurações de JWT
JWT_EXPIRATION_TIME=2592000
JWT_REFRESH_EXPIRATION_TIME=7776000
SESSION_TIMEOUT=86400

# Opcionais - Configurações de Pagamento
ASAAS_API_KEY=sua_chave_do_asaas
ASAAS_BASE_URL=https://www.asaas.com/api/v3
```

### 3. Execute a aplicação

```bash
# Build e start dos containers
docker-compose up -d --build

# Para ver os logs em tempo real
docker-compose logs -f
```

### 4. Acesse a aplicação

- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:8001
- **Documentação da API**: http://localhost:8001/docs

## 🔧 Comandos Úteis

### Gerenciamento dos containers
```bash
# Parar todos os services
docker-compose down

# Restart dos services
docker-compose restart

# Ver status dos containers
docker-compose ps

# Ver logs específicos
docker-compose logs okr-backend
docker-compose logs okr-frontend

# Rebuild completo (quando houver mudanças no código)
docker-compose down
docker-compose up -d --build
```

### Debugging
```bash
# Acessar container do backend
docker exec -it okr-flow-backend /bin/bash

# Acessar container do frontend
docker exec -it okr-flow-frontend /bin/sh

# Ver logs específicos com follow
docker-compose logs -f okr-backend
```

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React/Vite)  │◄──►│   (FastAPI)     │
│   Port: 3002    │    │   Port: 8001    │
│   nginx:alpine  │    │   python:3.11   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
            ┌─────────────┐
            │   Network   │
            │ okr-network │
            └─────────────┘
```

## 🔀 Comunicação entre Services

- O **frontend** se comunica com o **backend** através da rede interna do Docker (`okr-backend:8000`)
- Para acesso externo, use as portas mapeadas:
  - Frontend: `localhost:3002`
  - Backend: `localhost:8001`

## 📊 Health Checks

Ambos os services têm health checks configurados:

- **Backend**: `http://localhost:8001/health`
- **Frontend**: `http://localhost:3002/health`

## 🐛 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose logs [service-name]

# Verificar se as portas estão livres
netstat -an | grep 3002
netstat -an | grep 8001
```

### Problemas de conexão entre frontend/backend
```bash
# Verificar rede
docker network ls
docker network inspect okr-flow_okr-network

# Testar conectividade
docker exec okr-flow-frontend ping okr-backend
```

### Rebuild limpo
```bash
# Parar tudo e limpar
docker-compose down
docker system prune -f

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

## 📝 Notas Importantes

1. **Variáveis de Ambiente**: O arquivo `backend/.env` é obrigatório
2. **Primeira Execução**: Pode demorar alguns minutos para build inicial
3. **Hot Reload**: Em desenvolvimento, as mudanças requerem rebuild
4. **Persistence**: Logs são persistidos em `backend/logs/`
5. **Network**: Os containers se comunicam via rede `okr-network`

## 🔄 Atualizações

Para aplicar mudanças no código:

```bash
# Para mudanças no frontend
docker-compose up -d --build okr-frontend

# Para mudanças no backend  
docker-compose up -d --build okr-backend

# Para mudanças em ambos
docker-compose down
docker-compose up -d --build
``` 
# 🐳 Docker Setup - Sistema OKR Backend

Este guia explica como configurar e executar o Sistema OKR Backend usando Docker.

## 🏗️ Arquitetura

### Componentes
- **Frontend**: Vercel (`https://okr.nobug.com.br`)
- **Backend**: Docker Container (porta 8001)
- **Banco de Dados**: Supabase (PostgreSQL)

### Fluxo de Dados
```
Frontend (Vercel) → Backend (Docker) → Supabase (PostgreSQL)
```

## ⚡ Quick Start

### 1. Pré-requisitos
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:
```bash
cp env.example .env
nano .env
```

Configure as variáveis obrigatórias:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica
SUPABASE_SERVICE_KEY=sua-chave-de-servico
```

### 3. Executar com Script Automatizado

```bash
# Deploy em produção
./deploy.sh --prod

# Deploy em desenvolvimento
./deploy.sh --dev

# Atualizar sistema existente
./deploy.sh --update
```

### 4. Executar Manualmente

```bash
# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f okr-backend
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente Disponíveis

#### Obrigatórias
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_KEY`: Chave pública do Supabase
- `SUPABASE_SERVICE_KEY`: Chave de serviço do Supabase

#### Performance
- `WORKERS_COUNT`: Número de workers (padrão: 4)
- `TIMEOUT_KEEP_ALIVE`: Timeout keep-alive (padrão: 65s)
- `ENABLE_GZIP`: Habilitar compressão GZip (padrão: true)
- `LOG_LEVEL`: Nível de log (padrão: WARNING)

#### Cache
- `CACHE_TTL`: Tempo de vida do cache (padrão: 300s)
- `CACHE_MAXSIZE`: Tamanho máximo do cache (padrão: 1000)

#### JWT
- `JWT_EXPIRATION_TIME`: Tempo de expiração do JWT (padrão: 30 dias)
- `JWT_REFRESH_EXPIRATION_TIME`: Tempo de expiração do refresh token (padrão: 90 dias)
- `SESSION_TIMEOUT`: Timeout da sessão (padrão: 24 horas)

### Configuração de Recursos

O docker-compose.yml já inclui limites de recursos:
```yaml
resources:
  limits:
    cpus: '2.0'
    memory: 1G
  reservations:
    cpus: '0.5'
    memory: 512M
```

## 🌐 Conexão Frontend-Backend

### 1. Obter IP do Servidor

```bash
# IP local
hostname -I | awk '{print $1}'

# IP público (se disponível)
curl -s https://api.ipify.org
```

### 2. Configurar Frontend (Vercel)

No painel da Vercel, adicione as variáveis de ambiente:

```env
VITE_API_URL=http://IP_DO_SERVIDOR:8001
VITE_API_BASE_URL=http://IP_DO_SERVIDOR:8001/api
```

### 3. Configurar CORS

O backend já está configurado para aceitar requisições de:
- `https://okr.nobug.com.br`
- `https://okr-flow.vercel.app`
- `https://okr-flow-*.vercel.app`

Para adicionar novos domínios, edite `app/main.py`:
```python
allow_origins=[
    "https://okr.nobug.com.br",
    "https://seu-novo-dominio.com",
    # ...
]
```

## 🔍 Monitoramento

### Health Checks

```bash
# Verificar saúde básica
curl http://localhost:8001/health

# Verificar conectividade detalhada
curl http://localhost:8001/debug/connectivity

# Verificar status JWT
curl http://localhost:8001/monitor/jwt-status
```

### Logs

```bash
# Logs em tempo real
docker-compose logs -f okr-backend

# Logs específicos
docker-compose logs --tail=100 okr-backend

# Logs de erro
docker-compose logs okr-backend | grep -i error
```

### Arquivos de Log

Os logs são salvos em:
- `./logs/app.log` - Logs gerais da aplicação
- `./logs/error.log` - Logs de erro
- `./logs/access.log` - Logs de acesso

## 🛡️ Segurança

### Firewall

```bash
# Permitir porta 8001
sudo ufw allow 8001/tcp

# Verificar regras
sudo ufw status
```

### HTTPS (Opcional)

Para usar HTTPS, configure um proxy reverso (Nginx):

```nginx
server {
    listen 443 ssl;
    server_name api.seu-dominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔄 Operações

### Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Restart específico
docker-compose restart okr-backend

# Rebuild completo
docker-compose up -d --build

# Limpar volumes
docker-compose down -v

# Entrar no container
docker-compose exec okr-backend bash

# Verificar recursos
docker stats okr-flow-backend
```

### Backup

```bash
# Backup de configurações
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup

# Backup de logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz ./logs/
```

### Atualização

```bash
# Método 1: Script automatizado
./deploy.sh --update

# Método 2: Manual
docker-compose down
git pull origin main
docker-compose up -d --build
```

## 🚨 Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker-compose logs okr-backend

# Verificar configuração
docker-compose config

# Verificar variáveis de ambiente
docker-compose exec okr-backend env | grep SUPABASE
```

### Erro de conexão Supabase

```bash
# Testar conectividade
curl http://localhost:8001/debug/connectivity

# Verificar variáveis
docker-compose exec okr-backend python -c "from app.core.settings import settings; print(settings.SUPABASE_URL)"
```

### Erro de CORS

```bash
# Testar CORS
curl -H "Origin: https://okr.nobug.com.br" http://localhost:8001/health

# Verificar logs de CORS
docker-compose logs okr-backend | grep -i cors
```

### Alto uso de CPU/Memória

```bash
# Monitorar recursos
docker stats okr-flow-backend

# Reduzir workers
# Editar docker-compose.yml: WORKERS_COUNT=2

# Restart
docker-compose restart okr-backend
```

## 📋 Checklist de Deploy

- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `.env` configurado
- [ ] Porta 8001 liberada no firewall
- [ ] Serviços executando: `docker-compose ps`
- [ ] Health check OK: `curl http://localhost:8001/health`
- [ ] Frontend configurado com IP/URL do servidor
- [ ] CORS funcionando
- [ ] Logs sendo gerados
- [ ] Backup das configurações

## 🎯 Próximos Passos

1. **Configurar Monitoramento**: Considere usar ferramentas como Prometheus/Grafana
2. **SSL/HTTPS**: Configure certificados SSL para segurança
3. **Load Balancer**: Para alta disponibilidade
4. **Alertas**: Configure alertas para problemas de saúde
5. **Backup Automático**: Automatize backups de configurações e logs

---

Para suporte adicional, consulte o arquivo `DOCKER_DEPLOYMENT_GUIDE.md` que contém informações mais detalhadas sobre a arquitetura e configuração. 
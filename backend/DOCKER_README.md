# 🐳 Deploy com Docker - OKR Flow Backend

Este guia explica como executar o backend do sistema OKR Flow usando Docker no servidor do cliente.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados no servidor
- Arquivo `.env` configurado com credenciais Supabase

## 🚀 Como usar

### 1. Preparar arquivo de ambiente

```bash
# Copiar o arquivo de exemplo
cp env.example .env

# Editar com suas credenciais Supabase
nano .env  # ou vim .env
```

**Variáveis obrigatórias no .env:**
```env
SUPABASE_URL=https://seuprojectoid.supabase.co
SUPABASE_KEY=eyJ0eXAiOiJKV1Q1NiIsImFsZyI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1Q1NiIsImFsZyI6IkpXVCJ9...
ENVIRONMENT=production
```

### 2. Executar o sistema

```bash
# Construir e subir o container
docker-compose up -d

# Verificar se está funcionando
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f
```

### 3. Verificar funcionamento

```bash
# Testar API
curl http://localhost:8000/

# Testar health check
curl http://localhost:8000/health
```

## 🔧 Comandos úteis

```bash
# Parar o sistema
docker-compose down

# Reiniciar
docker-compose restart

# Atualizar após mudanças no código
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver logs
docker-compose logs -f okr-backend

# Acessar terminal do container
docker-compose exec okr-backend bash
```

## 🌐 Configuração do Frontend

Após o backend estar rodando, configure o frontend (Vercel) para apontar para o novo servidor:

**Variável de ambiente no Vercel:**
```
VITE_API_URL=http://SEU_SERVIDOR_IP:8000
```

ou com domínio:
```
VITE_API_URL=https://api.seudominio.com
```

## 📊 Monitoramento

### Health Check automático
- O container faz verificações automáticas a cada 30 segundos
- Se a API não responder, o Docker reinicia automaticamente

### Endpoints de monitoramento disponíveis:
- `GET /` - Status geral
- `GET /health` - Verificação detalhada
- `GET /monitor/jwt-status` - Status dos tokens JWT

## 🔒 Segurança

### Firewall recomendado:
```bash
# Permitir apenas porta 8000 para a API
sudo ufw allow 8000/tcp

# Se usar proxy reverso (recomendado):
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
```

### Proxy reverso (Nginx) - Opcional:
```nginx
server {
    listen 80;
    server_name api.seudominio.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📈 Performance

### Configurações para produção (no .env):
```env
WORKERS_COUNT=4          # Número de workers (ajustar conforme CPU)
TIMEOUT_KEEP_ALIVE=65    # Timeout das conexões
ENABLE_GZIP=true         # Compressão habilitada
LOG_LEVEL=WARNING        # Logs menos verbosos
```

### Recursos recomendados:
- **Mínimo:** 1 CPU, 1GB RAM
- **Recomendado:** 2 CPU, 2GB RAM
- **High load:** 4+ CPU, 4+ GB RAM

## 🆘 Troubleshooting

### Container não sobe:
```bash
# Ver logs detalhados
docker-compose logs okr-backend

# Verificar arquivo .env
cat .env

# Testar build
docker-compose build --no-cache
```

### API não responde:
```bash
# Verificar se está rodando
docker-compose ps

# Verificar logs
docker-compose logs -f

# Reiniciar
docker-compose restart
```

### Problemas de conectividade:
```bash
# Testar dentro do container
docker-compose exec okr-backend curl http://localhost:8000/health

# Verificar rede
docker network ls
docker network inspect backend_okr-network
```

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `docker-compose logs -f`
2. Testar endpoints de health
3. Verificar configurações do .env
4. Entrar em contato com o desenvolvedor

---

**Desenvolvido por:** André Laudares  
**Sistema:** OKR Flow v1.0  
**Documentação atualizada:** $(date) 
# 🎯 Sistema OKR Flow - Gestão de Objetivos e Resultados-Chave

<div align="center">

![OKR Flow Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=OKR+FLOW)

**Sistema completo de gestão de OKRs (Objectives and Key Results) para empresas**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-blue.svg)](https://tailwindcss.com/)

</div>

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias](#-tecnologias)
3. [Pré-requisitos](#-pré-requisitos)
4. [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
5. [Configuração do Backend](#-configuração-do-backend)
6. [Configuração do Frontend](#-configuração-do-frontend)
7. [Deploy em Produção](#-deploy-em-produção)
8. [Configuração de Domínio](#-configuração-de-domínio)
9. [Variáveis de Ambiente](#-variáveis-de-ambiente)
10. [Troubleshooting](#-troubleshooting)
11. [Suporte](#-suporte)

---

## 🚀 Visão Geral

O **OKR Flow** é um sistema completo de gestão de Objetivos e Resultados-Chave (OKRs) desenvolvido para empresas que desejam implementar metodologias ágeis de gestão estratégica.

### ✨ Principais Funcionalidades

- **👥 Gestão de Usuários**: Controle completo de colaboradores, gerentes e administradores
- **🎯 Gestão de OKRs**: Criação e acompanhamento de objetivos e resultados-chave
- **📊 Dashboard Analytics**: Visualizações avançadas de progresso e performance
- **🔄 Ciclos de OKR**: Gestão de trimestres/períodos de OKR
- **📈 Relatórios**: Análises detalhadas de performance individual e coletiva
- **💳 Sistema de Assinatura**: Integração com gateway de pagamento Asaas
- **🔐 Autenticação Segura**: Sistema robusto com controle de sessões
- **📱 Responsivo**: Interface otimizada para desktop e mobile

---

## 🛠 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Zustand** para gerenciamento de estado
- **React Hook Form** para formulários
- **Recharts** para gráficos e visualizações

### Backend
- **FastAPI** com Python 3.9+
- **Supabase** como banco de dados PostgreSQL
- **JWT** para autenticação
- **Pydantic** para validação de dados
- **Uvicorn** para servidor ASGI

### Banco de Dados
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)** para segurança
- **Real-time subscriptions** para atualizações em tempo real

---

## 📋 Pré-requisitos

### Desenvolvimento Local
- **Node.js** 18+ 
- **Python** 3.9+
- **Git**
- Conta no **Supabase** (gratuita)
- Conta no **Asaas** (para pagamentos)

### Deploy em Produção
- Conta no **Vercel/Netlify** (frontend)
- Conta no **Railway/Heroku/VPS** (backend)
- **Domínio próprio** (opcional)

---

## 🗄 Configuração do Banco de Dados

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **"New Project"**
3. Escolha nome, senha e região do seu projeto
4. Aguarde a criação do banco (2-3 minutos)

### 2. Obter Credenciais

No dashboard do Supabase, vá em **Settings > API**:

```
Project URL: https://seuprojectoid.supabase.co
anon key: eyJ0eXAiOiJKV1Q...
service_role key: eyJ0eXAiOiJKV1Q... (mantenha privada!)
```

### 3. Configurar Tabelas

Execute os scripts SQL na aba **SQL Editor** do Supabase:

```sql
-- Criar tabelas principais
-- (Scripts completos estão na pasta /database/schema.sql)
CREATE TABLE companies (...);
CREATE TABLE users (...);
CREATE TABLE objectives (...);
-- etc...
```

### 4. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
-- Aplicar políticas de segurança...
```

---

## 🔧 Configuração do Backend

### 1. Clonar e Instalar Dependências

```bash
# Clonar o repositório
git clone https://github.com/seuusuario/okr-flow.git
cd okr-flow/backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `backend/`:

```env
# === CONFIGURAÇÕES OBRIGATÓRIAS ===

# Supabase (obter em supabase.com > Settings > API)
SUPABASE_URL=https://seuprojectoid.supabase.co
SUPABASE_KEY=eyJ0eXAiOiJKV1Q...  # anon key
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1Q...  # service_role key

# Servidor
ENVIRONMENT=development  # ou 'production'
HOST=localhost
PORT=8000

# === CONFIGURAÇÕES OPCIONAIS ===

# Asaas (gateway de pagamento)
ASAAS_API_KEY=seu_api_key_asaas
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3  # sandbox
# ASAAS_BASE_URL=https://www.asaas.com/api/v3    # produção

# Performance
WORKERS_COUNT=1          # desenvolvimento
TIMEOUT_KEEP_ALIVE=30    # desenvolvimento
ENABLE_GZIP=false        # desenvolvimento
LOG_LEVEL=DEBUG          # desenvolvimento
```

### 3. 🔥 IMPORTANTE: Alterar CORS para Produção

**Arquivo que DEVE ser alterado:** `backend/app/main.py`

```python
# LINHA 50-57 - Configure seus domínios de produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seudominio.com", "https://www.seudominio.com"],  # ← ALTERE AQUI
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**⚠️ Em desenvolvimento deixe como está:**
```python
allow_origins=["*"],  # OK para desenvolvimento
```

**✅ Em produção DEVE mudar para:**
```python
allow_origins=["https://seudominio.com", "https://www.seudominio.com"],  # Seus domínios reais
```

### 4. Testar Localmente

```bash
# Iniciar servidor de desenvolvimento
python start_server.py

# Ou com auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Verificar API

Acesse: `http://localhost:8000/docs` para ver a documentação automática da API.

---

## 💻 Configuração do Frontend

### 1. Instalar Dependências

```bash
cd frontend
npm install
# ou
yarn install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `frontend/`:

```env
# === DESENVOLVIMENTO ===
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development

# === PRODUÇÃO ===
# VITE_API_URL=https://sua-api.railway.app
# VITE_ENVIRONMENT=production

# === SUPABASE (opcional para features adicionais) ===
VITE_SUPABASE_URL=https://seuprojectoid.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1Q...

# === ANALYTICS (opcional) ===
# VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 3. 🔥 IMPORTANTE: Configurar URL da API para Produção

**Arquivo que configura a conexão:** `frontend/src/lib/api.ts`

```typescript
// LINHA 10 - URL base da API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

**💡 Como funciona:**
- **Desenvolvimento**: Usa `http://localhost:8000` (backend local)
- **Produção**: Usa `VITE_API_URL` do arquivo `.env`

**✅ Para produção, defina no `.env`:**
```env
VITE_API_URL=https://sua-api.railway.app  # Sua URL do Railway
# ou
VITE_API_URL=https://api.seudominio.com   # Seu domínio próprio
```

### 4. Testar Localmente

```bash
# Iniciar servidor de desenvolvimento
npm run dev
# ou
yarn dev

# Acesse: http://localhost:5173
```

### 5. Build para Produção

```bash
# Criar build otimizado
npm run build
# ou
yarn build
```

---

## 🚀 Deploy em Produção

### 🖥 Deploy do Backend

#### Opção 1: Railway (Recomendado)

1. **Criar conta em [railway.app](https://railway.app)**
2. **Conectar repositório GitHub**
3. **Configurar variáveis de ambiente**:
   ```
   SUPABASE_URL=https://seuprojectoid.supabase.co
   SUPABASE_KEY=eyJ0eXAiOiJKV1Q...
   SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1Q...
   ENVIRONMENT=production
   WORKERS_COUNT=4
   TIMEOUT_KEEP_ALIVE=65
   ENABLE_GZIP=true
   LOG_LEVEL=WARNING
   ```
4. **Deploy automático** será feito a cada commit

#### Opção 2: Heroku

```bash
# Instalar Heroku CLI
# Criar app
heroku create seu-okr-api

# Configurar variáveis
heroku config:set SUPABASE_URL=https://seuprojectoid.supabase.co
heroku config:set SUPABASE_KEY=eyJ0eXAiOiJKV1Q...
heroku config:set SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1Q...
heroku config:set ENVIRONMENT=production

# Deploy
git push heroku main
```

#### Opção 3: VPS/Servidor Próprio

```bash
# No servidor
git clone https://github.com/seuusuario/okr-flow.git
cd okr-flow/backend

# Configurar ambiente
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar .env com suas credenciais

# Usar PM2 ou systemd para manter rodando
pm2 start "python start_server.py" --name okr-api

# Configurar nginx como proxy reverso
```

### 🌐 Deploy do Frontend

#### Opção 1: Vercel (Recomendado)

1. **Conecte seu GitHub em [vercel.com](https://vercel.com)**
2. **Importe o projeto** selecionando a pasta `frontend`
3. **Configure variáveis de ambiente**:
   ```
   VITE_API_URL=https://sua-api.railway.app
   VITE_ENVIRONMENT=production
   VITE_SUPABASE_URL=https://seuprojectoid.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1Q...
   ```
4. **Deploy automático** a cada commit

#### Opção 2: Netlify

1. **Conecte GitHub em [netlify.com](https://netlify.com)**
2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Adicione variáveis de ambiente** no painel
4. **Configure redirects** criando `public/_redirects`:
   ```
   /*    /index.html   200
   ```

---

## 🌐 Configuração de Domínio

### 1. Backend (API)

#### Railway
1. Vá em **Settings > Domains**
2. Adicione seu domínio: `api.seudominio.com`
3. Configure DNS do seu provedor:
   ```
   CNAME api seuapp.railway.app
   ```

#### Heroku
```bash
heroku domains:add api.seudominio.com
```

### 2. Frontend

#### Vercel
1. **Settings > Domains**
2. Adicione: `seudominio.com` e `www.seudominio.com`
3. Configure DNS:
   ```
   CNAME www seuapp.vercel.app
   A @ 76.76.19.61
   ```

#### Netlify
1. **Site settings > Domain management**
2. **Add custom domain**
3. Configure DNS conforme instruções

### 3. Configurar HTTPS

Tanto Vercel quanto Railway configurem HTTPS automaticamente com Let's Encrypt.

### 4. Atualizar URLs

Após configurar domínio, atualize as variáveis:

```env
# Frontend
VITE_API_URL=https://api.seudominio.com

# Backend (CORS)
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
```

---

## ⚙️ Variáveis de Ambiente

### 🔧 Backend (.env)

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `SUPABASE_URL` | ✅ | URL do projeto Supabase | `https://abc123.supabase.co` |
| `SUPABASE_KEY` | ✅ | Chave anon do Supabase | `eyJ0eXAiOiJKV1Q...` |
| `SUPABASE_SERVICE_KEY` | ✅ | Chave service_role do Supabase | `eyJ0eXAiOiJKV1Q...` |
| `ENVIRONMENT` | ✅ | Ambiente (development/production) | `production` |
| `HOST` | ❌ | Host do servidor | `0.0.0.0` |
| `PORT` | ❌ | Porta do servidor | `8000` |
| `WORKERS_COUNT` | ❌ | Número de workers | `4` |
| `TIMEOUT_KEEP_ALIVE` | ❌ | Timeout em segundos | `65` |
| `ENABLE_GZIP` | ❌ | Habilitar compressão | `true` |
| `LOG_LEVEL` | ❌ | Nível de log | `WARNING` |
| `ASAAS_API_KEY` | ❌ | Chave API do Asaas | `$aact_...` |
| `ASAAS_BASE_URL` | ❌ | URL base do Asaas | `https://www.asaas.com/api/v3` |

### 🎨 Frontend (.env)

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `VITE_API_URL` | ✅ | URL da API backend | `https://api.seudominio.com` |
| `VITE_ENVIRONMENT` | ✅ | Ambiente | `production` |
| `VITE_SUPABASE_URL` | ❌ | URL do Supabase | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ❌ | Chave anon do Supabase | `eyJ0eXAiOiJKV1Q...` |

---

## 🔧 Troubleshooting

### ❌ Problemas Comuns

#### 1. Erro de CORS
```
Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS policy
```

**Solução**: Configure CORS no backend:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seudominio.com"],  # Adicione seu domínio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 2. Erro de Autenticação Supabase
```
Invalid JWT: signature verification failed
```

**Solução**: Verifique se as chaves do Supabase estão corretas:
```bash
# Teste no terminal
curl -H "apikey: SUA_CHAVE_ANON" https://seuprojectoid.supabase.co/rest/v1/
```

#### 3. Erro 500 no Backend
```
Internal Server Error
```

**Solução**: Verifique logs do servidor:
```bash
# Railway
railway logs
# Heroku  
heroku logs --tail
# PM2
pm2 logs okr-api
```

#### 4. Frontend não carrega
```
Vite dev server not found
```

**Solução**: Verifique se as dependências estão instaladas:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 🔍 Verificações de Saúde

#### Backend
```bash
# Verificar se API está respondendo
curl https://sua-api.railway.app/health

# Verificar documentação
curl https://sua-api.railway.app/docs
```

#### Frontend
```bash
# Build local para testar
npm run build
npm run preview
```

#### Banco de Dados
```sql
-- No Supabase SQL Editor
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM companies;
```

---

## 📊 Monitoramento

### 1. Logs do Sistema

#### Backend (Railway)
```bash
railway logs --follow
```

#### Frontend (Vercel)
- Acesse **Functions** no dashboard
- Verifique **Real-time logs**

### 2. Métricas de Performance

#### Supabase
- **Dashboard > Reports** para métricas do banco
- **Dashboard > Logs** para queries SQL

#### Vercel Analytics
- Adicione `@vercel/analytics` para métricas de frontend
- Configure no dashboard **Analytics**

---

## 🔐 Segurança

### 1. Configurações Obrigatórias

```env
# Nunca exponha service_role key no frontend
SUPABASE_SERVICE_KEY=mantenhaprivada

# Use HTTPS em produção
VITE_API_URL=https://api.seudominio.com

# Configure CORS restritivo
ALLOWED_ORIGINS=https://seudominio.com
```

### 2. Boas Práticas

- ✅ **Sempre use HTTPS** em produção
- ✅ **Mantenha dependências atualizadas**
- ✅ **Configure Row Level Security** no Supabase
- ✅ **Use variáveis de ambiente** para credenciais
- ✅ **Monitore logs** regularmente
- ❌ **Nunca comite** arquivos `.env`
- ❌ **Nunca exponha** service_role keys

---

## 📈 Escalabilidade

### 1. Performance

#### Backend
```env
# Produção - Railway/Heroku
WORKERS_COUNT=4
TIMEOUT_KEEP_ALIVE=65
ENABLE_GZIP=true
LOG_LEVEL=WARNING
```

#### Frontend
```typescript
// Lazy loading de componentes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Code splitting por rota
const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <Suspense fallback={<Loading />}><Dashboard /></Suspense>
  }
]);
```

### 2. Cache

#### Backend
```python
# Cache de queries frequentes
@lru_cache(maxsize=100)
def get_user_objectives(user_id: str):
    # Implementation...
```

#### Frontend
```typescript
// React Query para cache de API
const { data, isLoading } = useQuery(
  ['objectives', userId],
  () => api.get(`/objectives/${userId}`),
  { staleTime: 5 * 60 * 1000 } // 5 minutos
);
```

---

## 🆘 Suporte

### 📧 Contato
- **Email**: suporte@seudominio.com
- **WhatsApp**: +55 (11) 99999-9999
- **Discord**: [Link do servidor]

### 📚 Recursos
- **Documentação Técnica**: `/docs` na API
- **Vídeos Tutoriais**: [Link do YouTube]
- **Base de Conhecimento**: [Link da KB]

### 🐛 Reportar Bugs
1. Acesse **Issues** no GitHub
2. Use o template de bug report
3. Inclua logs e passos para reproduzir

### 💡 Sugestões
- Abra uma **Feature Request** no GitHub
- Participe das **discussões** da comunidade

---

## 📄 Licença

Este software é licenciado sob os termos acordados na compra. 

**© 2024 OKR Flow. Todos os direitos reservados.**

---

<div align="center">

**🎯 OKR Flow - Transforme objetivos em resultados**

[🌐 Website](https://seudominio.com) • [📧 Suporte](mailto:suporte@seudominio.com) • [📱 WhatsApp](https://wa.me/5511999999999)

---

*Desenvolvido com ❤️ para empresas que buscam excelência*

</div>

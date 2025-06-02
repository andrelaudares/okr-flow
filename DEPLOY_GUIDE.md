# 🚀 Guia Rápido de Deploy - OKR Flow

## ⚡ Deploy em 15 minutos

### 1️⃣ Configurar Banco de Dados (5 min)

1. **Acesse [supabase.com](https://supabase.com)**
2. **Crie um projeto** → nome qualquer, escolha região
3. **Copie as credenciais** em `Settings > API`:
   - Project URL
   - anon key  
   - service_role key

---

## 🔥 ARQUIVOS QUE VOCÊ DEVE ALTERAR

### 📁 Backend - Arquivo `backend/app/main.py`

**ENCONTRE esta linha (linha ~50):**
```python
allow_origins=["*"],  # Modificado para wildcard
```

**ALTERE PARA seus domínios:**
```python
allow_origins=["https://seudominio.com", "https://www.seudominio.com"],
```

**⚠️ Exemplo prático:**
```python
# ANTES (desenvolvimento)
allow_origins=["*"],

# DEPOIS (produção)
allow_origins=["https://meuokr.com", "https://www.meuokr.com"],
```

### 📁 Frontend - Arquivo `frontend/.env`

**CRIE o arquivo `.env` na pasta frontend:**
```env
# Sua URL do backend (Railway, Heroku, etc)
VITE_API_URL=https://sua-api.railway.app
VITE_ENVIRONMENT=production
```

**⚠️ Exemplo prático:**
```env
VITE_API_URL=https://okr-api-production.up.railway.app
VITE_ENVIRONMENT=production
```

### 📁 Backend - Arquivo `backend/.env`

**CRIE o arquivo `.env` na pasta backend:**
```env
SUPABASE_URL=https://tqdhcxzioahowqapftxb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZGhjeHppb2Fob3dxYXBmdHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjQ3OTMsImV4cCI6MjA2MzQ0MDc5M30.2gjDsqrT_Kx39-XmenGBgU4pvwpTPoKAYIedsh_H7XU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZGhjeHppb2Fob3dxYXBmdHhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg2NDc5MywiZXhwIjoyMDYzNDQwNzkzfQ.elgZeOXS5LA6SK4ni1034VkUHP0VuAkJN_70n-efqJM
ASAAS_API_KEY=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjE5YzNhZmM0LTMwZGQtNDkzNy05YmNlLWZiNmRiYTkwM2EzYzo6JGFhY2hfMmEwOWIwNjEtMDU5Mi00MzRkLWE4YzYtOWQwNzBjYmU5ZGJm
ENVIRONMENT=production
WORKERS_COUNT=4
TIMEOUT_KEEP_ALIVE=65
ENABLE_GZIP=true
LOG_LEVEL=WARNING
```

---

### 2️⃣ Deploy do Backend (5 min)

1. **Acesse [railway.app](https://railway.app)**
2. **Login com GitHub** e conecte este repositório
3. **Selecione a pasta `backend`** como root
4. **Adicione variáveis de ambiente** (copie do .env acima)
5. **Deploy automático** será feito

### 3️⃣ Deploy do Frontend (5 min)

1. **Acesse [vercel.com](https://vercel.com)**
2. **Import project** → selecione pasta `frontend`
3. **Adicione variáveis**:
   ```
   VITE_API_URL=https://sua-url-railway.up.railway.app
   VITE_ENVIRONMENT=production
   ```
4. **Deploy automático** será feito

### ✅ Pronto!

- **Frontend**: `https://seuapp.vercel.app`
- **Backend**: `https://seuapp.railway.app`
- **Docs da API**: `https://seuapp.railway.app/docs`

---

## 🌐 Configurar Domínio Próprio (Opcional)

### Railway (Backend)
1. **Settings > Domains** → adicione `api.seudominio.com`
2. **Configure DNS**: `CNAME api seuapp.railway.app`

### Vercel (Frontend)  
1. **Settings > Domains** → adicione `seudominio.com`
2. **Configure DNS** conforme instruções

### ⚠️ APÓS configurar domínio, ATUALIZE:

**Backend - `main.py`:**
```python
allow_origins=["https://seudominio.com", "https://www.seudominio.com"],
```

**Frontend - `.env`:**
```env
VITE_API_URL=https://api.seudominio.com
```

---

## 🆘 Problemas Comuns

### ❌ Erro de CORS
**Causa**: Domínios não configurados no `main.py`
**Solução**: Edite `backend/app/main.py` linha ~50

### ❌ API não responde
**Causa**: `VITE_API_URL` incorreta
**Solução**: Verifique URL no Vercel ou arquivo `.env`

### ❌ Frontend não carrega
**Causa**: Build quebrado
**Solução**: Teste local com `npm run build`

---

## 📋 Checklist de Deploy

- [ ] Alterei `main.py` com meus domínios
- [ ] Criei `.env` no backend com credenciais
- [ ] Criei `.env` no frontend com URL da API
- [ ] Fiz deploy no Railway (backend)
- [ ] Fiz deploy no Vercel (frontend)
- [ ] Testei se API responde: `/docs`
- [ ] Testei se frontend carrega
- [ ] Configurei domínio (opcional)

**💡 Dica**: Comece sempre testando `sua-api.railway.app/docs` para verificar se o backend está funcionando! 
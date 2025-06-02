# 📁 Arquivos Importantes para Deploy

## 🔧 BACKEND - Configuração de CORS

**📍 Arquivo:** `backend/app/main.py`
**📍 Linha:** ~50-57

**🔍 Procurar por:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ← ESTA LINHA
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**✅ Alterar para produção:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seudominio.com", "https://www.seudominio.com"],  # ← SEUS DOMÍNIOS
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

---

## 🌐 FRONTEND - Configuração da API

**📍 Arquivo:** `frontend/src/lib/api.ts`
**📍 Linha:** 10

**🔍 O que tem atualmente:**
```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

**✅ Não precisa alterar este arquivo!**
**✅ Apenas configure o `.env` do frontend:**

**📍 Arquivo:** `frontend/.env`
```env
VITE_API_URL=https://sua-api.railway.app
VITE_ENVIRONMENT=production
```

---

## 📋 Checklist Rápido

### 1. Backend (2 alterações)
- [ ] **Criar**: `backend/.env` (credenciais do Supabase)
- [ ] **Alterar**: `backend/app/main.py` linha ~52 (CORS)

### 2. Frontend (1 alteração) 
- [ ] **Criar**: `frontend/.env` (URL da API)

### 3. Deploy
- [ ] **Railway**: Fazer upload do backend
- [ ] **Vercel**: Fazer upload do frontend

---

## 🔥 Exemplo Prático Completo

### Se seu domínio for `meuokr.com`:

**1. `backend/app/main.py` linha ~52:**
```python
allow_origins=["https://meuokr.com", "https://www.meuokr.com"],
```

**2. `frontend/.env`:**
```env
VITE_API_URL=https://api.meuokr.com
VITE_ENVIRONMENT=production
```

**3. `backend/.env`:**
```env
SUPABASE_URL=https://seuprojectoid.supabase.co
SUPABASE_KEY=sua_anon_key
SUPABASE_SERVICE_KEY=sua_service_key
ENVIRONMENT=production
```

---

**💡 Resumo**: São apenas 3 arquivos para alterar!
1. `backend/app/main.py` (1 linha)
2. `frontend/.env` (arquivo novo)
3. `backend/.env` (arquivo novo) 
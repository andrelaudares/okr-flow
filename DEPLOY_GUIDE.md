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

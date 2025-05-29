# 🚀 Deploy OKR Flow no Vercel

## Estratégia de Deploy

Como sua aplicação tem **frontend** (React/Vite) e **backend** (FastAPI/Python), você precisará fazer **2 deploys separados**:

1. **Frontend no Vercel** (principal)
2. **Backend em outra plataforma** (Railway, Render, ou PythonAnywhere)

## 📋 Configurações para o Vercel (Frontend)

### Passo 1: Preparação
1. Certifique-se que seu repositório está atualizado no GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em "Add New Project"

### Passo 2: Configurações do Formulário

Preencha exatamente assim:

```
Framework Preset: Other
Root Directory: ./frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**❗ IMPORTANTE**: Marque "Override" para cada campo que você preencher!

### Passo 3: Variáveis de Ambiente (se necessário)
Se o frontend usar variáveis de ambiente, adicione-as na seção "Environment Variables":
```
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

## 🐍 Deploy do Backend (Opções)

### Opção 1: Railway (Recomendado)
1. Acesse [railway.app](https://railway.app)
2. Conecte seu GitHub
3. Selecione o repositório
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Adicione as variáveis de ambiente:
   ```
   SUPABASE_URL=sua_url
   SUPABASE_KEY=sua_chave
   SUPABASE_SERVICE_KEY=sua_service_key
   ```

### Opção 2: Render
1. Acesse [render.com](https://render.com)
2. Conecte seu GitHub
3. Crie um "Web Service"
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 🔗 Conectando Frontend e Backend

Após o deploy do backend, você terá uma URL como:
- Railway: `https://seu-app.railway.app`
- Render: `https://seu-app.onrender.com`

**Atualize o arquivo frontend/src/lib/api.ts:**

```typescript
const BASE_URL = import.meta.env.PROD 
  ? 'https://SUA-URL-DO-BACKEND-AQUI'  // ← Cole sua URL real aqui
  : 'http://localhost:8000';
```

## 📝 Checklist Final

- [ ] Backend deployado e funcionando
- [ ] URL do backend atualizada no frontend
- [ ] Frontend deployado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado no backend para aceitar a URL do Vercel
- [ ] Teste das principais funcionalidades

## 🛠️ Troubleshooting

### Erro de CORS
Se tiver erro de CORS, adicione a URL do seu frontend Vercel no backend (`app/main.py`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:8080",
        "https://seu-app.vercel.app"  # ← Adicione sua URL do Vercel
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

### Build Fails
Se o build falhar no Vercel:
1. Verifique se o diretório root está correto (`./frontend`)
2. Confirme que todos os campos estão marcados como "Override"
3. Teste localmente: `cd frontend && npm run build`

## 🎯 URLs Finais
Após o deploy, você terá:
- **Frontend**: `https://seu-projeto.vercel.app`
- **Backend**: `https://seu-backend.railway.app` (ou outra plataforma)

Lembre-se de atualizar os links nos seus documentos e compartilhar as URLs corretas! 
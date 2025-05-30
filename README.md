# Backend OKR Flow - Sprint 1

## Status Atual ✅

**Sprint 1 - Autenticação e Gestão de Usuários: IMPLEMENTADO**

### Funcionalidades Entregues:
- ✅ Sistema de autenticação com Supabase
- ✅ Registro de usuário owner com criação automática de empresa
- ✅ Login/logout com JWT tokens
- ✅ Gestão hierárquica de usuários (Owner > Admin > Manager > Collaborator)
- ✅ CRUD completo de usuários com controle de permissões
- ✅ Integração com sistema de pagamento Asaas (opcional)

## Configuração Inicial

### 1. Instalar Dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta `backend/` com suas credenciais:

```env
# Configurações do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica-aqui
SUPABASE_SERVICE_KEY=sua-chave-de-servico-aqui

# Configurações do Asaas (opcional)
ASAAS_API_KEY=sua-chave-asaas-aqui

# Ambiente
ENVIRONMENT=development
```

### 3. Configurar Banco de Dados
Execute o script SQL no Supabase SQL Editor:
```sql
-- Copie e execute o conteúdo do arquivo: fix_users_table.sql
```

## Executar o Servidor

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

O servidor estará disponível em: http://localhost:8000

## Testar as Rotas

### Teste Automático
```bash
python test_simple.py
```

### Teste Manual

#### 1. Health Check
```bash
GET http://localhost:8000/health
```

#### 2. Registrar Usuário Owner
```bash
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "email": "owner@empresa.com",
  "password": "123456",
  "name": "João Silva",
  "username": "joaosilva",
  "cpf_cnpj": "12345678901",
  "phone": "11999999999",
  "address": "Rua das Flores, 123"
}
```

#### 3. Login
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "owner@empresa.com",
  "password": "123456"
}
```

#### 4. Dados do Usuário Logado
```bash
GET http://localhost:8000/api/auth/me
Authorization: Bearer SEU_TOKEN_AQUI
```

## Endpoints Disponíveis

### Autenticação (`/api/auth`)
- `POST /register` - Registrar usuário owner
- `POST /login` - Login
- `POST /logout` - Logout
- `POST /refresh` - Renovar token
- `GET /me` - Dados do usuário logado

### Usuários (`/api/users`)
- `GET /` - Listar usuários (apenas owners/admins)
- `POST /` - Criar usuário (apenas owners/admins)
- `GET /{user_id}` - Buscar usuário específico
- `PUT /{user_id}` - Atualizar usuário
- `DELETE /{user_id}` - Deletar usuário (apenas owners)

### Assinaturas (`/api/subscriptions`)
- `GET /` - Listar assinaturas
- `POST /` - Criar assinatura

## Estrutura de Permissões

| Ação | Owner | Admin | Manager | Collaborator |
|------|-------|-------|---------|--------------|
| Criar usuários | ✅ | ✅ | ❌ | ❌ |
| Deletar usuários | ✅ | ❌ | ❌ | ❌ |
| Editar usuários | ✅ | ✅ | Próprio | Próprio |
| Ver usuários | ✅ | ✅ | ✅ | Próprio |

## Resolução de Problemas

### Erro: "Could not find the 'is_active' column"
Execute o script `fix_users_table.sql` no Supabase.

### Erro: "Serviço não configurado"
Verifique se o arquivo `.env` está configurado corretamente.

### Erro: "Email já está em uso"
Use um email diferente ou delete o usuário existente no Supabase Auth.

## Próximos Sprints

- **Sprint 2**: Gestão de Empresas e Times
- **Sprint 3**: Sistema de OKRs (Objetivos e Key Results)
- **Sprint 4**: Dashboard e Relatórios
- **Sprint 5**: Sistema de Notificações

## Logs e Debug

O servidor exibe logs detalhados no console. Para debug adicional, verifique:
- Logs do Supabase no dashboard
- Logs do Asaas (se configurado)
- Variáveis de ambiente carregadas

---

**Status**: ✅ Sprint 1 Completo e Funcional
**Última atualização**: Janeiro 2025
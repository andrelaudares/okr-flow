---

## 1. Autenticação (`/api/auth`)

### `POST /api/auth/register`
Registra um novo usuário principal (owner da empresa). Cria automaticamente uma empresa e define o usuário como proprietário.

- **Endpoint:** `/api/auth/register`
- **Método:** `POST`

**Header Parameters:**
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "email": "owner@empresa.com",
  "password": "senhaSegura123",
  "name": "João Silva",
  "username": "joao_silva",
  "cpf_cnpj": "12345678900",
  "address": "Rua das Empresas, 123",
  "phone": "11987654321",
  "description": "Proprietário da empresa"
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "owner@empresa.com",
  "password": "senhaSegura123",
  "name": "João Silva",
  "username": "joao_silva",
  "cpf_cnpj": "12345678900",
  "address": "Rua das Empresas, 123",
  "phone": "11987654321",
  "description": "Proprietário da empresa"
}'
```

**Responses:**
- `201 Created`: Usuário registrado com sucesso.
```json
{
  "message": "Cadastro realizado com sucesso! Você já pode fazer login no sistema.",
  "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "requires_approval": false
}
```
- `400 Bad Request`: Dados inválidos na requisição.
- `500 Internal Server Error`: Erro ao registrar o usuário.

---

### `POST /api/auth/login`
Autentica um usuário existente e retorna um token JWT para acesso a rotas protegidas.
**Nota:** Usuários podem fazer login independentemente do status ativo/inativo.

- **Endpoint:** `/api/auth/login`
- **Método:** `POST`

**Header Parameters:**
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "email": "owner@empresa.com",
  "password": "senhaSegura123"
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "email": "owner@empresa.com",
  "password": "senhaSegura123"
}'
```

**Responses:**
- `200 OK`: Login bem-sucedido, retorna tokens JWT.
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- `401 Unauthorized`: Credenciais inválidas ou usuário não encontrado no sistema.
- `500 Internal Server Error`: Erro interno no servidor.

---

### `POST /api/auth/logout`
Invalida a sessão atual do usuário no Supabase Auth. Requer autenticação.

- **Endpoint:** `/api/auth/logout`
- **Método:** `POST`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/auth/logout" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Logout realizado com sucesso.
```json
{
  "message": "Logout realizado com sucesso"
}
```
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro durante o logout.

---

### `POST /api/auth/refresh`
Gera um novo token de acesso usando refresh token.

- **Endpoint:** `/api/auth/refresh`
- **Método:** `POST`

**Header Parameters:**
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/auth/refresh" \
-H "Content-Type: application/json" \
-d '{"refresh_token": "<SEU_REFRESH_TOKEN>"}'
```

**Responses:**
- `200 OK`: Token renovado com sucesso.
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- `401 Unauthorized`: Refresh token inválido.

---

### `GET /api/auth/me`
Retorna os dados completos do usuário autenticado. Requer autenticação.

- **Endpoint:** `/api/auth/me`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Dados do usuário.
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "email": "owner@empresa.com",
  "username": "joao_silva",
  "name": "João Silva",
  "cpf_cnpj": "12345678900",
  "asaas_customer_id": "cus_abcdef123456789",
  "address": "Rua das Empresas, 123",
  "phone": "11987654321",
  "description": "Proprietário da empresa",
  "role": "ADMIN",
  "company_id": "f1e2d3c4-b5a6-7890-1234-567890fedcba",
  "team_id": null,
  "is_owner": true,
  "is_active": true,
  "created_at": "2023-10-27T10:00:00+00:00",
  "updated_at": "2023-10-27T10:00:00+00:00"
}
```
- `401 Unauthorized`: Token inválido ou ausente.

### `POST /api/auth/reset-password`
Solicita reset de senha enviando email com instruções. Apenas usuários ativos podem solicitar reset.

- **Endpoint:** `/api/auth/reset-password`
- **Método:** `POST`

**Header Parameters:**
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "email": "usuario@empresa.com"
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/auth/reset-password" \
-H "Content-Type: application/json" \
-d '{
  "email": "usuario@empresa.com"
}'
```

**Responses:**
- `200 OK`: Solicitação processada (sempre retorna sucesso por segurança).
```json
{
  "message": "Se o email estiver cadastrado e ativo, você receberá instruções para redefinir sua senha."
}
```

---

### `POST /api/auth/update-password`
Atualiza senha usando tokens de reset recebidos por email.

- **Endpoint:** `/api/auth/update-password`
- **Método:** `POST`

**Header Parameters:**
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "novaSenhaSegura123"
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/auth/update-password" \
-H "Content-Type: application/json" \
-d '{
  "access_token": "TOKEN_DO_EMAIL",
  "refresh_token": "REFRESH_TOKEN_DO_EMAIL",
  "new_password": "novaSenhaSegura123"
}'
```

**Responses:**
- `200 OK`: Senha atualizada com sucesso.
```json
{
  "message": "Senha atualizada com sucesso"
}
```
- `400 Bad Request`: Tokens inválidos ou expirados.
- `401 Unauthorized`: Usuário desativado.

---

## 2. Gestão de Usuários (`/api/users`)

### `GET /api/users/me`
Retorna os dados do perfil do usuário autenticado. Requer autenticação.

- **Endpoint:** `/api/users/me`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/users/me" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Dados do perfil do usuário (mesmo formato do `/api/auth/me`).
- `401 Unauthorized`: Token inválido ou ausente.

---

### `GET /api/users`
Lista todos os usuários da empresa do usuário logado. Requer autenticação.

- **Endpoint:** `/api/users`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/users" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Lista de usuários da empresa.
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "owner@empresa.com",
    "username": "joao_silva",
    "name": "João Silva",
    "role": "ADMIN",
    "team_id": null,
    "is_owner": true,
    "is_active": true,
    "created_at": "2023-10-27T10:00:00+00:00"
  },
  {
    "id": "b2c3d4e5-f6g7-8901-2345-678901abcdef",
    "email": "colaborador@empresa.com",
    "username": "maria_santos",
    "name": "Maria Santos",
    "role": "COLLABORATOR",
    "team_id": "c3d4e5f6-g7h8-9012-3456-789012abcdef",
    "is_owner": false,
    "is_active": true,
    "created_at": "2023-10-27T11:00:00+00:00"
  }
]
```
- `401 Unauthorized`: Token inválido ou ausente.
- `400 Bad Request`: Usuário não possui empresa associada.

---

### `POST /api/users`
Cria um novo usuário na empresa. Apenas owners e admins podem criar usuários. Requer autenticação.
**Nota:** CPF/CNPJ não é obrigatório para usuários criados por owners/admins. O novo usuário herda a company_id do criador e já inicia ativo.

- **Endpoint:** `/api/users`
- **Método:** `POST`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "email": "novo.usuario@empresa.com",
  "password": "senhaTemporaria123",
  "name": "Maria Santos",
  "username": "maria_santos",
  "role": "COLLABORATOR"
}
```

**Nota sobre campos:** 
- `cpf_cnpj` não é obrigatório para usuários criados por owners/admins
- `team_id` é opcional
- O usuário criado herda automaticamente a `company_id` do criador
- O usuário já inicia ativo (`is_active: true`)

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/users" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>" \
-H "Content-Type: application/json" \
-d '{
  "email": "novo.usuario@empresa.com",
  "password": "senhaTemporaria123",
  "name": "Maria Santos",
  "username": "maria_santos",
  "role": "COLLABORATOR"
}'
```

**Responses:**
- `200 OK`: Usuário criado com sucesso (retorna dados completos do usuário).
- `400 Bad Request`: Email já em uso ou dados inválidos.
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Sem permissão para criar usuários.
- `500 Internal Server Error`: Erro ao criar usuário.

---

### `GET /api/users/{user_id}`
Busca dados de um usuário específico da mesma empresa. Requer autenticação.

- **Endpoint:** `/api/users/{user_id}`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Path Parameters:**
- `user_id` (string): O ID do usuário a ser buscado.

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/users/b2c3d4e5-f6g7-8901-2345-678901abcdef" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Dados completos do usuário.
- `401 Unauthorized`: Token inválido ou ausente.
- `404 Not Found`: Usuário não encontrado.

---

### `PUT /api/users/{user_id}`
Atualiza dados de um usuário. Permissões: owners podem atualizar qualquer usuário, admins podem atualizar colaboradores, usuários podem atualizar apenas seus próprios dados. Requer autenticação.

- **Endpoint:** `/api/users/{user_id}`
- **Método:** `PUT`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Path Parameters:**
- `user_id` (string): O ID do usuário a ser atualizado.

**Request Body:**
```json
{
  "name": "Maria Santos Silva",
  "username": "maria_santos_silva",
  "address": "Nova Rua, 456",
  "phone": "11999888777",
  "description": "Colaboradora sênior",
  "role": "MANAGER",
  "is_active": true
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X PUT "http://localhost:8000/api/users/b2c3d4e5-f6g7-8901-2345-678901abcdef" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>" \
-H "Content-Type: application/json" \
-d '{
  "name": "Maria Santos Silva",
  "role": "MANAGER"
}'
```

**Responses:**
- `200 OK`: Usuário atualizado com sucesso (retorna dados atualizados).
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Sem permissão para atualizar este usuário.
- `404 Not Found`: Usuário não encontrado.
- `500 Internal Server Error`: Erro ao atualizar usuário.

---

### `DELETE /api/users/{user_id}`
Deleta um usuário da empresa. Apenas owners podem deletar usuários. Owners não podem deletar a si mesmos. Requer autenticação.

- **Endpoint:** `/api/users/{user_id}`
- **Método:** `DELETE`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Path Parameters:**
- `user_id` (string): O ID do usuário a ser deletado.

**Exemplo de Requisição (`curl`):**
```bash
curl -X DELETE "http://localhost:8000/api/users/b2c3d4e5-f6g7-8901-2345-678901abcdef" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Usuário deletado com sucesso.
```json
{
  "message": "Usuário deletado com sucesso"
}
```
- `400 Bad Request`: Owner tentando deletar a si mesmo.
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Apenas owners podem deletar usuários.
- `404 Not Found`: Usuário não encontrado.
- `500 Internal Server Error`: Erro ao deletar usuário.

---

### `PUT /api/users/{user_id}/status`
Ativa ou desativa um usuário. Apenas owners e admins podem alterar status. Não é possível desativar owners ou alterar próprio status. Requer autenticação.

- **Endpoint:** `/api/users/{user_id}/status`
- **Método:** `PUT`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Path Parameters:**
- `user_id` (string): O ID do usuário a ter o status alterado.

**Query Parameters:**
- `is_active` (boolean): `true` para ativar, `false` para desativar.

**Exemplo de Requisição (`curl`):**
```bash
# Desativar usuário
curl -X PUT "http://localhost:8000/api/users/b2c3d4e5-f6g7-8901-2345-678901abcdef/status?is_active=false" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"

# Ativar usuário
curl -X PUT "http://localhost:8000/api/users/b2c3d4e5-f6g7-8901-2345-678901abcdef/status?is_active=true" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Status alterado com sucesso.
```json
{
  "message": "Usuário desativado com sucesso"
}
```
- `400 Bad Request`: Tentativa de desativar owner ou alterar próprio status.
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Sem permissão para alterar status.
- `404 Not Found`: Usuário não encontrado.
- `500 Internal Server Error`: Erro ao alterar status.

---

## Correções de Bugs Implementadas

### ✅ Bug: Objetivos sem ciclo obrigatório
**Problema:** Não era possível criar objetivos sem escolher um ciclo ativo.

**Solução:** 
- Campo `cycle_id` na tabela `objectives` agora aceita NULL
- Lógica de criação de objetivos permite valores NULL para `cycle_id`
- Busca automática por ciclo ativo é opcional

### ✅ Bug: Usuários não aparecendo na empresa
**Problema:** Erro de constraint UNIQUE no campo `cpf_cnpj` ao criar usuários.

**Solução:**
- Campo `cpf_cnpj` na tabela `users` agora aceita NULL
- Modelo `UserProfile` atualizado para permitir `cpf_cnpj: Optional[str]`
- Usuários criados por owners/admins não precisam informar CPF/CNPJ

### ✅ Bug: Login de usuários inativos
**Problema:** Usuários com `is_active = false` não conseguiam fazer login.

**Solução:**
- Removida verificação de `is_active` no endpoint de login
- Usuários podem fazer login independente do status ativo/inativo
- Novos usuários já iniciam como ativos por padrão

### 📝 Script SQL necessário:
Execute no Supabase SQL Editor:
```sql
-- Permitir cycle_id NULL em objectives
ALTER TABLE objectives ALTER COLUMN cycle_id DROP NOT NULL;

-- Permitir cpf_cnpj NULL em users  
ALTER TABLE users ALTER COLUMN cpf_cnpj DROP NOT NULL;
```

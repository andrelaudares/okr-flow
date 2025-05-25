# Documentação da API: Sistema OKR - Sprint 1, 2 e 3

Esta documentação descreve os endpoints da API backend para o Sistema de Gestão de OKRs, Sprints 1, 2 e 3: Autenticação, Gestão de Usuários, Sistema de Empresas, Ciclos Temporais e Dashboard.

O backend utiliza FastAPI, Supabase para autenticação e banco de dados, e Asaas para gerenciamento de assinaturas.

**Base URL:** `http://localhost:8000`

**Autenticação:** As rotas protegidas exigem um token JWT válido no cabeçalho `Authorization: Bearer <token>`. O token é obtido através da rota de login (`POST /api/auth/login`).

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
  "message": "Usuário registrado com sucesso. Aguarde aprovação para liberação de acesso.",
  "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "requires_approval": true
}
```
- `400 Bad Request`: Dados inválidos na requisição.
- `500 Internal Server Error`: Erro ao registrar o usuário.

---

### `POST /api/auth/login`
Autentica um usuário existente e retorna um token JWT para acesso a rotas protegidas.

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
- `401 Unauthorized`: Credenciais inválidas ou usuário desativado.
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

## 3. Gestão de Empresas (`/api/companies`) - Sprint 2

### `GET /api/companies/`
Retorna os dados da empresa do usuário logado, incluindo estatísticas de usuários. Requer autenticação.

- **Endpoint:** `/api/companies/`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/companies/" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Dados da empresa com estatísticas.
```json
{
  "id": "f2713e40-d8ad-4de7-b67a-63fffb90e553",
  "name": "Empresa de João Silva",
  "created_at": "2023-10-27T10:00:00+00:00",
  "updated_at": "2023-10-27T10:00:00+00:00",
  "total_users": 3,
  "active_users": 2,
  "owner_name": "João Silva"
}
```
- `400 Bad Request`: Usuário não possui empresa associada.
- `401 Unauthorized`: Token inválido ou ausente.
- `404 Not Found`: Empresa não encontrada.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `PUT /api/companies/{company_id}`
Atualiza os dados da empresa. Apenas owners podem atualizar dados da empresa. Requer autenticação.

- **Endpoint:** `/api/companies/{company_id}`
- **Método:** `PUT`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Path Parameters:**
- `company_id` (string): O UUID da empresa a ser atualizada.

**Request Body:**
```json
{
  "name": "Novo Nome da Empresa"
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X PUT "http://localhost:8000/api/companies/f2713e40-d8ad-4de7-b67a-63fffb90e553" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>" \
-H "Content-Type: application/json" \
-d '{
  "name": "Novo Nome da Empresa"
}'
```

**Responses:**
- `200 OK`: Empresa atualizada com sucesso.
```json
{
  "id": "f2713e40-d8ad-4de7-b67a-63fffb90e553",
  "name": "Novo Nome da Empresa",
  "created_at": "2023-10-27T10:00:00+00:00",
  "updated_at": "2023-10-27T15:30:00+00:00"
}
```
- `400 Bad Request`: Dados inválidos na requisição.
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden**: Apenas owners podem atualizar empresas ou tentativa de atualizar empresa de outro owner.
- `404 Not Found`: Empresa não encontrada.
- `500 Internal Server Error`: Erro ao atualizar empresa.

---

## 4. Sistema de Ciclos (`/api/cycles`) - Sprint 3

### `GET /api/cycles/`
Lista todos os ciclos da empresa do usuário logado com status calculado. Requer autenticação.

- **Endpoint:** `/api/cycles/`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/cycles/" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Lista de ciclos com status calculado.
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "name": "Q4 2024",
    "start_date": "2024-10-01",
    "end_date": "2024-12-31",
    "is_active": true,
    "days_total": 92,
    "days_elapsed": 45,
    "days_remaining": 47,
    "progress_percentage": 48.91,
    "is_current": true,
    "is_future": false,
    "is_past": false
  }
]
```
- `400 Bad Request`: Usuário não possui empresa associada.
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `POST /api/cycles/`
Cria um novo ciclo para a empresa. Apenas owners e admins podem criar ciclos. Requer autenticação.

- **Endpoint:** `/api/cycles/`
- **Método:** `POST`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "name": "Q1 2025",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31"
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/cycles/" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>" \
-H "Content-Type: application/json" \
-d '{
  "name": "Q1 2025",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31"
}'
```

**Responses:**
- `201 Created`: Ciclo criado com sucesso.
```json
{
  "id": "b2c3d4e5-f6g7-8901-2345-678901bcdefg",
  "name": "Q1 2025",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "company_id": "f2713e40-d8ad-4de7-b67a-63fffb90e553",
  "is_active": false,
  "created_at": "2024-10-27T10:00:00+00:00",
  "updated_at": "2024-10-27T10:00:00+00:00"
}
```
- `400 Bad Request`: Dados inválidos ou nome duplicado.
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Apenas owners e admins podem criar ciclos.
- `500 Internal Server Error`: Erro ao criar ciclo.

---

### `GET /api/cycles/active`
Retorna o ciclo ativo atual da empresa com status calculado. Requer autenticação.

- **Endpoint:** `/api/cycles/active`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/cycles/active" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Ciclo ativo com status.
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "name": "Q4 2024",
  "start_date": "2024-10-01",
  "end_date": "2024-12-31",
  "is_active": true,
  "days_total": 92,
  "days_elapsed": 45,
  "days_remaining": 47,
  "progress_percentage": 48.91,
  "is_current": true,
  "is_future": false,
  "is_past": false
}
```
- `400 Bad Request`: Usuário não possui empresa associada.
- `401 Unauthorized`: Token inválido ou ausente.
- `404 Not Found`: Nenhum ciclo ativo encontrado.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `PUT /api/cycles/{cycle_id}`
Atualiza um ciclo da empresa. Apenas owners e admins podem atualizar ciclos. Requer autenticação.

- **Endpoint:** `/api/cycles/{cycle_id}`
- **Método:** `PUT`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Path Parameters:**
- `cycle_id` (string): O UUID do ciclo a ser atualizado.

**Request Body:**
```json
{
  "name": "Q4 2024 Atualizado",
  "start_date": "2024-10-01",
  "end_date": "2024-12-31"
}
```

**Exemplo de Requisição (`curl`):**
```bash
curl -X PUT "http://localhost:8000/api/cycles/a1b2c3d4-e5f6-7890-1234-567890abcdef" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>" \
-H "Content-Type: application/json" \
-d '{
  "name": "Q4 2024 Atualizado"
}'
```

**Responses:**
- `200 OK`: Ciclo atualizado com sucesso.
- `400 Bad Request`: Dados inválidos ou nome duplicado.
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Apenas owners e admins podem atualizar ciclos.
- `404 Not Found`: Ciclo não encontrado.
- `500 Internal Server Error`: Erro ao atualizar ciclo.

---

### `DELETE /api/cycles/{cycle_id}`
Deleta um ciclo da empresa. Apenas owners podem deletar ciclos. Não é possível deletar o ciclo ativo. Requer autenticação.

- **Endpoint:** `/api/cycles/{cycle_id}`
- **Método:** `DELETE`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Path Parameters:**
- `cycle_id` (string): O UUID do ciclo a ser deletado.

**Exemplo de Requisição (`curl`):**
```bash
curl -X DELETE "http://localhost:8000/api/cycles/a1b2c3d4-e5f6-7890-1234-567890abcdef" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Ciclo deletado com sucesso.
```json
{
  "message": "Ciclo deletado com sucesso"
}
```
- `400 Bad Request**: Tentativa de deletar ciclo ativo.
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Apenas owners podem deletar ciclos.
- `404 Not Found`: Ciclo não encontrado.
- `500 Internal Server Error`: Erro ao deletar ciclo.

---

### `POST /api/cycles/{cycle_id}/activate`
Ativa um ciclo específico e desativa todos os outros da empresa. Apenas owners e admins podem ativar ciclos. Requer autenticação.

- **Endpoint:** `/api/cycles/{cycle_id}/activate`
- **Método:** `POST`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Path Parameters:**
- `cycle_id` (string): O UUID do ciclo a ser ativado.

**Exemplo de Requisição (`curl`):**
```bash
curl -X POST "http://localhost:8000/api/cycles/a1b2c3d4-e5f6-7890-1234-567890abcdef/activate" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Ciclo ativado com sucesso.
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "name": "Q4 2024",
  "start_date": "2024-10-01",
  "end_date": "2024-12-31",
  "company_id": "f2713e40-d8ad-4de7-b67a-63fffb90e553",
  "is_active": true,
  "created_at": "2024-10-27T10:00:00+00:00",
  "updated_at": "2024-10-27T15:30:00+00:00"
}
```
- `401 Unauthorized`: Token inválido ou ausente.
- `403 Forbidden`: Apenas owners e admins podem ativar ciclos.
- `404 Not Found`: Ciclo não encontrado.
- `500 Internal Server Error`: Erro ao ativar ciclo.

---

## 5. Dashboard e Cards Temporais (`/api/dashboard`) - Sprint 3

### `GET /api/dashboard/time-cards`
Retorna todos os cards temporais disponíveis, as preferências do usuário e o ciclo ativo. Requer autenticação.

- **Endpoint:** `/api/dashboard/time-cards`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/dashboard/time-cards" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Cards temporais e preferências.
```json
{
  "available_cards": [
    {
      "type": "TRIMESTRE",
      "name": "Q4 2024",
      "start_date": "2024-10-01",
      "end_date": "2024-12-31",
      "days_total": 92,
      "days_elapsed": 45,
      "days_remaining": 47,
      "progress_percentage": 48.91,
      "is_current": true
    },
    {
      "type": "SEMESTRE",
      "name": "S2 2024",
      "start_date": "2024-07-01",
      "end_date": "2024-12-31",
      "days_total": 184,
      "days_elapsed": 137,
      "days_remaining": 47,
      "progress_percentage": 74.46,
      "is_current": true
    },
    {
      "type": "ANO",
      "name": "2024",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "days_total": 366,
      "days_elapsed": 319,
      "days_remaining": 47,
      "progress_percentage": 87.16,
      "is_current": true
    }
  ],
  "user_preferences": null,
  "active_cycle": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "name": "Q4 2024",
    "start_date": "2024-10-01",
    "end_date": "2024-12-31",
    "is_active": true,
    "days_total": 92,
    "days_elapsed": 45,
    "days_remaining": 47,
    "progress_percentage": 48.91,
    "is_current": true,
    "is_future": false,
    "is_past": false
  }
}
```
- `400 Bad Request`: Usuário não possui empresa associada.
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `PUT /api/dashboard/time-preferences`
Atualiza as preferências de cards temporais do usuário. Usuário pode selecionar até 3 cards para exibir no dashboard. Requer autenticação.

- **Endpoint:** `/api/dashboard/time-preferences`
- **Método:** `PUT`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "selected_cards": ["TRIMESTRE", "SEMESTRE", "ANO"]
}
```

**Tipos de Cards Disponíveis:**
- `TRIMESTRE`: Trimestres (Q1, Q2, Q3, Q4)
- `QUADRIMESTRE`: Quadrimestres (4 meses cada)
- `SEMESTRE`: Semestres (S1, S2)
- `ANO`: Ano completo

**Exemplo de Requisição (`curl`):**
```bash
curl -X PUT "http://localhost:8000/api/dashboard/time-preferences" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>" \
-H "Content-Type: application/json" \
-d '{
  "selected_cards": ["TRIMESTRE", "SEMESTRE", "ANO"]
}'
```

**Responses:**
- `200 OK`: Preferências atualizadas com sucesso.
```json
{
  "id": "c3d4e5f6-g7h8-9012-3456-789012cdefgh",
  "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "company_id": "f2713e40-d8ad-4de7-b67a-63fffb90e553",
  "selected_cards": ["TRIMESTRE", "SEMESTRE", "ANO"],
  "created_at": "2024-10-27T10:00:00+00:00",
  "updated_at": "2024-10-27T15:30:00+00:00"
}
```
- `400 Bad Request`: Dados inválidos (máximo 3 cards, cards únicos).
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro interno do servidor.

---

## 6. Sistema de Roles e Permissões

### Hierarquia de Usuários
1. **ADMIN (Owner)**: Primeiro usuário registrado
   - `is_owner: true`
   - Todas as permissões
   - Único que pode deletar usuários
   - Não pode ser desativado
   - Não pode deletar a si mesmo

2. **ADMIN (Não-Owner)**: Administradores adicionais
   - `is_owner: false`
   - Pode criar e gerenciar colaboradores
   - Não pode alterar outros admins ou owners
   - Pode ser gerenciado apenas por owners

3. **MANAGER**: Gerentes de equipe
   - Permissões intermediárias
   - Pode visualizar e atualizar seus dados
   - Gerenciado por admins e owners

4. **COLLABORATOR**: Colaboradores padrão
   - Permissões básicas
   - Pode visualizar e atualizar seus dados
   - Gerenciado por managers, admins e owners

### Matriz de Permissões

| Ação | Owner | Admin | Manager | Collaborator |
|------|-------|-------|---------|--------------|
| Criar usuários | ✅ | ✅ | ❌ | ❌ |
| Deletar usuários | ✅ | ❌ | ❌ | ❌ |
| Alterar status usuários | ✅ | ✅* | ❌ | ❌ |
| Atualizar outros usuários | ✅ | ✅* | ❌ | ❌ |
| Atualizar próprios dados | ✅ | ✅ | ✅ | ✅ |
| Visualizar usuários empresa | ✅ | ✅ | ✅ | ✅ |

*Admins não podem gerenciar owners ou outros admins

---

## 7. Health Check

### `GET /`
Endpoint de verificação básica da API.

**Responses:**
```json
{
  "status": "API está online",
  "version": "1.0.0",
  "sprint": "Sprint 3 - Sistema de Ciclos e Períodos"
}
```

### `GET /health`
Endpoint de verificação detalhada da API.

**Responses:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "sprint": "Sprint 3",
  "features": [
    "Autenticação com Supabase",
    "Registro de usuário owner",
    "Gestão hierárquica de usuários",
    "Sistema de permissões",
    "CRUD completo de usuários",
    "Gestão de empresas",
    "Sistema de ciclos temporais",
    "Cards estáticos do dashboard"
  ]
}
```

---

## 8. Códigos de Erro Comuns

- **400 Bad Request**: Dados inválidos na requisição
- **401 Unauthorized**: Token inválido, ausente ou usuário desativado
- **403 Forbidden**: Sem permissão para executar a ação
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro interno do servidor

---

## 9. Estrutura de Response Padrão

### Sucesso
```json
{
  "data": {},
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "detail": "Mensagem de erro específica"
}
```

---

## Considerações Técnicas

### Stack Tecnológica
- **Framework**: FastAPI (Python)
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: JWT + Supabase Auth
- **Validação**: Pydantic models

### Segurança
- **Autenticação**: JWT com refresh tokens
- **Autorização**: Role-based access control (RBAC)
- **Validação**: Input validation em todas rotas
- **CORS**: Configurado para frontend

### Variáveis de Ambiente Necessárias
```
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_publica_supabase
SUPABASE_SERVICE_KEY=sua_chave_servico_supabase
ASAAS_API_KEY=sua_chave_asaas
```

---

Esta documentação cobre completamente as Sprints 1, 2 e 3 do sistema OKR. Para testar as rotas, você pode usar curl, Postman, ou acessar a documentação interativa em `http://localhost:8000/docs` ao rodar a aplicação. 
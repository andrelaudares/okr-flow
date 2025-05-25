# API Documentation - Sistema OKR Backend

## Visão Geral
Backend para sistema de gestão de OKRs (Objectives and Key Results) com autenticação hierárquica baseada em empresas.

**Versão**: 1.0.0  
**Sprint Atual**: Sprint 6 - Dashboard Cards Variáveis  
**Base URL**: `http://localhost:8000`

## Sprints Implementadas

### ✅ Sprint 1: Autenticação e Gestão de Usuários
- Sistema de autenticação com Supabase
- Registro de usuário owner
- Gestão hierárquica de usuários
- Sistema de permissões por roles

### ✅ Sprint 2: Sistema de Empresas
- CRUD completo de empresas
- Associação de usuários a empresas
- Controle de acesso baseado em empresa

### ✅ Sprint 3: Sistema de Ciclos e Períodos
- CRUD de ciclos temporais
- Sistema de ativação de ciclos
- Cards dinâmicos do dashboard
- Preferências de usuário

### ✅ Sprint 4: Gestão de Objetivos
- CRUD completo de objetivos
- Sistema de filtros e busca
- Estatísticas de objetivos
- Associação automática com ciclos ativos

### ✅ Sprint 5: Sistema de Key Results
- CRUD completo de Key Results (atividades)
- Sistema de check-ins para atualizações
- Cálculo automático de progresso
- Atualização automática do progresso dos objetivos
- Filtros avançados por unidade e status

### ✅ Sprint 6: Dashboard Cards Variáveis
- Cards dinâmicos do dashboard
- Estatísticas em tempo real
- Métricas de progresso e tendência
- Contadores detalhados de objetivos
- Evolução temporal com análise de tendência

---

## Autenticação

### POST /api/auth/register
Registra um novo usuário owner (primeiro usuário da empresa).

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senhaSegura123",
  "company_name": "Minha Empresa Ltda"
}
```

**Response (201):**
```json
{
  "message": "Usuário owner registrado com sucesso",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "OWNER",
    "is_owner": true,
    "company_id": "uuid"
  },
  "access_token": "jwt_token_here"
}
```

### POST /api/auth/login
Realiza login do usuário.

**Request Body:**
```json
{
  "email": "joao@empresa.com",
  "password": "senhaSegura123"
}
```

**Response (200):**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "OWNER",
    "is_owner": true,
    "company_id": "uuid"
  }
}
```

---

## Usuários

### GET /api/users/
Lista usuários da empresa (com filtros opcionais).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `search` (string, opcional): Busca por nome ou email
- `role` (string, opcional): Filtrar por role (OWNER, ADMIN, MANAGER, COLLABORATOR)
- `is_active` (boolean, opcional): Filtrar por status ativo
- `limit` (int, opcional): Limite de resultados (padrão: 50)
- `offset` (int, opcional): Offset para paginação (padrão: 0)

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "OWNER",
      "is_owner": true,
      "is_active": true,
      "company_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "has_more": false,
  "filters_applied": {
    "search": null,
    "role": null,
    "is_active": null,
    "limit": 50,
    "offset": 0
  }
}
```

### POST /api/users/
Cria um novo usuário na empresa.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER e ADMIN

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@empresa.com",
  "password": "senhaSegura123",
  "role": "MANAGER"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Maria Santos",
  "email": "maria@empresa.com",
  "role": "MANAGER",
  "is_owner": false,
  "is_active": true,
  "company_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/users/{user_id}
Retorna detalhes de um usuário específico.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Maria Santos",
  "email": "maria@empresa.com",
  "role": "MANAGER",
  "is_owner": false,
  "is_active": true,
  "company_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### PUT /api/users/{user_id}
Atualiza um usuário.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** OWNER pode editar qualquer usuário, outros podem editar apenas a si mesmos

**Request Body:**
```json
{
  "name": "Maria Santos Silva",
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Maria Santos Silva",
  "email": "maria@empresa.com",
  "role": "ADMIN",
  "is_owner": false,
  "is_active": true,
  "company_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### DELETE /api/users/{user_id}
Desativa um usuário.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER

**Response (200):**
```json
{
  "message": "Usuário desativado com sucesso"
}
```

---

## Empresas

### GET /api/companies/profile
Retorna o perfil da empresa do usuário logado.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Minha Empresa Ltda",
  "created_at": "2024-01-01T00:00:00Z",
  "users_count": 5,
  "active_users_count": 4
}
```

### PUT /api/companies/profile
Atualiza o perfil da empresa.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER e ADMIN

**Request Body:**
```json
{
  "name": "Minha Empresa S.A."
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Minha Empresa S.A.",
  "created_at": "2024-01-01T00:00:00Z",
  "users_count": 5,
  "active_users_count": 4
}
```

---

## Ciclos

### GET /api/cycles/
Lista ciclos da empresa.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Q1 2024",
    "start_date": "2024-01-01",
    "end_date": "2024-03-31",
    "company_id": "uuid",
    "is_active": true,
    "status": "ACTIVE",
    "days_total": 90,
    "days_elapsed": 45,
    "days_remaining": 45,
    "progress_percentage": 50.0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/cycles/
Cria um novo ciclo.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER e ADMIN

**Request Body:**
```json
{
  "name": "Q2 2024",
  "start_date": "2024-04-01",
  "end_date": "2024-06-30"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Q2 2024",
  "start_date": "2024-04-01",
  "end_date": "2024-06-30",
  "company_id": "uuid",
  "is_active": false,
  "status": "PLANNED",
  "days_total": 91,
  "days_elapsed": 0,
  "days_remaining": 91,
  "progress_percentage": 0.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/cycles/active
Retorna o ciclo ativo da empresa.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Q1 2024",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "company_id": "uuid",
  "is_active": true,
  "status": "ACTIVE",
  "days_total": 90,
  "days_elapsed": 45,
  "days_remaining": 45,
  "progress_percentage": 50.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### PUT /api/cycles/{cycle_id}
Atualiza um ciclo.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER e ADMIN

**Request Body:**
```json
{
  "name": "Q1 2024 - Atualizado",
  "end_date": "2024-04-15"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Q1 2024 - Atualizado",
  "start_date": "2024-01-01",
  "end_date": "2024-04-15",
  "company_id": "uuid",
  "is_active": true,
  "status": "ACTIVE",
  "days_total": 105,
  "days_elapsed": 45,
  "days_remaining": 60,
  "progress_percentage": 42.86,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/cycles/{cycle_id}/activate
Ativa um ciclo (desativa outros automaticamente).

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER e ADMIN

**Response (200):**
```json
{
  "message": "Ciclo ativado com sucesso",
  "cycle": {
    "id": "uuid",
    "name": "Q2 2024",
    "is_active": true,
    "status": "ACTIVE"
  }
}
```

### DELETE /api/cycles/{cycle_id}
Deleta um ciclo.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER

**Response (200):**
```json
{
  "message": "Ciclo deletado com sucesso"
}
```

---

## Objetivos

### GET /api/objectives/
Lista objetivos da empresa com filtros opcionais.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `search` (string, opcional): Busca por título ou descrição
- `status` (array, opcional): Filtrar por status (ON_TRACK, AT_RISK, BEHIND, COMPLETED, PLANNED)
- `owner_id` (uuid, opcional): Filtrar por responsável
- `cycle_id` (uuid, opcional): Filtrar por ciclo
- `limit` (int, opcional): Limite de resultados (padrão: 50, máx: 100)
- `offset` (int, opcional): Offset para paginação (padrão: 0)

**Response (200):**
```json
{
  "objectives": [
    {
      "id": "uuid",
      "title": "Aumentar satisfação do cliente",
      "description": "Melhorar o NPS da empresa para acima de 70 pontos",
      "owner_id": "uuid",
      "company_id": "uuid",
      "cycle_id": "uuid",
      "status": "ON_TRACK",
      "progress": 35.5,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z",
      "owner_name": "João Silva",
      "cycle_name": "Q1 2024",
      "key_results_count": 3
    }
  ],
  "total": 1,
  "has_more": false,
  "filters_applied": {
    "search": null,
    "status": null,
    "owner_id": null,
    "cycle_id": null,
    "limit": 50,
    "offset": 0
  }
}
```

### POST /api/objectives/
Cria um novo objetivo.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Aumentar satisfação do cliente",
  "description": "Melhorar o NPS da empresa para acima de 70 pontos",
  "owner_id": "uuid",
  "cycle_id": "uuid"
}
```

**Notas:**
- Se `owner_id` não for informado, usa o usuário logado
- Se `cycle_id` não for informado, usa o ciclo ativo automaticamente

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Aumentar satisfação do cliente",
  "description": "Melhorar o NPS da empresa para acima de 70 pontos",
  "owner_id": "uuid",
  "company_id": "uuid",
  "cycle_id": "uuid",
  "status": "PLANNED",
  "progress": 0.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/objectives/{objective_id}
Retorna detalhes completos de um objetivo específico.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Aumentar satisfação do cliente",
  "description": "Melhorar o NPS da empresa para acima de 70 pontos",
  "owner_id": "uuid",
  "company_id": "uuid",
  "cycle_id": "uuid",
  "status": "ON_TRACK",
  "progress": 35.5,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z",
  "owner_name": "João Silva",
  "cycle_name": "Q1 2024",
  "key_results_count": 3
}
```

### PUT /api/objectives/{objective_id}
Atualiza um objetivo.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Aumentar satisfação do cliente - Atualizado",
  "description": "Melhorar o NPS da empresa para acima de 75 pontos",
  "status": "ON_TRACK",
  "owner_id": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Aumentar satisfação do cliente - Atualizado",
  "description": "Melhorar o NPS da empresa para acima de 75 pontos",
  "owner_id": "uuid",
  "company_id": "uuid",
  "cycle_id": "uuid",
  "status": "ON_TRACK",
  "progress": 35.5,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

### DELETE /api/objectives/{objective_id}
Deleta um objetivo.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER e ADMIN

**Response (200):**
```json
{
  "message": "Objetivo deletado com sucesso"
}
```

**Erro (400):**
```json
{
  "detail": "Não é possível deletar objetivo que possui key results. Delete os key results primeiro."
}
```

### GET /api/objectives/stats/summary
Retorna estatísticas dos objetivos da empresa.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "total_objectives": 15,
  "by_status": {
    "ON_TRACK": 8,
    "AT_RISK": 3,
    "BEHIND": 1,
    "COMPLETED": 2,
    "PLANNED": 1
  },
  "average_progress": 42.5,
  "completed_count": 2,
  "in_progress_count": 12,
  "planned_count": 1
}
```

---

## Key Results

### GET /api/objectives/{objective_id}/key-results
Lista Key Results de um objetivo específico com filtros opcionais.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `objective_id` (UUID): ID do objetivo

**Query Parameters:**
- `search` (string, opcional): Busca por título ou descrição
- `status` (array, opcional): Filtrar por status (ON_TRACK, AT_RISK, BEHIND, COMPLETED, PLANNED)
- `owner_id` (UUID, opcional): Filtrar por responsável
- `unit` (array, opcional): Filtrar por unidade (PERCENTAGE, NUMBER, CURRENCY, BINARY)
- `limit` (int, opcional): Limite de resultados (padrão: 50, máx: 100)
- `offset` (int, opcional): Offset para paginação (padrão: 0)

**Response (200):**
```json
{
  "key_results": [
    {
      "id": "uuid",
      "title": "Aumentar vendas mensais",
      "description": "Crescimento das vendas para R$ 100.000",
      "objective_id": "uuid",
      "owner_id": "uuid",
      "target_value": 100000,
      "current_value": 75000,
      "start_value": 50000,
      "unit": "CURRENCY",
      "confidence_level": 0.85,
      "status": "ON_TRACK",
      "progress": 50.0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z",
      "owner_name": "João Silva",
      "objective_title": "Aumentar receita da empresa"
    }
  ],
  "total": 1,
  "has_more": false,
  "filters_applied": {
    "search": null,
    "status": null,
    "owner_id": null,
    "unit": null,
    "limit": 50,
    "offset": 0
  }
}
```

### POST /api/objectives/{objective_id}/key-results
Cria um novo Key Result para um objetivo.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `objective_id` (UUID): ID do objetivo

**Request Body:**
```json
{
  "title": "Aumentar vendas mensais",
  "description": "Crescimento das vendas para R$ 100.000",
  "target_value": 100000,
  "unit": "CURRENCY",
  "start_value": 50000,
  "current_value": 65000,
  "confidence_level": 0.8,
  "owner_id": "uuid"
}
```

**Notas:**
- `title` e `target_value` são obrigatórios
- `unit` deve ser: PERCENTAGE, NUMBER, CURRENCY ou BINARY
- Se `owner_id` não for informado, usa o usuário logado
- `start_value` e `current_value` padrão é 0
- Progresso é calculado automaticamente: `((current_value - start_value) / (target_value - start_value)) * 100`

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Aumentar vendas mensais",
  "description": "Crescimento das vendas para R$ 100.000",
  "objective_id": "uuid",
  "owner_id": "uuid",
  "target_value": 100000,
  "current_value": 65000,
  "start_value": 50000,
  "unit": "CURRENCY",
  "confidence_level": 0.8,
  "status": "ON_TRACK",
  "progress": 30.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/objectives/key-results/{kr_id}
Retorna detalhes completos de um Key Result específico.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Aumentar vendas mensais",
  "description": "Crescimento das vendas para R$ 100.000",
  "objective_id": "uuid",
  "owner_id": "uuid",
  "target_value": 100000,
  "current_value": 75000,
  "start_value": 50000,
  "unit": "CURRENCY",
  "confidence_level": 0.85,
  "status": "ON_TRACK",
  "progress": 50.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z",
  "owner_name": "João Silva",
  "objective_title": "Aumentar receita da empresa"
}
```

### PUT /api/objectives/key-results/{kr_id}
Atualiza um Key Result.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Aumentar vendas mensais - Atualizado",
  "current_value": 80000,
  "confidence_level": 0.9,
  "status": "ON_TRACK"
}
```

**Notas:**
- Progresso é recalculado automaticamente quando valores mudam
- Status é atualizado automaticamente baseado no progresso se não especificado:
  - >= 100%: COMPLETED
  - >= 70%: ON_TRACK  
  - >= 30%: AT_RISK
  - < 30%: BEHIND

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Aumentar vendas mensais - Atualizado",
  "description": "Crescimento das vendas para R$ 100.000",
  "objective_id": "uuid",
  "owner_id": "uuid",
  "target_value": 100000,
  "current_value": 80000,
  "start_value": 50000,
  "unit": "CURRENCY",
  "confidence_level": 0.9,
  "status": "ON_TRACK",
  "progress": 60.0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

### DELETE /api/objectives/key-results/{kr_id}
Deleta um Key Result.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "Key Result deletado com sucesso"
}
```

**Notas:**
- Todos os check-ins associados são deletados automaticamente
- O progresso do objetivo é recalculado automaticamente

---

## Check-ins

### GET /api/objectives/key-results/{kr_id}/checkins
Lista check-ins de um Key Result específico.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `kr_id` (UUID): ID do Key Result

**Response (200):**
```json
{
  "checkins": [
    {
      "id": "uuid",
      "key_result_id": "uuid",
      "author_id": "uuid",
      "checkin_date": "2024-01-15T10:30:00Z",
      "value_at_checkin": 80000,
      "confidence_level_at_checkin": 0.85,
      "notes": "Excelente progresso este mês! Vendas superando expectativas.",
      "created_at": "2024-01-15T10:30:00Z",
      "author_name": "João Silva"
    }
  ],
  "total": 1
}
```

### POST /api/objectives/key-results/{kr_id}/checkins
Cria um novo check-in para um Key Result.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `kr_id` (UUID): ID do Key Result

**Request Body:**
```json
{
  "value_at_checkin": 80000,
  "confidence_level_at_checkin": 0.85,
  "notes": "Excelente progresso este mês! Vendas superando expectativas."
}
```

**Notas:**
- `value_at_checkin` é obrigatório
- Atualiza automaticamente o `current_value` do Key Result
- Recalcula automaticamente o progresso do Key Result e do objetivo
- Atualiza automaticamente o `confidence_level` do Key Result se informado

**Response (201):**
```json
{
  "id": "uuid",
  "key_result_id": "uuid",
  "author_id": "uuid",
  "checkin_date": "2024-01-15T10:30:00Z",
  "value_at_checkin": 80000,
  "confidence_level_at_checkin": 0.85,
  "notes": "Excelente progresso este mês! Vendas superando expectativas.",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### PUT /api/objectives/checkins/{checkin_id}
Atualiza um check-in.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas o autor do check-in pode atualizá-lo

**Request Body:**
```json
{
  "value_at_checkin": 82000,
  "confidence_level_at_checkin": 0.9,
  "notes": "Correção: valor atualizado após verificação final."
}
```

**Notas:**
- Se `value_at_checkin` for atualizado, recalcula automaticamente o progresso do Key Result e objetivo

**Response (200):**
```json
{
  "id": "uuid",
  "key_result_id": "uuid",
  "author_id": "uuid",
  "checkin_date": "2024-01-15T10:30:00Z",
  "value_at_checkin": 82000,
  "confidence_level_at_checkin": 0.9,
  "notes": "Correção: valor atualizado após verificação final.",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### DELETE /api/objectives/checkins/{checkin_id}
Deleta um check-in.

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas o autor do check-in pode deletá-lo

**Response (200):**
```json
{
  "message": "Check-in deletado com sucesso"
}
```

---

## Dashboard Cards Variáveis

### GET /api/dashboard/stats
Retorna estatísticas gerais do dashboard.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "total_objectives": 15,
  "total_key_results": 45,
  "active_users": 8,
  "active_cycle_name": "Q1 2024",
  "active_cycle_progress": 75.5,
  "company_name": "Minha Empresa Ltda",
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### GET /api/dashboard/progress
Retorna dados de progresso geral com tendências.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "current_progress": 68.5,
  "expected_progress": 75.0,
  "variance": -6.5,
  "status_color": "YELLOW",
  "trend_direction": "UP",
  "trend_percentage": 2.5,
  "cycle_days_total": 90,
  "cycle_days_elapsed": 68,
  "cycle_days_remaining": 22
}
```

**Status Colors:**
- `GREEN`: Progresso dentro ou acima do esperado
- `YELLOW`: Progresso ligeiramente abaixo do esperado (5-15%)
- `RED`: Progresso significativamente abaixo do esperado (>15%)

**Trend Directions:**
- `UP`: Tendência de crescimento
- `DOWN`: Tendência de declínio
- `STABLE`: Tendência estável

### GET /api/dashboard/objectives-count
Retorna contadores detalhados de objetivos por status.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "total": 15,
  "completed": 3,
  "on_track": 8,
  "at_risk": 3,
  "behind": 1,
  "planned": 0,
  "completion_rate": 20.0,
  "on_track_rate": 73.33
}
```

**Descrição dos Status:**
- `completed`: Objetivos 100% concluídos
- `on_track`: Objetivos entre 70-99% de progresso
- `at_risk`: Objetivos entre 30-69% de progresso
- `behind`: Objetivos com menos de 30% de progresso
- `planned`: Objetivos ainda não iniciados (0% progresso)

### GET /api/dashboard/evolution
Retorna dados de evolução temporal com análise de tendência.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "period_start": "2024-01-01",
  "period_end": "2024-03-31",
  "current_date": "2024-01-15",
  "evolution_points": [
    {
      "date": "2024-01-01",
      "actual_progress": 0.0,
      "expected_progress": 0.0,
      "objectives_count": 15
    },
    {
      "date": "2024-01-08",
      "actual_progress": 12.5,
      "expected_progress": 8.9,
      "objectives_count": 15
    },
    {
      "date": "2024-01-15",
      "actual_progress": 28.3,
      "expected_progress": 17.8,
      "objectives_count": 15
    }
  ],
  "trend_analysis": {
    "direction": "UP",
    "average_weekly_growth": 2.5,
    "consistency_score": 85.0,
    "prediction_next_week": 31.3
  },
  "performance_summary": {
    "overall_score": 78.5,
    "time_efficiency": 82.0,
    "goal_achievement": 75.0,
    "team_engagement": 80.0
  }
}
```

**Notas sobre Evolution:**
- `evolution_points`: Pontos semanais de progresso ao longo do período
- `trend_analysis`: Análise de tendência e previsões
- `performance_summary`: Resumo de performance da empresa
- Período baseado no ciclo ativo ou últimos 30 dias se não houver ciclo

---

## Cards Temporais

### GET /api/dashboard/time-cards
Retorna cards de tempo para o dashboard (Sprint 3).

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "time_cards": [
    {
      "type": "TRIMESTRE",
      "title": "Q1 2024",
      "period": "Jan - Mar 2024",
      "progress_percentage": 75.5,
      "days_total": 90,
      "days_elapsed": 68,
      "days_remaining": 22,
      "start_date": "2024-01-01",
      "end_date": "2024-03-31"
    },
    {
      "type": "SEMESTRE",
      "title": "S1 2024",
      "period": "Jan - Jun 2024",
      "progress_percentage": 37.8,
      "days_total": 182,
      "days_elapsed": 68,
      "days_remaining": 114,
      "start_date": "2024-01-01",
      "end_date": "2024-06-30"
    },
    {
      "type": "ANO",
      "title": "2024",
      "period": "Jan - Dez 2024",
      "progress_percentage": 18.9,
      "days_total": 366,
      "days_elapsed": 68,
      "days_remaining": 298,
      "start_date": "2024-01-01",
      "end_date": "2024-12-31"
    }
  ],
  "user_preferences": {
    "selected_cards": ["TRIMESTRE", "SEMESTRE", "ANO"]
  },
  "active_cycle": {
    "id": "uuid",
    "name": "Q1 2024",
    "progress_percentage": 75.5
  }
}
```

### PUT /api/dashboard/time-preferences
Configura as preferências de cards do usuário.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "selected_cards": ["TRIMESTRE", "SEMESTRE"]
}
```

**Notas:**
- Máximo de 3 cards selecionados
- Tipos válidos: TRIMESTRE, QUADRIMESTRE, SEMESTRE, ANO

**Response (200):**
```json
{
  "message": "Preferências atualizadas com sucesso",
  "selected_cards": ["TRIMESTRE", "SEMESTRE"]
}
```

---

## Health Check

### GET /health
Retorna status detalhado da API.

**Response (200):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "sprint": "Sprint 6",
  "features": [
    "Autenticação com Supabase",
    "Registro de usuário owner",
    "Gestão hierárquica de usuários",
    "Sistema de permissões",
    "CRUD completo de usuários",
    "Gestão de empresas",
    "Sistema de ciclos temporais",
    "Cards estáticos do dashboard",
    "CRUD completo de objetivos",
    "Sistema de filtros e busca",
    "CRUD completo de Key Results",
    "Sistema de check-ins",
    "Cálculo automático de progresso",
    "Dashboard cards variáveis",
    "Estatísticas em tempo real",
    "Métricas de progresso",
    "Contadores de objetivos",
    "Evolução temporal"
  ]
}
```

### GET /
Health check simples.

**Response (200):**
```json
{
  "status": "API está online",
  "version": "1.0.0",
  "sprint": "Sprint 6 - Dashboard Cards Variáveis"
}
```

---

## Códigos de Status HTTP

### Sucesso
- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso

### Erro do Cliente
- `400 Bad Request` - Dados inválidos ou regra de negócio violada
- `401 Unauthorized` - Token de autenticação inválido ou ausente
- `403 Forbidden` - Usuário não tem permissão para a ação
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Erro de validação dos dados

### Erro do Servidor
- `500 Internal Server Error` - Erro interno do servidor

---

## Exemplos de Filtros

### Busca por Objetivos
```
GET /api/objectives/?search=satisfação&status=ON_TRACK&status=AT_RISK&limit=10&offset=0
```

### Busca por Usuários
```
GET /api/users/?search=joão&role=MANAGER&is_active=true&limit=20
```

### Busca por Key Results
```
GET /api/objectives/{objective_id}/key-results?search=vendas&unit=CURRENCY&unit=PERCENTAGE&status=ON_TRACK&limit=10
```
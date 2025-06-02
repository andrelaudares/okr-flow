# API Documentation - Sistema OKR Backend

## Visão Geral
Backend para sistema de gestão de OKRs (Objectives and Key Results) com autenticação hierárquica baseada em empresas.

**Versão**: 1.0.0  
**Sprint Atual**: Sprint 8 - Sistema de Histórico e Analytics  
**Base URL**: `http://localhost:8000`
 python -m app.main

python start_server.py --host 127.0.0.1 --port 8000

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

### ✅ Sprint 7: Sistema de Relatórios e Exportação
- Sistema robusto de exportação
- Relatórios formatados em múltiplos formatos
- Geração em background com status
- Download de arquivos gerados
- Filtros avançados para relatórios

### ✅ Sprint 8: Sistema de Histórico e Analytics
- Histórico de progresso geral da empresa
- Histórico específico de objetivos
- Análise de tendências comparativa
- Métricas de performance detalhadas
- Insights automáticos e recomendações

### ✅ Sprint 9: Sistema de Notificações e Integrações
- Sistema de notificações personalizadas
- Alertas automáticos de check-in pendente
- Alertas automáticos de objetivo atrasado
- Alertas automáticos de fim de ciclo
- Alertas automáticos de meta atingida
- Configurações de notificação por usuário
- Estatísticas detalhadas de notificações
- Filtros e paginação avançada

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

## Sistema de Relatórios

### GET /api/reports/formats
Retorna os formatos de exportação disponíveis no sistema.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "formats": [
    {
      "format": "CSV",
      "name": "CSV",
      "description": "Arquivo CSV separado por ponto e vírgula",
      "extension": ".csv",
      "supports_charts": false
    },
    {
      "format": "EXCEL",
      "name": "Excel",
      "description": "Planilha do Microsoft Excel com múltiplas abas",
      "extension": ".xlsx",
      "supports_charts": false,
      "note": "Requer pandas instalado"
    },
    {
      "format": "PDF",
      "name": "PDF",
      "description": "Documento PDF formatado com tabelas e resumo",
      "extension": ".pdf",
      "supports_charts": true,
      "note": "Requer reportlab instalado"
    }
  ]
}
```

### POST /api/reports/export
Gera um relatório para exportação baseado nos filtros especificados.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Relatório Q1 2024",
  "report_type": "COMPLETE",
  "format": "PDF",
  "filters": {
    "search": "vendas",
    "status": ["ON_TRACK", "COMPLETED"],
    "owner_id": "uuid",
    "cycle_id": "uuid",
    "start_date": "2024-01-01",
    "end_date": "2024-03-31",
    "include_key_results": true,
    "include_checkins": true
  },
  "include_charts": true
}
```

**Tipos de Relatório:**
- `DASHBOARD`: Resumo executivo e métricas gerais
- `OBJECTIVES`: Lista detalhada de objetivos com Key Results
- `KEY_RESULTS`: Lista detalhada de Key Results com check-ins
- `COMPLETE`: Relatório completo com todos os dados

**Formatos Disponíveis:**
- `CSV`: Arquivo CSV separado por ponto e vírgula
- `EXCEL`: Planilha Excel com múltiplas abas
- `PDF`: Documento PDF formatado com tabelas

**Response (200):**
```json
{
  "id": "uuid",
  "message": "Relatório enviado para processamento",
  "status": "PENDING",
  "estimated_time": 15
}
```

### GET /api/reports/{report_id}/status
Retorna o status atual de um relatório em processamento.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `report_id` (UUID): ID do relatório

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Relatório Q1 2024",
  "report_type": "COMPLETE",
  "format": "PDF",
  "status": "COMPLETED",
  "file_size": 1048576,
  "download_url": "/api/reports/uuid/download",
  "records_count": 25,
  "generation_started_at": "2024-01-15T10:00:00Z",
  "generation_completed_at": "2024-01-15T10:02:30Z",
  "expires_at": "2024-01-16T10:02:30Z"
}
```

**Status possíveis:**
- `PENDING`: Aguardando processamento
- `PROCESSING`: Sendo processado
- `COMPLETED`: Pronto para download
- `FAILED`: Erro no processamento

### GET /api/reports/{report_id}/download
Faz download de um relatório gerado.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `report_id` (UUID): ID do relatório

**Response (200):**
Arquivo binário com headers apropriados:
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="Relatorio_Q1_2024.pdf"
```

**Erros possíveis:**
- `404`: Relatório não encontrado
- `400`: Relatório não está pronto
- `410`: Relatório expirado

### GET /api/reports/
Lista todos os relatórios gerados pelo usuário.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "reports": [
    {
      "id": "uuid",
      "name": "Relatório Q1 2024",
      "report_type": "COMPLETE",
      "format": "PDF",
      "status": "COMPLETED",
      "file_size": 1048576,
      "records_count": 25,
      "generation_started_at": "2024-01-15T10:00:00Z",
      "generation_completed_at": "2024-01-15T10:02:30Z",
      "expires_at": "2024-01-16T10:02:30Z"
    }
  ],
  "total": 1
}
```

### DELETE /api/reports/{report_id}
Deleta um relatório e remove o arquivo associado.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `report_id` (UUID): ID do relatório

**Response (200):**
```json
{
  "message": "Relatório deletado com sucesso"
}
```

---

## Analytics - Sprint 8

O sistema de Analytics fornece funcionalidades avançadas de histórico, análise de tendências e métricas de performance para empresas com OKRs ativos.

### GET /api/analytics/history
Retorna histórico de progresso geral da empresa com evolução temporal.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (date, opcional): Data de início (YYYY-MM-DD) - padrão: 90 dias atrás
- `end_date` (date, opcional): Data de fim (YYYY-MM-DD) - padrão: hoje
- `cycle_id` (UUID, opcional): Analisar apenas um ciclo específico
- `granularity` (enum, opcional): DAILY, WEEKLY, MONTHLY - padrão: WEEKLY
- `include_predictions` (boolean, opcional): Incluir previsões - padrão: true
- `include_benchmarks` (boolean, opcional): Incluir benchmarks - padrão: true

**Response (200):**
```json
{
  "success": true,
  "data": {
    "company_id": "uuid",
    "company_name": "Minha Empresa Ltda",
    "period_start": "2024-01-01",
    "period_end": "2024-03-31",
    "current_date": "2024-03-15",
    "active_cycle_name": "Q1 2024",
    "granularity": "WEEKLY",
    "evolution_points": [
      {
        "date": "2024-01-01",
        "actual_progress": 15.5,
        "expected_progress": 33.3,
        "objectives_count": 5,
        "completed_objectives": 0,
        "active_key_results": 15
      }
    ],
    "trend_analysis": {
      "direction": "UP",
      "average_weekly_growth": 2.3,
      "consistency_score": 78.5,
      "prediction_next_week": 67.8,
      "volatility_index": 5.2
    },
    "performance_summary": {
      "overall_score": 82.4,
      "time_efficiency": 85.6,
      "goal_achievement": 78.9,
      "team_engagement": 91.2,
      "completion_rate": 65.0
    },
    "total_objectives_period": 8,
    "total_key_results_period": 24,
    "total_checkins_period": 156
  },
  "message": "Histórico recuperado com sucesso"
}
```

**Casos de uso:**
- Dashboard de evolução temporal com gráficos interativos
- Análise de performance ao longo do tempo
- Comparação entre progresso real e esperado
- Identificação de padrões e tendências

### GET /api/analytics/objectives/{objective_id}
Retorna histórico específico de um objetivo com métricas detalhadas.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `objective_id` (UUID): ID do objetivo

**Query Parameters:**
- `start_date` (date, opcional): Data de início - padrão: data de criação do objetivo
- `end_date` (date, opcional): Data de fim - padrão: hoje

**Response (200):**
```json
{
  "success": true,
  "data": {
    "objective_id": "uuid",
    "objective_title": "Aumentar satisfação do cliente",
    "objective_status": "ON_TRACK",
    "owner_name": "João Silva",
    "cycle_name": "Q1 2024",
    "period_start": "2024-01-01",
    "period_end": "2024-03-31",
    "history_points": [
      {
        "date": "2024-01-01",
        "progress": 0.0,
        "key_results_count": 3,
        "checkins_count": 0,
        "notes": null
      },
      {
        "date": "2024-01-08",
        "progress": 12.5,
        "key_results_count": 3,
        "checkins_count": 3,
        "notes": null
      }
    ],
    "initial_progress": 0.0,
    "current_progress": 65.3,
    "total_growth": 65.3,
    "average_weekly_growth": 5.4,
    "key_results_summary": [
      {
        "id": "uuid",
        "title": "Aumentar NPS para 70",
        "progress": 80.0,
        "status": "ON_TRACK",
        "target_value": 70,
        "current_value": 56,
        "unit": "NUMBER"
      }
    ]
  },
  "message": "Histórico do objetivo recuperado com sucesso"
}
```

**Casos de uso:**
- Página de detalhes do objetivo com histórico
- Análise de evolução individual
- Identificação de marcos e mudanças de ritmo
- Relatórios específicos por objetivo

### GET /api/analytics/trends
Retorna análise comparativa de tendências entre períodos.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (date, opcional): Data de início - padrão: 28 dias atrás
- `end_date` (date, opcional): Data de fim - padrão: hoje
- `owner_id` (UUID, opcional): Filtrar por responsável específico

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analysis_date": "2024-03-15T10:30:00Z",
    "company_id": "uuid",
    "period_analyzed": "Últimas 28 dias",
    "objectives_trend": {
      "metric_name": "Objetivos Ativos",
      "current_value": 8,
      "previous_value": 6,
      "change_percentage": 33.3,
      "trend_direction": "UP",
      "is_positive_trend": true
    },
    "progress_trend": {
      "metric_name": "Progresso Médio",
      "current_value": 67.5,
      "previous_value": 52.3,
      "change_percentage": 29.1,
      "trend_direction": "UP",
      "is_positive_trend": true
    },
    "completion_trend": {
      "metric_name": "Taxa de Conclusão",
      "current_value": 25.0,
      "previous_value": 16.7,
      "change_percentage": 49.8,
      "trend_direction": "UP",
      "is_positive_trend": true
    },
    "engagement_trend": {
      "metric_name": "Engajamento",
      "current_value": 87.5,
      "previous_value": 75.0,
      "change_percentage": 16.7,
      "trend_direction": "UP",
      "is_positive_trend": true
    },
    "key_results_trend": {
      "metric_name": "Key Results Ativos",
      "current_value": 24,
      "previous_value": 18,
      "change_percentage": 33.3,
      "trend_direction": "UP",
      "is_positive_trend": true
    },
    "insights": [
      "📈 Progresso da equipe cresceu 29.1% no período",
      "🎯 Taxa de conclusão melhorou 49.8%",
      "🔥 Alto engajamento da equipe com atualizações frequentes"
    ],
    "recommendations": [
      "Manter ritmo atual de check-ins",
      "Considerar aumentar metas para o próximo ciclo"
    ],
    "overall_health_score": 89.3,
    "improvement_areas": []
  },
  "message": "Análise de tendências gerada com sucesso"
}
```

**Casos de uso:**
- Dashboard executivo com métricas comparativas
- Identificação de tendências positivas e negativas
- Insights automáticos para tomada de decisão
- Relatórios de health check da empresa

### GET /api/analytics/performance
Retorna análise detalhada de performance com métricas e alertas.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (date, opcional): Data de início da análise
- `end_date` (date, opcional): Data de fim da análise
- `cycle_id` (UUID, opcional): Analisar ciclo específico

**Response (200):**
```json
{
  "success": true,
  "data": {
    "analysis_date": "2024-03-15T10:30:00Z",
    "company_id": "uuid",
    "company_name": "Minha Empresa Ltda",
    "current_cycle": {
      "cycle_id": "uuid",
      "cycle_name": "Q1 2024",
      "cycle_progress": 75.0,
      "objectives_performance": 67.5,
      "efficiency_score": 90.0,
      "previous_cycle_comparison": null,
      "improvement_percentage": null
    },
    "metrics": [
      {
        "name": "Total de Objetivos",
        "value": 8,
        "unit": "unidades",
        "benchmark": 5.0,
        "performance_level": "Excelente",
        "description": "Número total de objetivos ativos no ciclo"
      },
      {
        "name": "Progresso Médio",
        "value": 67.5,
        "unit": "%",
        "benchmark": 70.0,
        "performance_level": "Bom",
        "description": "Progresso médio de todos os objetivos"
      },
      {
        "name": "Taxa de Conclusão",
        "value": 25.0,
        "unit": "%",
        "benchmark": 80.0,
        "performance_level": "Regular",
        "description": "Percentual de objetivos concluídos"
      }
    ],
    "executive_summary": {
      "status_geral": "Bom",
      "progresso_medio": "67.5%",
      "taxa_conclusao": "25.0%",
      "eficiencia_temporal": "90.0%",
      "resumo": "A equipe está bom com 67.5% de progresso médio nos objetivos."
    },
    "alerts": [
      "🎯 Taxa de conclusão baixa - revisar complexidade dos objetivos"
    ],
    "action_items": [
      "Manter atualizações regulares nos Key Results",
      "Monitorar progresso semanalmente"
    ],
    "month_over_month": null,
    "quarter_over_quarter": null
  },
  "message": "Análise de performance gerada com sucesso"
}
```

**Casos de uso:**
- Relatórios executivos de performance
- Identificação de alertas e áreas de atenção
- Benchmarking contra metas estabelecidas
- Planejamento de ações corretivas

### GET /api/analytics/health
Health check específico do módulo de Analytics.

**Response (200):**
```json
{
  "status": "healthy",
  "module": "Analytics",
  "sprint": "Sprint 8",
  "features": [
    "Histórico de progresso geral",
    "Histórico específico de objetivos",
    "Análise de tendências",
    "Métricas de performance",
    "Insights automáticos",
    "Recomendações inteligentes",
    "Alertas de performance",
    "Comparações temporais"
  ],
  "endpoints": [
    "GET /api/analytics/history",
    "GET /api/analytics/objectives/{id}",
    "GET /api/analytics/trends",
    "GET /api/analytics/performance"
  ]
}
```

### Códigos de Resposta Analytics

**Sucesso:**
- `200 OK` - Análise gerada com sucesso

**Erros do Cliente:**
- `400 Bad Request` - Usuário sem empresa ou filtros inválidos
- `401 Unauthorized` - Token inválido ou ausente
- `404 Not Found` - Objetivo não encontrado ou não pertence à empresa

**Erros do Servidor:**
- `500 Internal Server Error` - Erro interno na geração da análise

### Exemplos de Uso Analytics

#### Análise Histórica com Período Específico
```
GET /api/analytics/history?start_date=2024-01-01&end_date=2024-03-31&granularity=MONTHLY&include_predictions=true
```

#### Histórico de Objetivo Específico
```
GET /api/analytics/objectives/550e8400-e29b-41d4-a716-446655440000?start_date=2024-02-01&end_date=2024-03-31
```

#### Análise de Tendências de 6 Semanas
```
GET /api/analytics/trends?start_date=2024-02-01&end_date=2024-03-15
```

#### Performance do Ciclo Ativo
```
GET /api/analytics/performance
```

#### Performance de Ciclo Específico
```
GET /api/analytics/performance?cycle_id=550e8400-e29b-41d4-a716-446655440000
```

---

## Notificações - Sprint 9

O sistema de Notificações fornece alertas automáticos e personalizáveis para manter os usuários informados sobre o progresso de seus OKRs e eventos importantes da empresa.

### GET /api/notifications/
Lista notificações do usuário logado com filtros opcionais.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (array, opcional): Tipos de notificação (CHECKIN_PENDING, OBJECTIVE_BEHIND, CYCLE_ENDING, TARGET_ACHIEVED)
- `is_read` (boolean, opcional): Filtrar por lidas (true) ou não lidas (false)
- `priority` (array, opcional): Prioridades (1=baixa, 2=média, 3=alta)
- `start_date` (datetime, opcional): Data inicial (formato ISO)
- `end_date` (datetime, opcional): Data final (formato ISO)
- `limit` (int, opcional): Limite de resultados (1-100, padrão: 50)
- `offset` (int, opcional): Offset para paginação (padrão: 0)

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "company_id": "uuid",
      "type": "CHECKIN_PENDING",
      "title": "Check-in pendente: Aumentar vendas mensais",
      "message": "O Key Result 'Aumentar vendas mensais' não recebe atualização há 3 dias. Faça um check-in para manter o progresso atualizado.",
      "data": {
        "key_result_id": "uuid",
        "objective_id": "uuid",
        "days_without_checkin": 3
      },
      "is_read": false,
      "priority": 2,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "expires_at": null
    }
  ],
  "total": 15,
  "unread_count": 8,
  "has_more": false,
  "filters_applied": {
    "type": ["CHECKIN_PENDING"],
    "is_read": false,
    "priority": null,
    "start_date": null,
    "end_date": null,
    "limit": 50,
    "offset": 0
  }
}
```

### POST /api/notifications/mark-read
Marca uma ou mais notificações como lidas.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "notification_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (200):**
```json
{
  "marked_count": 3,
  "message": "3 notificação(ões) marcada(s) como lida(s)"
}
```

### GET /api/notifications/stats
Retorna estatísticas das notificações do usuário.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "total": 25,
  "unread": 8,
  "by_type": {
    "CHECKIN_PENDING": 5,
    "OBJECTIVE_BEHIND": 2,
    "CYCLE_ENDING": 1,
    "TARGET_ACHIEVED": 17
  },
  "by_priority": {
    "1": 17,
    "2": 6,
    "3": 2
  },
  "recent_count": 4
}
```

### GET /api/notifications/settings
Retorna as configurações de notificação do usuário.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "company_id": "uuid",
  "checkin_pending_enabled": true,
  "checkin_pending_days": 3,
  "objective_behind_enabled": true,
  "objective_behind_threshold": 20,
  "cycle_ending_enabled": true,
  "cycle_ending_days": 7,
  "target_achieved_enabled": true,
  "email_notifications": true,
  "push_notifications": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### PUT /api/notifications/settings
Atualiza as configurações de notificação do usuário.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "checkin_pending_enabled": true,
  "checkin_pending_days": 5,
  "objective_behind_enabled": true,
  "objective_behind_threshold": 15,
  "cycle_ending_enabled": true,
  "cycle_ending_days": 10,
  "target_achieved_enabled": true,
  "email_notifications": false,
  "push_notifications": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "company_id": "uuid",
  "checkin_pending_enabled": true,
  "checkin_pending_days": 5,
  "objective_behind_enabled": true,
  "objective_behind_threshold": 15,
  "cycle_ending_enabled": true,
  "cycle_ending_days": 10,
  "target_achieved_enabled": true,
  "email_notifications": false,
  "push_notifications": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T15:45:00Z"
}
```

### POST /api/notifications/generate-alerts
Gera alertas automáticos para a empresa (endpoint para testes/admin).

**Headers:** `Authorization: Bearer {token}`  
**Permissões:** Apenas OWNER e ADMIN

**Response (200):**
```json
{
  "message": "Geração de alertas automáticos iniciada",
  "status": "processing",
  "company_id": "uuid"
}
```

### GET /api/notifications/health
Health check específico do módulo de Notificações.

**Response (200):**
```json
{
  "status": "healthy",
  "module": "Notifications",
  "sprint": "Sprint 9",
  "features": [
    "Sistema de notificações por usuário",
    "Alertas automáticos de check-in pendente",
    "Alertas automáticos de objetivo atrasado",
    "Alertas automáticos de fim de ciclo",
    "Alertas automáticos de meta atingida",
    "Configurações personalizáveis por usuário",
    "Filtros e paginação de notificações",
    "Estatísticas detalhadas",
    "Marcação como lida (individual e em lote)",
    "Níveis de prioridade (baixa, média, alta)",
    "Expiração automática de notificações",
    "Isolamento por empresa (Row Level Security)"
  ],
  "endpoints": [
    "GET /api/notifications/",
    "POST /api/notifications/mark-read",
    "GET /api/notifications/stats",
    "GET /api/notifications/settings",
    "PUT /api/notifications/settings",
    "POST /api/notifications/generate-alerts"
  ],
  "notification_types": [
    "CHECKIN_PENDING - KR sem check-in há X dias",
    "OBJECTIVE_BEHIND - Objetivo com progresso abaixo do esperado",
    "CYCLE_ENDING - Fim de ciclo se aproximando",
    "TARGET_ACHIEVED - Meta atingida (100%)"
  ]
}
```

### Tipos de Notificação

#### CHECKIN_PENDING - Check-in Pendente
**Descrição:** Key Result sem atualização há X dias (configurável)  
**Trigger:** Ausência de check-ins por período determinado  
**Prioridade:** Média  
**Dados incluídos:**
- `key_result_id`: ID do Key Result
- `objective_id`: ID do objetivo relacionado
- `days_without_checkin`: Dias sem check-in

#### OBJECTIVE_BEHIND - Objetivo Atrasado
**Descrição:** Objetivo com progresso significativamente abaixo do esperado  
**Trigger:** Diferença entre progresso real e esperado maior que threshold  
**Prioridade:** Alta  
**Dados incluídos:**
- `objective_id`: ID do objetivo
- `actual_progress`: Progresso atual (%)
- `expected_progress`: Progresso esperado (%)
- `gap`: Diferença entre esperado e atual

#### CYCLE_ENDING - Fim de Ciclo
**Descrição:** Ciclo ativo próximo do fim  
**Trigger:** X dias antes do fim do ciclo (configurável)  
**Prioridade:** Alta  
**Dados incluídos:**
- `cycle_id`: ID do ciclo
- `days_remaining`: Dias restantes
- `end_date`: Data de fim do ciclo

#### TARGET_ACHIEVED - Meta Atingida
**Descrição:** Key Result ou Objetivo concluído com 100%  
**Trigger:** Progresso atingindo 100%  
**Prioridade:** Baixa (celebração)  
**Dados incluídos:**
- `key_result_id` ou `objective_id`: ID do item concluído
- `achievement_date`: Data da conquista

### Configurações de Notificação

#### Parâmetros Configuráveis
- **Check-in Pendente:**
  - `checkin_pending_enabled`: Ativar/desativar (padrão: true)
  - `checkin_pending_days`: Dias sem check-in para alertar (1-30, padrão: 3)

- **Objetivo Atrasado:**
  - `objective_behind_enabled`: Ativar/desativar (padrão: true)
  - `objective_behind_threshold`: % abaixo do esperado para alertar (5-50, padrão: 20)

- **Fim de Ciclo:**
  - `cycle_ending_enabled`: Ativar/desativar (padrão: true)
  - `cycle_ending_days`: Dias antes do fim para alertar (1-30, padrão: 7)

- **Meta Atingida:**
  - `target_achieved_enabled`: Ativar/desativar (padrão: true)

- **Preferências de Entrega:**
  - `email_notifications`: Receber por email (padrão: true)
  - `push_notifications`: Receber notificações push (padrão: true)

### Exemplos de Uso

#### Listar Notificações Não Lidas
```
GET /api/notifications/?is_read=false&limit=10
```

#### Listar Alertas de Alta Prioridade
```
GET /api/notifications/?priority=3&limit=20
```

#### Filtrar por Tipo e Período
```
GET /api/notifications/?type=CHECKIN_PENDING&type=OBJECTIVE_BEHIND&start_date=2024-01-01&end_date=2024-01-31
```

#### Marcar Múltiplas Como Lidas
```json
POST /api/notifications/mark-read
{
  "notification_ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### Configurar Alertas Personalizados
```json
PUT /api/notifications/settings
{
  "checkin_pending_days": 2,
  "objective_behind_threshold": 15,
  "cycle_ending_days": 5,
  "email_notifications": false
}
```

### Códigos de Resposta Notificações

**Sucesso:**
- `200 OK` - Operação bem-sucedida

**Erros do Cliente:**
- `400 Bad Request` - Dados inválidos ou empresa não associada
- `401 Unauthorized` - Token inválido ou ausente
- `403 Forbidden` - Permissão insuficiente (generate-alerts)
- `404 Not Found` - Configurações não encontradas

**Erros do Servidor:**
- `500 Internal Server Error` - Erro interno do servidor

---

## Health Check

### GET /health
Retorna status detalhado da API.

**Response (200):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "sprint": "Sprint 8",
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
    "Evolução temporal",
    "Sistema de relatórios",
    "Exportação em múltiplos formatos",
    "Geração em background",
    "Download de arquivos",
    "Sistema de histórico e analytics",
    "Análise de tendências",
    "Métricas de performance",
    "Insights automáticos",
    "Evolução temporal de objetivos"
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
  "sprint": "Sprint 8 - Sistema de Histórico e Analytics"
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
- `410 Gone` - Recurso expirado (relatórios)
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

### Exportação de Relatório Completo
```
POST /api/reports/export
{
  "name": "Relatório Completo Q1",
  "report_type": "COMPLETE",
  "format": "PDF",
  "filters": {
    "cycle_id": "uuid",
    "include_key_results": true,
    "include_checkins": true
  },
  "include_charts": true
}
```

### Exportação de Objetivos Filtrados
```
POST /api/reports/export
{
  "name": "Objetivos Em Risco",
  "report_type": "OBJECTIVES",
  "format": "EXCEL",
  "filters": {
    "status": ["AT_RISK", "BEHIND"],
    "owner_id": "uuid",
    "include_key_results": true
  }
}
```
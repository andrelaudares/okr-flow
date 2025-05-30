
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
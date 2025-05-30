
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
  "owner_id": "uuid"
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
  "status": "ON_TRACK"
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


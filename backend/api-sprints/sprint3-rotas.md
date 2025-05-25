

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



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

## 6. Sistema de Ciclos Globais (`/api/global-cycles`) - Sprint 3

### `GET /api/global-cycles/global`
Lista todos os ciclos globais disponíveis para um ano específico. Requer autenticação.

- **Endpoint:** `/api/global-cycles/global`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Query Parameters:**
- `year` (integer, opcional): Ano dos ciclos (padrão: ano atual)

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/global-cycles/global?year=2025" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Lista de ciclos globais com status calculado.
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "code": "Q1",
    "name": "1º Trimestre 2025",
    "display_name": "1º Trimestre",
    "type": "TRIMESTRE",
    "year": 2025,
    "start_month": 1,
    "start_day": 1,
    "end_month": 3,
    "end_day": 31,
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "is_current": false,
    "created_at": "2024-10-27T10:00:00+00:00",
    "days_total": 90,
    "days_elapsed": 0,
    "days_remaining": 90,
    "progress_percentage": 0.0,
    "is_future": true,
    "is_past": false
  }
]
```
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `GET /api/global-cycles/current`
Retorna o ciclo global que está ativo no momento atual. Requer autenticação.

- **Endpoint:** `/api/global-cycles/current`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/global-cycles/current" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Ciclo global atual com status.
```json
{
  "id": "b2c3d4e5-f6g7-8901-2345-678901bcdefg",
  "code": "Q4",
  "name": "4º Trimestre 2024",
  "display_name": "4º Trimestre",
  "type": "TRIMESTRE",
  "year": 2024,
  "start_month": 10,
  "start_day": 1,
  "end_month": 12,
  "end_day": 31,
  "start_date": "2024-10-01",
  "end_date": "2024-12-31",
  "is_current": true,
  "created_at": "2024-10-27T10:00:00+00:00",
  "days_total": 92,
  "days_elapsed": 45,
  "days_remaining": 47,
  "progress_percentage": 48.91,
  "is_future": false,
  "is_past": false
}
```
- `401 Unauthorized`: Token inválido ou ausente.
- `404 Not Found`: Nenhum ciclo global ativo encontrado.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `GET /api/global-cycles/user-preference`
Retorna o ciclo escolhido como preferência pelo usuário. Se não houver preferência, retorna o ciclo atual. Requer autenticação.

- **Endpoint:** `/api/global-cycles/user-preference`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/global-cycles/user-preference" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Ciclo da preferência do usuário com status.
```json
{
  "id": "c3d4e5f6-g7h8-9012-3456-789012cdefgh",
  "code": "S1",
  "name": "1º Semestre 2025",
  "display_name": "1º Semestre",
  "type": "SEMESTRE",
  "year": 2025,
  "start_month": 1,
  "start_day": 1,
  "end_month": 6,
  "end_day": 30,
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "is_current": false,
  "created_at": "2024-10-27T10:00:00+00:00",
  "days_total": 181,
  "days_elapsed": 0,
  "days_remaining": 181,
  "progress_percentage": 0.0,
  "is_future": true,
  "is_past": false
}
```
- `400 Bad Request`: Usuário não possui empresa associada.
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `PUT /api/global-cycles/user-preference`
Atualiza a preferência de ciclo do usuário. Se não existir preferência, cria uma nova. Requer autenticação.

- **Endpoint:** `/api/global-cycles/user-preference`
- **Método:** `PUT`

**Header Parameters:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "global_cycle_code": "S1",
  "year": 2025
}
```

**Códigos de Ciclos Disponíveis:**
- `S1`, `S2`: Semestres
- `Q1`, `Q2`, `Q3`, `Q4`: Trimestres
- `T1`, `T2`, `T3`: Quadrimestres

**Exemplo de Requisição (`curl`):**
```bash
curl -X PUT "http://localhost:8000/api/global-cycles/user-preference" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>" \
-H "Content-Type: application/json" \
-d '{
  "global_cycle_code": "S1",
  "year": 2025
}'
```

**Responses:**
- `200 OK`: Preferência atualizada com sucesso.
```json
{
  "id": "d4e5f6g7-h8i9-0123-4567-890123defghi",
  "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "company_id": "f2713e40-d8ad-4de7-b67a-63fffb90e553",
  "global_cycle_code": "S1",
  "year": 2025,
  "created_at": "2024-10-27T10:00:00+00:00",
  "updated_at": "2024-10-27T15:30:00+00:00"
}
```
- `400 Bad Request`: Dados inválidos ou ciclo não encontrado.
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro interno do servidor.

---

### `GET /api/global-cycles/available-years`
Lista todos os anos para os quais existem ciclos globais. Requer autenticação.

- **Endpoint:** `/api/global-cycles/available-years`
- **Método:** `GET`

**Header Parameters:**
- `Authorization`: `Bearer <token>`

**Exemplo de Requisição (`curl`):**
```bash
curl -X GET "http://localhost:8000/api/global-cycles/available-years" \
-H "Authorization: Bearer <SEU_TOKEN_JWT>"
```

**Responses:**
- `200 OK`: Lista de anos disponíveis.
```json
[2024, 2025, 2026]
```
- `401 Unauthorized`: Token inválido ou ausente.
- `500 Internal Server Error`: Erro interno do servidor.

---

## 7. Migração do Sistema de Ciclos - Sprint 3

### Mudanças Implementadas

1. **Novo Sistema de Ciclos Globais**:
   - Ciclos pré-definidos: Semestres (S1, S2), Trimestres (Q1-Q4), Quadrimestres (T1-T3)
   - Geração automática baseada no ano
   - Preferências individuais por usuário

2. **Compatibilidade com Sistema Legado**:
   - Rota `/api/cycles/active` modificada para usar preferências globais como fallback
   - Mantém funcionamento de ciclos personalizados existentes
   - Transição suave sem quebrar funcionalidades

3. **Estrutura de Banco Atualizada**:
   - Tabela `global_cycles` com ciclos pré-definidos
   - Tabela `user_cycle_preferences` para escolhas individuais
   - Campos calculados automaticamente (datas, progresso, status)

### Benefícios do Novo Sistema

- **Consistência**: Todos usam períodos padronizados
- **Simplicidade**: Não precisa criar/gerenciar ciclos
- **Flexibilidade**: Usuário escolhe o período ideal
- **Automação**: Geração automática de novos anos
- **Compatibilidade**: Funciona junto com sistema legado

### Tipos de Ciclos Disponíveis

| **Tipo** | **Código** | **Duração** | **Período** |
|----------|------------|-------------|-------------|
| Semestre | S1 | 6 meses | Jan-Jun |
| Semestre | S2 | 6 meses | Jul-Dez |
| Trimestre | Q1 | 3 meses | Jan-Mar |
| Trimestre | Q2 | 3 meses | Abr-Jun |
| Trimestre | Q3 | 3 meses | Jul-Set |
| Trimestre | Q4 | 3 meses | Out-Dez |
| Quadrimestre | T1 | 4 meses | Jan-Abr |
| Quadrimestre | T2 | 4 meses | Mai-Ago |
| Quadrimestre | T3 | 4 meses | Set-Dez |

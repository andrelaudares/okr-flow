
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

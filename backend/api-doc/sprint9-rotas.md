

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


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
Retorna dados de progresso geral com tendências baseado no progresso dos objetivos.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `cycle_code` (string, opcional): Código do ciclo específico para análise
- `cycle_year` (integer, opcional): Ano do ciclo específico para análise

**Response (200):**
```json
{
  "current_progress": 68.5,
  "expected_progress": 60.0,
  "variance": 8.5,
  "status_color": "GREEN",
  "trend_direction": "UP",
  "trend_percentage": 2.5,
  "cycle_days_total": 90,
  "cycle_days_elapsed": 68,
  "cycle_days_remaining": 22
}
```

**Detalhes do cálculo:**
- `current_progress`: Média do progresso de todos os objetivos da empresa
- `expected_progress`: Meta de progresso dos objetivos baseada no tempo decorrido do ciclo e número de objetivos:
  - Até 25% do ciclo: meta = 60% do tempo decorrido (mínimo 10%)
  - 25-50% do ciclo: meta = 80% do tempo decorrido (mínimo 20%)
  - 50-75% do ciclo: meta = 85% do tempo decorrido (mínimo 40%)
  - 75-100% do ciclo: meta = 90% do tempo decorrido (mínimo 60%)
  - Máximo de 85% como meta de progresso
  - Se não há ciclo ativo: meta baseada no número de objetivos (70% para ≤3 objetivos, 60% para ≤6 objetivos, 50% para >6 objetivos)
- `variance`: Diferença entre progresso atual e esperado dos objetivos

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
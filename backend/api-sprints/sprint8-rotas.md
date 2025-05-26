

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
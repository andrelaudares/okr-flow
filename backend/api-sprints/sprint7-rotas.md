## Sistema de Relatórios

**✅ Status: Funcional e Testado**
- Relatórios individuais de objetivos funcionando
- Download automático implementado  
- Layout PDF profissional com Key Results detalhados
- Correção de bugs nas colunas do banco de dados

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

**Exemplo para Objetivo Individual:**
```json
{
  "name": "Objetivo - Aumentar Vendas - Janeiro 2024",
  "report_type": "SINGLE_OBJECTIVE",
  "format": "PDF",
  "filters": {
    "objective_id": "uuid-do-objetivo",
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
- `SINGLE_OBJECTIVE`: Relatório detalhado de um objetivo específico com todos os seus Key Results

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

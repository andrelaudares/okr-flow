# Mapeamento Frontend x Sprints Backend - Sistema OKR

Este documento detalha quais **hooks**, **components** e **pages** do frontend atual estão correlacionados com cada sprint do backend, facilitando o desenvolvimento integrado e as modificações necessárias.

---

## Sprint 1: Autenticação e Gestão de Usuários (Semanas 1-2)

### 📄 Pages Relacionadas
- **`Login.tsx`** - Página de login principal
- **`Register.tsx`** - Página de registro de novos usuários
- **`Users.tsx`** - Gestão de usuários da equipe
- **`Profile.tsx`** - Perfil do usuário logado
- **`ResetPassword.tsx`** - Reset de senha
- **`ResetConfirmation.tsx`** - Confirmação de reset

### 🧩 Components Relacionados
- **`auth/`**
  - `login-form.tsx` - Formulário de login
  - `register-form.tsx` - Formulário de registro
- **`users/`**
  - `add-user-form.tsx` - Formulário para adicionar usuários
  - `user-list.tsx` - Lista de usuários da empresa

### 🎣 Hooks Relacionados
- **`use-auth.tsx`** - Gerenciamento de autenticação e sessão
- **`use-users.tsx`** - Gestão de usuários da empresa

### 🔄 Mudanças Necessárias
1. **`use-auth.tsx`**: Integrar com APIs de auth do backend
2. **`register-form.tsx`**: Adicionar lógica de criação automática de empresa
3. **`Users.tsx`**: Implementar hierarquia owner/collaborator
4. **`use-users.tsx`**: Conectar com APIs de gestão de usuários

---

## Sprint 2: Sistema de Empresas (Semanas 3-4) - ⚠️ Times Removidos

**NOTA IMPORTANTE**: A funcionalidade de times foi removida desta sprint. O sistema de colaboradores agora é baseado apenas na estrutura de empresas.

### 📄 Pages Relacionadas
- **Novas páginas necessárias**:
  - `Companies.tsx` - Gestão da empresa (configurações e informações)

### 🧩 Components Relacionados
- **Novos components necessários**:
  - `companies/company-settings.tsx` - Configurações da empresa
  - `companies/company-stats.tsx` - Estatísticas da empresa

### 🎣 Hooks Relacionados
- **Novos hooks necessários**:
  - `use-companies.tsx` - Gestão de empresa

### 🔄 Mudanças Necessárias
1. **`use-auth.tsx`**: Incluir dados de empresa nos dados do usuário logado
2. **Layout**: Adicionar menu para "Configurações da Empresa" (apenas para owners)
3. **`Users.tsx`**: Manter gestão baseada apenas em company_id (sem team_id)
4. **`use-users.tsx`**: Focar na gestão hierárquica baseada em empresa

---

## ✅ Sprint 3: Sistema de Ciclos e Períodos (Semanas 5-6) - BACKEND CONCLUÍDO

**NOTA**: O backend da Sprint 3 está 100% funcional. O frontend precisa ser adaptado para consumir as novas APIs.

### 📄 Pages Relacionadas
- **`Dashboard.tsx`** - Exibição de cards temporais e ciclo ativo
- **Nova página necessária**:
  - `Cycles.tsx` - Gestão de ciclos (apenas para owners/admins)

### 🧩 Components Relacionados
- **`okr/DashboardInfoCards.tsx`** - Cards temporais estáticos
- **Novos components necessários**:
  - `cycles/cycle-list.tsx` - Lista de ciclos
  - `cycles/cycle-form.tsx` - Formulário de ciclo
  - `cycles/cycle-card.tsx` - Card individual do ciclo
  - `cycles/activate-cycle-button.tsx` - Botão de ativação
  - `dashboard/time-cards-config.tsx` - Configuração de cards temporais

### 🎣 Hooks Relacionados
- **Novos hooks necessários**:
  - `use-cycles.tsx` - Gestão de ciclos (CRUD + ativação)
  - `use-time-cards.tsx` - Cards temporais e preferências
  - `use-dashboard-time-cards.tsx` - Cards específicos do dashboard

### 🔄 Mudanças Necessárias
1. **`DashboardInfoCards.tsx`**: Conectar com API `/api/dashboard/time-cards`
2. **`Dashboard.tsx`**: Adicionar configuração de cards temporais
3. **`use-auth.tsx`**: Incluir dados de ciclo ativo no contexto
4. **Layout**: Adicionar menu "Ciclos" para owners/admins
5. **Implementar seletor de ciclo ativo** no header do dashboard

### 🔗 APIs Disponíveis (Backend Pronto)
```typescript
// Ciclos
GET    /api/cycles/               // Lista ciclos com status calculado
POST   /api/cycles/               // Criar ciclo (owners/admins)
PUT    /api/cycles/:id            // Atualizar ciclo (owners/admins)
DELETE /api/cycles/:id            // Deletar ciclo (owners)
GET    /api/cycles/active         // Ciclo ativo atual
POST   /api/cycles/:id/activate   // Ativar ciclo (owners/admins)

// Dashboard
GET    /api/dashboard/time-cards  // Cards temporais + preferências
PUT    /api/dashboard/time-preferences // Configurar preferências
```

### 📊 Dados Disponíveis
- **Cards Temporais**: Trimestre, Quadrimestre, Semestre, Ano
- **Cálculos Automáticos**: Progresso %, dias restantes, dias transcorridos
- **Ciclo Ativo**: Dados completos com status temporal
- **Preferências**: Até 3 cards selecionados por usuário

---

## Sprint 4: Gestão de Objetivos (Semanas 7-8) ✅ BACKEND COMPLETED

### 📄 Pages Relacionadas
- **`Dashboard.tsx`** - Listagem e gestão de objetivos

### 🧩 Components Relacionados
- **`okr/`**
  - `add-objective-dialog.tsx` - Modal para criar objetivos
  - `objective-card.tsx` - Card individual do objetivo
  - `objective-list.tsx` - Lista de objetivos
  - `dashboard/objective-list.tsx` - Lista específica do dashboard
  - `dashboard/dashboard-header.tsx` - Header com filtros

### 🎣 Hooks Relacionados
- **`use-objectives.tsx`** - Gestão básica de objetivos
- **`use-supabase-objectives.tsx`** - Integração com Supabase
- **`use-dashboard-objectives.tsx`** - Objetivos do dashboard
- **`use-objectives-filter.tsx`** - Sistema de filtros

### 🔄 Mudanças Necessárias
1. **`use-supabase-objectives.tsx`**: Substituir por integração com backend
2. **`use-objectives-filter.tsx`**: Conectar filtros com query parameters da API
3. **`add-objective-dialog.tsx`**: Integrar com API de criação
4. **`objective-card.tsx`**: Adicionar funcionalidades de edição/exclusão

### 📡 APIs Disponíveis
- `GET /api/objectives/` - Listar objetivos (com filtros)
- `POST /api/objectives/` - Criar objetivo
- `GET /api/objectives/{id}` - Detalhes do objetivo
- `PUT /api/objectives/{id}` - Atualizar objetivo
- `DELETE /api/objectives/{id}` - Deletar objetivo
- `GET /api/objectives/stats/summary` - Estatísticas

### 🎯 Filtros Disponíveis
- `search` - Busca textual
- `status` - Múltiplos status
- `owner_id` - Por responsável
- `cycle_id` - Por ciclo
- `limit/offset` - Paginação

### 📊 Dados Estruturados
```typescript
interface Objective {
  id: string;
  title: string;
  description?: string;
  owner_id?: string;
  company_id: string;
  cycle_id: string;
  status: 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
  owner_name?: string;
  cycle_name: string;
  key_results_count: number;
}
```

---

## Sprint 5: Sistema de Atividades/Key Results (Semanas 9-10) ✅ BACKEND COMPLETED

### 📄 Pages Relacionadas
- **`Dashboard.tsx`** - Gerenciamento de atividades dentro dos objetivos

### 🧩 Components Relacionados
- **`okr/activity-form/`** (pasta completa)
  - `activity-form.tsx` - Formulário principal de atividades
  - `add-activity-form.tsx` - Formulário para nova atividade
  - `activity-title-field.tsx` - Campo título
  - `activity-assignee-field.tsx` - Campo responsável
  - `activity-status-field.tsx` - Campo status
  - `activity-progress-field.tsx` - Campo progresso
  - `activity-due-date-field.tsx` - Campo data limite
  - `activity-observation-field.tsx` - Campo observações
  - `activity-form-buttons.tsx` - Botões do formulário

### 🎣 Hooks Relacionados
- **`use-dashboard-objectives.tsx`** - Inclui gestão de activities
- **Novos hooks necessários**:
  - `use-activities.tsx` - Gestão específica de atividades
  - `use-activity-checkins.tsx` - Gestão de check-ins

### 🔄 Mudanças Necessárias
1. **Activity forms**: Integrar com APIs de CRUD de atividades
2. **`use-dashboard-objectives.tsx`**: Separar lógica de activities
3. Implementar sistema de check-ins para atualização de progresso
4. Adicionar cálculo automático de progresso do objetivo

### 📡 APIs Disponíveis (Backend Pronto)
```typescript
// Key Results (Atividades)
GET    /api/objectives/{id}/key-results     // Listar Key Results
POST   /api/objectives/{id}/key-results     // Criar Key Result
GET    /api/objectives/key-results/{id}     // Detalhes do Key Result
PUT    /api/objectives/key-results/{id}     // Atualizar Key Result
DELETE /api/objectives/key-results/{id}     // Deletar Key Result

// Check-ins
GET    /api/objectives/key-results/{id}/checkins  // Listar check-ins
POST   /api/objectives/key-results/{id}/checkins  // Criar check-in
PUT    /api/objectives/checkins/{id}              // Atualizar check-in
DELETE /api/objectives/checkins/{id}              // Deletar check-in
```

### 🎯 Filtros Disponíveis
- `search` - Busca textual em título/descrição
- `status` - Múltiplos status (ON_TRACK, AT_RISK, BEHIND, COMPLETED, PLANNED)
- `owner_id` - Por responsável
- `unit` - Por unidade (PERCENTAGE, NUMBER, CURRENCY, BINARY)
- `limit/offset` - Paginação

### 📊 Dados Estruturados
```typescript
interface KeyResult {
  id: string;
  title: string;
  description?: string;
  objective_id: string;
  owner_id?: string;
  target_value: number;
  current_value: number;
  start_value: number;
  unit: 'PERCENTAGE' | 'NUMBER' | 'CURRENCY' | 'BINARY';
  confidence_level?: number; // 0.0-1.0
  status: 'PLANNED' | 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
  progress: number; // 0-100 (calculado automaticamente)
  created_at: string;
  updated_at: string;
  owner_name?: string;
  objective_title: string;
}

interface Checkin {
  id: string;
  key_result_id: string;
  author_id: string;
  checkin_date: string;
  value_at_checkin: number;
  confidence_level_at_checkin?: number;
  notes?: string;
  created_at: string;
  author_name?: string;
}
```

### ⚡ Funcionalidades Automáticas
- ✅ **Cálculo de progresso**: `((current_value - start_value) / (target_value - start_value)) * 100`
- ✅ **Status automático**: COMPLETED (100%), ON_TRACK (≥70%), AT_RISK (≥30%), BEHIND (<30%)
- ✅ **Atualização de objetivo**: Progresso do objetivo = média dos Key Results
- ✅ **Check-ins atualizando KRs**: Valor do check-in atualiza `current_value` automaticamente

### 🔐 Permissões
- ✅ **Ver Key Results**: Todos os usuários da empresa
- ✅ **Criar/Editar/Deletar Key Results**: Todos os usuários da empresa  
- ✅ **Criar Check-ins**: Todos os usuários da empresa
- ✅ **Editar/Deletar Check-ins**: Apenas o autor do check-in

---

## Sprint 6: Dashboard e Cards Variáveis (Semanas 11-12) ✅ BACKEND COMPLETED

### 📄 Pages Relacionadas
- **`Dashboard.tsx`** - Cards dinâmicos do dashboard

### 🧩 Components Relacionados
- **`okr/DashboardInfoCards.tsx`** - Cards variáveis (evolução, objetivos)
- **`okr/dashboard/`**
  - `dashboard-header.tsx` - Header do dashboard
  - `objective-list.tsx` - Lista de objetivos

### 🎣 Hooks Relacionados
- **`use-dashboard-objectives.tsx`** - Dados do dashboard
- **Novos hooks necessários**:
  - `use-dashboard-stats.tsx` - Estatísticas do dashboard
  - `use-dashboard-progress.tsx` - Progresso e tendências
  - `use-dashboard-counts.tsx` - Contadores de objetivos
  - `use-dashboard-evolution.tsx` - Evolução temporal

### 🔄 Mudanças Necessárias
1. **`DashboardInfoCards.tsx`**: Conectar com APIs de métricas reais
2. Implementar indicadores visuais (verde/amarelo/vermelho)
3. Adicionar cálculos de tendência e progresso previsto
4. **`Dashboard.tsx`**: Otimizar carregamento de dados

### 📡 APIs Disponíveis (Backend Pronto)
```typescript
// Dashboard Cards Variáveis
GET    /api/dashboard/stats             // Estatísticas gerais
GET    /api/dashboard/progress          // Progresso com tendências
GET    /api/dashboard/objectives-count  // Contadores detalhados
GET    /api/dashboard/evolution         // Evolução temporal
```

### 📊 Interfaces TypeScript Necessárias
```typescript
// Enums
enum TrendDirection {
  UP = "UP",
  DOWN = "DOWN", 
  STABLE = "STABLE"
}

enum StatusColor {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED"
}

// Estatísticas Gerais
interface DashboardStats {
  total_objectives: number;
  total_key_results: number;
  active_users: number;
  active_cycle_name?: string;
  active_cycle_progress: number;
  company_name: string;
  last_updated: string;
}

// Progresso com Tendências
interface ProgressData {
  current_progress: number;
  expected_progress: number;
  variance: number;
  status_color: StatusColor;
  trend_direction: TrendDirection;
  trend_percentage: number;
  cycle_days_total: number;
  cycle_days_elapsed: number;
  cycle_days_remaining: number;
}

// Contadores de Objetivos
interface ObjectivesCount {
  total: number;
  completed: number;
  on_track: number;
  at_risk: number;
  behind: number;
  planned: number;
  completion_rate: number;
  on_track_rate: number;
}

// Evolução Temporal
interface EvolutionPoint {
  date: string;
  actual_progress: number;
  expected_progress: number;
  objectives_count: number;
}

interface EvolutionData {
  period_start: string;
  period_end: string;
  current_date: string;
  evolution_points: EvolutionPoint[];
  trend_analysis: {
    direction: string;
    average_weekly_growth: number;
    consistency_score: number;
    prediction_next_week: number;
  };
  performance_summary: {
    overall_score: number;
    time_efficiency: number;
    goal_achievement: number;
    team_engagement: number;
  };
}
```

### 🎯 Funcionalidades Disponíveis
- ✅ **Estatísticas em tempo real**: Total de objetivos, KRs, usuários ativos
- ✅ **Progresso com tendências**: Comparação real vs esperado, cores de status
- ✅ **Contadores detalhados**: Distribuição por status, taxas de sucesso
- ✅ **Evolução temporal**: Histórico semanal, análise de tendências, previsões
- ✅ **Integração com ciclos**: Baseado no ciclo ativo da empresa
- ✅ **Dados reais**: Busca direta do banco de dados, não simulados

### 🔐 Permissões
- ✅ **Visualizar cards**: Todos os usuários da empresa
- ✅ **Dados filtrados**: Apenas da empresa do usuário logado
- ✅ **Atualizações**: Em tempo real a cada requisição

---

## Sprint 7: Sistema de Relatórios e Exportação (Semanas 13-14)

### 📄 Pages Relacionadas
- **`Dashboard.tsx`** - Funcionalidade de exportação

### 🧩 Components Relacionados
- **`okr/export-report-button.tsx`** - Botão de exportação
- **Novos components necessários**:
  - `reports/export-dialog.tsx` - Modal de seleção de formato
  - `reports/export-progress.tsx` - Indicador de progresso

### 🎣 Hooks Relacionados
- **Novos hooks necessários**:
  - `use-export.tsx` - Gestão de exportação
  - `use-reports.tsx` - Gestão de relatórios

### 🔄 Mudanças Necessárias
1. **`export-report-button.tsx`**: Substituir mock por integração real
2. Implementar download de arquivos gerados
3. Adicionar notificações de progresso
4. Aplicar filtros ativos na exportação

---

## Sprint 8: Histórico e Analytics (Semanas 15-16)

### 📄 Pages Relacionadas
- **`History.tsx`** - Página de histórico e evolução

### 🧩 Components Relacionados
- **`okr/history/`
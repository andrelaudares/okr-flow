# Frontend Development Guide - Sistema OKR Completo

Este documento serve como **guia definitivo** para o desenvolvimento frontend, mapeando **TODAS** as APIs do backend desenvolvidas com os componentes, hooks e páginas necessários no frontend.

---

## 📊 Status Geral das Sprints Backend

| Sprint | Status | APIs | Funcionalidades |
|--------|--------|------|----------------|
| **Sprint 1** | ✅ **COMPLETO** | 9 APIs | Auth, Usuários, Permissões |
| **Sprint 2** | ✅ **COMPLETO** | 2 APIs | Empresas, Perfil |
| **Sprint 3** | ✅ **COMPLETO** | 8 APIs | Ciclos, Cards Temporais |
| **Sprint 4** | ✅ **COMPLETO** | 6 APIs | Objetivos, Filtros, Stats |
| **Sprint 5** | ✅ **COMPLETO** | 9 APIs | Key Results, Check-ins |
| **Sprint 6** | ✅ **COMPLETO** | 4 APIs | Dashboard Dinâmico |
| **Sprint 7** | ✅ **COMPLETO** | 6 APIs | Relatórios, Exportação |
| **Sprint 8** | ✅ **COMPLETO** | 5 APIs | Analytics, Histórico |
| **Sprint 9** | ✅ **COMPLETO** | 7 APIs | Notificações, Alertas |

**Total: 56 APIs implementadas e testadas** 🚀

---

## 🏗️ Sprint 1: Autenticação e Gestão de Usuários

### 🎯 APIs Disponíveis
```typescript
// Autenticação
POST   /api/auth/register    // Registro owner + empresa
POST   /api/auth/login       // Login
POST   /api/auth/logout      // Logout
POST   /api/auth/refresh     // Refresh token
GET    /api/auth/me          // Dados do usuário logado

// Usuários
GET    /api/users/           // Lista usuários com filtros
POST   /api/users/           // Criar usuário (OWNER/ADMIN)
GET    /api/users/{id}       // Detalhes usuário
PUT    /api/users/{id}       // Atualizar usuário
DELETE /api/users/{id}       // Desativar usuário (OWNER)
```

### 📄 **Pages Necessárias**
- **`src/pages/auth/Login.tsx`** - ✅ Existente, **ADAPTAR**
- **`src/pages/auth/Register.tsx`** - ✅ Existente, **ADAPTAR**  
- **`src/pages/users/Users.tsx`** - ✅ Existente, **ADAPTAR**
- **`src/pages/profile/Profile.tsx`** - ✅ Existente, **ADAPTAR**

### 🧩 **Components Necessários**
```typescript
// Autenticação
src/components/auth/
├── LoginForm.tsx           // ✅ Adaptar para API login
├── RegisterForm.tsx        // ✅ Adaptar - criar empresa automática
├── LogoutButton.tsx        // 🆕 CRIAR - botão logout
└── AuthGuard.tsx          // 🆕 CRIAR - proteção de rotas

// Usuários  
src/components/users/
├── UserList.tsx           // ✅ Adaptar para API /users/
├── UserCard.tsx           // 🆕 CRIAR - card individual usuário
├── AddUserForm.tsx        // ✅ Adaptar para API POST /users/
├── EditUserForm.tsx       // 🆕 CRIAR - edição usuário
├── UserFilters.tsx        // 🆕 CRIAR - filtros busca/role/status
└── UserRoleBadge.tsx     // 🆕 CRIAR - badge role usuário
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/auth/
useAuth.tsx               // ✅ REFATORAR completamente
├── login(credentials)    // Conectar POST /api/auth/login
├── register(data)       // Conectar POST /api/auth/register  
├── logout()             // Conectar POST /api/auth/logout
├── refreshToken()       // Conectar POST /api/auth/refresh
├── getCurrentUser()     // Conectar GET /api/auth/me
└── isAuthenticated      // Estado de autenticação

// src/hooks/users/
useUsers.tsx             // ✅ REFATORAR completamente
├── getUsers(filters)    // Conectar GET /api/users/
├── createUser(data)     // Conectar POST /api/users/
├── updateUser(id, data) // Conectar PUT /api/users/{id}
├── deleteUser(id)       // Conectar DELETE /api/users/{id}
└── getUserById(id)      // Conectar GET /api/users/{id}

useUserFilters.tsx       // 🆕 CRIAR - gerenciar filtros
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/auth.ts
interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'COLLABORATOR';
  is_owner: boolean;
  is_active: boolean;
  company_id: string;
  created_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company_name: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// src/types/users.ts
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'COLLABORATOR';
}

interface UsersListResponse {
  users: User[];
  total: number;
  has_more: boolean;
  filters_applied: {
    search?: string;
    role?: string;
    is_active?: boolean;
    limit: number;
    offset: number;
  };
}
```

---

## 🏢 Sprint 2: Sistema de Empresas

### 🎯 APIs Disponíveis
```typescript
GET    /api/companies/profile    // Perfil da empresa
PUT    /api/companies/profile    // Atualizar empresa (OWNER/ADMIN)
```

### 📄 **Pages Necessárias**
- **`src/pages/company/CompanySettings.tsx`** - 🆕 **CRIAR**

### 🧩 **Components Necessários**
```typescript
src/components/company/
├── CompanyProfile.tsx        // 🆕 CRIAR - exibir dados empresa
├── CompanyEditForm.tsx       // 🆕 CRIAR - editar empresa
├── CompanyStats.tsx          // 🆕 CRIAR - estatísticas empresa
└── CompanyInfo.tsx          // 🆕 CRIAR - informações gerais
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/company/
useCompany.tsx               // 🆕 CRIAR
├── getCompanyProfile()      // Conectar GET /api/companies/profile
├── updateCompany(data)      // Conectar PUT /api/companies/profile
└── companyData             // Estado da empresa
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/company.ts
interface Company {
  id: string;
  name: string;
  created_at: string;
  users_count: number;
  active_users_count: number;
}

interface UpdateCompanyData {
  name: string;
}
```

---

## 📅 Sprint 3: Sistema de Ciclos e Períodos

### 🎯 APIs Disponíveis
```typescript
// Ciclos
GET    /api/cycles/              // Lista ciclos com status
POST   /api/cycles/              // Criar ciclo (OWNER/ADMIN)
GET    /api/cycles/active        // Ciclo ativo
PUT    /api/cycles/{id}          // Atualizar ciclo
POST   /api/cycles/{id}/activate // Ativar ciclo
DELETE /api/cycles/{id}          // Deletar ciclo

// Dashboard Temporal
GET    /api/dashboard/time-cards      // Cards temporais
PUT    /api/dashboard/time-preferences // Preferências usuário
```

### 📄 **Pages Necessárias**
- **`src/pages/cycles/Cycles.tsx`** - 🆕 **CRIAR**
- **`src/pages/dashboard/Dashboard.tsx`** - ✅ Existente, **ADAPTAR cards temporais**

### 🧩 **Components Necessários**
```typescript
// Ciclos
src/components/cycles/
├── CycleList.tsx           // 🆕 CRIAR - lista ciclos
├── CycleCard.tsx           // 🆕 CRIAR - card individual
├── CycleForm.tsx           // 🆕 CRIAR - form criar/editar
├── CycleActivateButton.tsx // 🆕 CRIAR - botão ativar
├── CycleStatusBadge.tsx    // 🆕 CRIAR - badge status
└── CycleProgress.tsx       // 🆕 CRIAR - barra progresso

// Dashboard Temporal
src/components/dashboard/
├── TimeCardsContainer.tsx  // ✅ ADAPTAR DashboardInfoCards
├── TimeCard.tsx           // 🆕 CRIAR - card temporal individual
├── TimeCardsConfig.tsx    // 🆕 CRIAR - configuração cards
└── ActiveCycleHeader.tsx  // 🆕 CRIAR - header ciclo ativo
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/cycles/
useCycles.tsx              // 🆕 CRIAR
├── getCycles()            // Conectar GET /api/cycles/
├── createCycle(data)      // Conectar POST /api/cycles/
├── updateCycle(id, data)  // Conectar PUT /api/cycles/{id}
├── deleteCycle(id)        // Conectar DELETE /api/cycles/{id}
├── activateCycle(id)      // Conectar POST /api/cycles/{id}/activate
└── getActiveCycle()       // Conectar GET /api/cycles/active

// src/hooks/dashboard/
useTimeCards.tsx           // 🆕 CRIAR
├── getTimeCards()         // Conectar GET /api/dashboard/time-cards
├── updatePreferences(cards) // Conectar PUT /api/dashboard/time-preferences
└── selectedCards          // Estado cards selecionados
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/cycles.ts
interface Cycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  company_id: string;
  is_active: boolean;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

interface CreateCycleData {
  name: string;
  start_date: string;
  end_date: string;
}

// src/types/time-cards.ts
interface TimeCard {
  type: 'TRIMESTRE' | 'QUADRIMESTRE' | 'SEMESTRE' | 'ANO';
  title: string;
  period: string;
  progress_percentage: number;
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  start_date: string;
  end_date: string;
}

interface TimeCardsResponse {
  time_cards: TimeCard[];
  user_preferences: {
    selected_cards: string[];
  };
  active_cycle?: Cycle;
}
```

---

## 🎯 Sprint 4: Gestão de Objetivos

### 🎯 APIs Disponíveis
```typescript
GET    /api/objectives/           // Lista objetivos com filtros
POST   /api/objectives/           // Criar objetivo
GET    /api/objectives/{id}       // Detalhes objetivo
PUT    /api/objectives/{id}       // Atualizar objetivo
DELETE /api/objectives/{id}       // Deletar objetivo
GET    /api/objectives/stats/summary // Estatísticas objetivos
```

### 📄 **Pages Necessárias**
- **`src/pages/dashboard/Dashboard.tsx`** - ✅ Existente, **ADAPTAR completamente**

### 🧩 **Components Necessários**
```typescript
src/components/objectives/
├── ObjectiveList.tsx        // ✅ ADAPTAR para API
├── ObjectiveCard.tsx        // ✅ ADAPTAR para dados reais
├── ObjectiveForm.tsx        // 🆕 CRIAR - form criar/editar
├── ObjectiveFilters.tsx     // 🆕 CRIAR - filtros avançados
├── ObjectiveStats.tsx       // 🆕 CRIAR - estatísticas
├── ObjectiveStatusBadge.tsx // 🆕 CRIAR - badge status
├── ObjectiveProgress.tsx    // 🆕 CRIAR - barra progresso
└── ObjectiveActions.tsx     // 🆕 CRIAR - ações (edit/delete)

src/components/dashboard/
├── DashboardHeader.tsx      // ✅ ADAPTAR filtros reais
├── ObjectivesContainer.tsx  // 🆕 CRIAR - container principal
└── DashboardStats.tsx      // 🆕 CRIAR - estatísticas dashboard
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/objectives/
useObjectives.tsx            // ✅ REFATORAR completamente
├── getObjectives(filters)   // Conectar GET /api/objectives/
├── createObjective(data)    // Conectar POST /api/objectives/
├── updateObjective(id, data) // Conectar PUT /api/objectives/{id}
├── deleteObjective(id)      // Conectar DELETE /api/objectives/{id}
├── getObjectiveById(id)     // Conectar GET /api/objectives/{id}
└── getObjectiveStats()      // Conectar GET /api/objectives/stats/summary

useObjectiveFilters.tsx      // ✅ REFATORAR
├── filters (search, status, owner, cycle)
├── pagination (limit, offset)
├── applyFilters()
└── clearFilters()
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/objectives.ts
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

interface CreateObjectiveData {
  title: string;
  description?: string;
  owner_id?: string;
  cycle_id?: string; // Opcional - usa ciclo ativo
}

interface ObjectiveFilters {
  search?: string;
  status?: string[];
  owner_id?: string;
  cycle_id?: string;
  limit?: number;
  offset?: number;
}

interface ObjectivesResponse {
  objectives: Objective[];
  total: number;
  has_more: boolean;
  filters_applied: ObjectiveFilters;
}

interface ObjectiveStats {
  total_objectives: number;
  by_status: {
    ON_TRACK: number;
    AT_RISK: number;
    BEHIND: number;
    COMPLETED: number;
    PLANNED: number;
  };
  average_progress: number;
  completed_count: number;
  in_progress_count: number;
  planned_count: number;
}
```

---

## 📋 Sprint 5: Sistema de Key Results (Atividades)

### 🎯 APIs Disponíveis
```typescript
// Key Results
GET    /api/objectives/{id}/key-results     // Lista KRs do objetivo
POST   /api/objectives/{id}/key-results     // Criar KR
GET    /api/objectives/key-results/{id}     // Detalhes KR
PUT    /api/objectives/key-results/{id}     // Atualizar KR
DELETE /api/objectives/key-results/{id}     // Deletar KR

// Check-ins
GET    /api/objectives/key-results/{id}/checkins // Lista check-ins
POST   /api/objectives/key-results/{id}/checkins // Criar check-in
PUT    /api/objectives/checkins/{id}              // Atualizar check-in
DELETE /api/objectives/checkins/{id}              // Deletar check-in
```

### 📄 **Pages Necessárias**
- **Integrado ao Dashboard** - Gerenciamento dentro dos objetivos

### 🧩 **Components Necessários**
```typescript
src/components/key-results/
├── KeyResultList.tsx        // 🆕 CRIAR - lista KRs do objetivo
├── KeyResultCard.tsx        // 🆕 CRIAR - card individual KR
├── KeyResultForm.tsx        // ✅ ADAPTAR activity-form existente
├── KeyResultProgress.tsx    // 🆕 CRIAR - progresso visual
├── KeyResultUnitBadge.tsx   // 🆕 CRIAR - badge unidade
├── KeyResultStatusBadge.tsx // 🆕 CRIAR - badge status
└── KeyResultActions.tsx     // 🆕 CRIAR - ações do KR

src/components/checkins/
├── CheckinList.tsx          // 🆕 CRIAR - lista check-ins
├── CheckinCard.tsx          // 🆕 CRIAR - card check-in
├── CheckinForm.tsx          // 🆕 CRIAR - form check-in
├── CheckinHistory.tsx       // 🆕 CRIAR - histórico
└── CheckinButton.tsx        // 🆕 CRIAR - botão rápido

// Adaptar componentes existentes
src/components/okr/activity-form/ // ✅ REFATORAR para Key Results
├── ActivityForm.tsx → KeyResultForm.tsx
├── ActivityTitleField.tsx → KeyResultTitleField.tsx
├── ActivityProgressField.tsx → KeyResultValueField.tsx
└── ... (outros campos)
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/key-results/
useKeyResults.tsx            // 🆕 CRIAR
├── getKeyResults(objectiveId, filters) // GET /api/objectives/{id}/key-results
├── createKeyResult(objectiveId, data)  // POST /api/objectives/{id}/key-results
├── updateKeyResult(id, data)           // PUT /api/objectives/key-results/{id}
├── deleteKeyResult(id)                 // DELETE /api/objectives/key-results/{id}
└── getKeyResultById(id)                // GET /api/objectives/key-results/{id}

useCheckins.tsx              // 🆕 CRIAR
├── getCheckins(keyResultId)    // GET /api/objectives/key-results/{id}/checkins
├── createCheckin(keyResultId, data) // POST /api/objectives/key-results/{id}/checkins
├── updateCheckin(id, data)     // PUT /api/objectives/checkins/{id}
└── deleteCheckin(id)           // DELETE /api/objectives/checkins/{id}
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/key-results.ts
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

interface CreateKeyResultData {
  title: string;
  description?: string;
  target_value: number;
  unit: 'PERCENTAGE' | 'NUMBER' | 'CURRENCY' | 'BINARY';
  start_value?: number;
  current_value?: number;
  confidence_level?: number;
  owner_id?: string;
}

// src/types/checkins.ts
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

interface CreateCheckinData {
  value_at_checkin: number;
  confidence_level_at_checkin?: number;
  notes?: string;
}
```

---

## 📊 Sprint 6: Dashboard Cards Variáveis

### 🎯 APIs Disponíveis
```typescript
GET    /api/dashboard/stats             // Estatísticas gerais
GET    /api/dashboard/progress          // Progresso com tendências
GET    /api/dashboard/objectives-count  // Contadores objetivos
GET    /api/dashboard/evolution         // Evolução temporal
```

### 📄 **Pages Necessárias**
- **`src/pages/dashboard/Dashboard.tsx`** - ✅ Existente, **ADAPTAR cards dinâmicos**

### 🧩 **Components Necessários**
```typescript
src/components/dashboard/
├── DashboardStatsCards.tsx    // ✅ ADAPTAR DashboardInfoCards
├── StatsCard.tsx              // 🆕 CRIAR - card estatística individual
├── ProgressCard.tsx           // 🆕 CRIAR - card progresso com tendência
├── ObjectivesCountCard.tsx    // 🆕 CRIAR - card contadores
├── EvolutionCard.tsx          // 🆕 CRIAR - card evolução temporal
├── TrendIndicator.tsx         // 🆕 CRIAR - indicador tendência
├── StatusColorBadge.tsx       // 🆕 CRIAR - badge cor status
└── ProgressBar.tsx           // 🆕 CRIAR - barra progresso avançada
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/dashboard/
useDashboardStats.tsx        // 🆕 CRIAR
├── getStats()               // Conectar GET /api/dashboard/stats
├── getProgress()            // Conectar GET /api/dashboard/progress
├── getObjectivesCount()     // Conectar GET /api/dashboard/objectives-count
├── getEvolution()           // Conectar GET /api/dashboard/evolution
└── dashboardData           // Estado consolidado

useDashboardRefresh.tsx      // 🆕 CRIAR - auto-refresh
└── refreshInterval()        // Atualização automática
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/dashboard.ts
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

interface DashboardStats {
  total_objectives: number;
  total_key_results: number;
  active_users: number;
  active_cycle_name?: string;
  active_cycle_progress: number;
  company_name: string;
  last_updated: string;
}

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

---

## 📄 Sprint 7: Sistema de Relatórios e Exportação

### 🎯 APIs Disponíveis
```typescript
GET    /api/reports/formats          // Formatos disponíveis
POST   /api/reports/export           // Gerar relatório
GET    /api/reports/{id}/status      // Status do relatório
GET    /api/reports/{id}/download    // Download arquivo
GET    /api/reports/                 // Lista relatórios
DELETE /api/reports/{id}             // Deletar relatório
```

### 📄 **Pages Necessárias**
- **`src/pages/reports/Reports.tsx`** - 🆕 **CRIAR**
- **Integração no Dashboard** - Botão exportar

### 🧩 **Components Necessários**
```typescript
src/components/reports/
├── ExportDialog.tsx         // 🆕 CRIAR - modal exportação
├── ExportButton.tsx         // ✅ ADAPTAR existente
├── ReportsList.tsx          // 🆕 CRIAR - lista relatórios
├── ReportCard.tsx           // 🆕 CRIAR - card relatório
├── ReportProgress.tsx       // 🆕 CRIAR - progresso geração
├── ReportFilters.tsx        // 🆕 CRIAR - filtros exportação
├── DownloadButton.tsx       // 🆕 CRIAR - botão download
└── ReportStatusBadge.tsx    // 🆕 CRIAR - status relatório
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/reports/
useReports.tsx               // 🆕 CRIAR
├── getFormats()             // Conectar GET /api/reports/formats
├── exportReport(config)     // Conectar POST /api/reports/export
├── getReportStatus(id)      // Conectar GET /api/reports/{id}/status
├── downloadReport(id)       // Conectar GET /api/reports/{id}/download
├── getReports()             // Conectar GET /api/reports/
└── deleteReport(id)         // Conectar DELETE /api/reports/{id}

useReportProgress.tsx        // 🆕 CRIAR - acompanhar progresso
└── pollStatus(reportId)     // Polling status relatório
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/reports.ts
interface ExportFormat {
  format: 'CSV' | 'EXCEL' | 'PDF';
  name: string;
  description: string;
  extension: string;
  supports_charts: boolean;
  note?: string;
}

interface ExportConfig {
  name: string;
  report_type: 'DASHBOARD' | 'OBJECTIVES' | 'KEY_RESULTS' | 'COMPLETE';
  format: 'CSV' | 'EXCEL' | 'PDF';
  filters: {
    search?: string;
    status?: string[];
    owner_id?: string;
    cycle_id?: string;
    start_date?: string;
    end_date?: string;
    include_key_results?: boolean;
    include_checkins?: boolean;
  };
  include_charts?: boolean;
}

interface Report {
  id: string;
  name: string;
  report_type: string;
  format: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  file_size?: number;
  download_url?: string;
  records_count?: number;
  generation_started_at: string;
  generation_completed_at?: string;
  expires_at?: string;
}
```

---

## 📈 Sprint 8: Sistema de Histórico e Analytics

### 🎯 APIs Disponíveis
```typescript
GET    /api/analytics/history           // Histórico empresa
GET    /api/analytics/objectives/{id}   // Histórico objetivo
GET    /api/analytics/trends            // Análise tendências
GET    /api/analytics/performance       // Performance empresa
GET    /api/analytics/health            // Health check
```

### 📄 **Pages Necessárias**
- **`src/pages/analytics/Analytics.tsx`** - 🆕 **CRIAR**
- **`src/pages/analytics/ObjectiveHistory.tsx`** - 🆕 **CRIAR**

### 🧩 **Components Necessários**
```typescript
src/components/analytics/
├── HistoryChart.tsx         // 🆕 CRIAR - gráfico histórico
├── TrendsChart.tsx          // 🆕 CRIAR - gráfico tendências
├── PerformanceCards.tsx     // 🆕 CRIAR - cards performance
├── ObjectiveHistoryChart.tsx // 🆕 CRIAR - histórico objetivo
├── InsightsList.tsx         // 🆕 CRIAR - lista insights
├── RecommendationsList.tsx  // 🆕 CRIAR - recomendações
├── AnalyticsFilters.tsx     // 🆕 CRIAR - filtros analytics
├── PeriodSelector.tsx       // 🆕 CRIAR - seletor período
└── HealthScore.tsx         // 🆕 CRIAR - score saúde
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/analytics/
useAnalytics.tsx             // 🆕 CRIAR
├── getHistory(filters)      // Conectar GET /api/analytics/history
├── getObjectiveHistory(id)  // Conectar GET /api/analytics/objectives/{id}
├── getTrends(filters)       // Conectar GET /api/analytics/trends
├── getPerformance(filters)  // Conectar GET /api/analytics/performance
└── getHealthCheck()         // Conectar GET /api/analytics/health

useAnalyticsFilters.tsx      // 🆕 CRIAR - filtros período
├── dateRange
├── granularity
├── includePredicitions
└── includeBenchmarks
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/analytics.ts
interface HistoryData {
  company_id: string;
  company_name: string;
  period_start: string;
  period_end: string;
  current_date: string;
  active_cycle_name?: string;
  granularity: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  evolution_points: EvolutionPoint[];
  trend_analysis: {
    direction: TrendDirection;
    average_weekly_growth: number;
    consistency_score: number;
    prediction_next_week: number;
    volatility_index: number;
  };
  performance_summary: {
    overall_score: number;
    time_efficiency: number;
    goal_achievement: number;
    team_engagement: number;
    completion_rate: number;
  };
  total_objectives_period: number;
  total_key_results_period: number;
  total_checkins_period: number;
}

interface ObjectiveHistoryData {
  objective_id: string;
  objective_title: string;
  objective_status: string;
  owner_name: string;
  cycle_name: string;
  period_start: string;
  period_end: string;
  history_points: Array<{
    date: string;
    progress: number;
    key_results_count: number;
    checkins_count: number;
    notes?: string;
  }>;
  initial_progress: number;
  current_progress: number;
  total_growth: number;
  average_weekly_growth: number;
  key_results_summary: KeyResult[];
}

interface TrendsData {
  analysis_date: string;
  company_id: string;
  period_analyzed: string;
  objectives_trend: TrendMetric;
  progress_trend: TrendMetric;
  completion_trend: TrendMetric;
  engagement_trend: TrendMetric;
  key_results_trend: TrendMetric;
  insights: string[];
  recommendations: string[];
  overall_health_score: number;
  improvement_areas: string[];
}

interface TrendMetric {
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend_direction: TrendDirection;
  is_positive_trend: boolean;
}
```

---

## 🔔 Sprint 9: Sistema de Notificações e Integrações

### 🎯 APIs Disponíveis
```typescript
GET    /api/notifications/              // Lista notificações
POST   /api/notifications/mark-read     // Marcar como lida
GET    /api/notifications/stats         // Estatísticas
GET    /api/notifications/settings      // Configurações usuário
PUT    /api/notifications/settings      // Atualizar configurações
POST   /api/notifications/generate-alerts // Gerar alertas (admin)
GET    /api/notifications/health        // Health check
```

### 📄 **Pages Necessárias**
- **`src/pages/notifications/Notifications.tsx`** - 🆕 **CRIAR**
- **`src/pages/notifications/NotificationSettings.tsx`** - 🆕 **CRIAR**

### 🧩 **Components Necessários**
```typescript
src/components/notifications/
├── NotificationsList.tsx       // 🆕 CRIAR - lista notificações
├── NotificationCard.tsx        // 🆕 CRIAR - card notificação
├── NotificationBell.tsx        // 🆕 CRIAR - sino header
├── NotificationFilters.tsx     // 🆕 CRIAR - filtros
├── NotificationStats.tsx       // 🆕 CRIAR - estatísticas
├── NotificationSettings.tsx    // 🆕 CRIAR - configurações
├── NotificationTypeIcon.tsx    // 🆕 CRIAR - ícone tipo
├── NotificationPriorityBadge.tsx // 🆕 CRIAR - badge prioridade
├── MarkAllReadButton.tsx       // 🆕 CRIAR - marcar todas
└── NotificationDropdown.tsx    // 🆕 CRIAR - dropdown header
```

### 🎣 **Hooks Necessários**
```typescript
// src/hooks/notifications/
useNotifications.tsx            // 🆕 CRIAR
├── getNotifications(filters)   // Conectar GET /api/notifications/
├── markAsRead(ids)             // Conectar POST /api/notifications/mark-read
├── getStats()                  // Conectar GET /api/notifications/stats
├── unreadCount                 // Contador não lidas
└── realTimeUpdates             // Atualizações tempo real

useNotificationSettings.tsx     // 🆕 CRIAR
├── getSettings()               // Conectar GET /api/notifications/settings
├── updateSettings(data)        // Conectar PUT /api/notifications/settings
└── settings                    // Estado configurações

useNotificationFilters.tsx      // 🆕 CRIAR - filtros avançados
├── type, priority, isRead
├── dateRange
└── pagination
```

### 🔄 **Interfaces TypeScript**
```typescript
// src/types/notifications.ts
enum NotificationType {
  CHECKIN_PENDING = "CHECKIN_PENDING",
  OBJECTIVE_BEHIND = "OBJECTIVE_BEHIND",
  CYCLE_ENDING = "CYCLE_ENDING",
  TARGET_ACHIEVED = "TARGET_ACHIEVED"
}

enum NotificationPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

interface Notification {
  id: string;
  user_id: string;
  company_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  priority: NotificationPriority;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

interface NotificationSettings {
  id: string;
  user_id: string;
  company_id: string;
  checkin_pending_enabled: boolean;
  checkin_pending_days: number;
  objective_behind_enabled: boolean;
  objective_behind_threshold: number;
  cycle_ending_enabled: boolean;
  cycle_ending_days: number;
  target_achieved_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_count: number;
}

interface NotificationFilters {
  type?: NotificationType[];
  is_read?: boolean;
  priority?: NotificationPriority[];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
```

---

## 🚀 Plano de Implementação Frontend

### **Fase 1: Infraestrutura Base (Semana 1)**
1. **Configurar Axios/API Client**
2. **Refatorar sistema de autenticação**
3. **Configurar roteamento protegido**
4. **Configurar Context/Estado global**

### **Fase 2: Sprint 1-2 (Semana 2)**
1. **Auth + Usuários + Empresas**
2. **Login/Register funcionais**
3. **Gestão de usuários**
4. **Perfil da empresa**

### **Fase 3: Sprint 3-4 (Semana 3)**
1. **Ciclos + Objetivos**
2. **Dashboard básico funcionando**
3. **Cards temporais dinâmicos**
4. **CRUD de objetivos completo**

### **Fase 4: Sprint 5-6 (Semana 4)**
1. **Key Results + Dashboard avançado**
2. **Sistema de check-ins**
3. **Cards dinâmicos do dashboard**
4. **Métricas em tempo real**

### **Fase 5: Sprint 7-9 (Semana 5)**
1. **Relatórios + Analytics + Notificações**
2. **Exportação de dados**
3. **Análise histórica**
4. **Sistema de alertas**

---

## 🔄 Componentes a Serem Removidos/Refatorados

### **❌ Remover (Backend integrado)**
- `src/hooks/use-supabase-*` - Substituir por APIs
- Lógicas de simulação de dados
- Mocks e dados estáticos

### **✅ Adaptar (Reutilizar estrutura)**
- Components de UI existentes
- Layout e navegação
- Estilos e design system
- Validações de formulário

### **🆕 Criar do Zero**
- Hooks de integração com APIs
- Gerenciamento de estado real
- Sistema de notificações
- Analytics e relatórios

---

## 🎯 Próximos Passos

1. **✅ VALIDAÇÃO:** Este documento está alinhado com backend?
2. **🔄 SETUP:** Configurar cliente API e interceptors
3. **🚀 START:** Começar pela Fase 1 - Infraestrutura Base

**Todas as 56 APIs estão documentadas e prontas para integração!** 🚀

---

*Este documento serve como **fonte única da verdade** para o desenvolvimento frontend. Todas as interfaces, hooks e componentes listados são necessários para uma integração completa com o backend desenvolvido.* 
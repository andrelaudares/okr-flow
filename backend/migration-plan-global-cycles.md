# Migração para Ciclos Globais - OKR Flow

## Visão Geral da Mudança

**Objetivo:** Transformar ciclos personalizados por empresa em ciclos globais fixos com seleção por usuário.

### Estrutura Atual vs Nova

| **ANTES** | **DEPOIS** |
|-----------|------------|
| Ciclos criados por empresa | Ciclos globais pré-definidos |
| `is_active` por empresa | Preferência individual do usuário |
| Gerenciamento manual | Sistema automático baseado no ano |

## Nova Estrutura de Banco de Dados

### 1. Tabela `global_cycles`
```sql
CREATE TABLE global_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE, -- S1, S2, Q1, Q2, Q3, Q4, T1, T2, T3
    name VARCHAR(100) NOT NULL, -- "1º Semestre 2025"
    display_name VARCHAR(50) NOT NULL, -- "1º Semestre", "1º Trimestre"
    type VARCHAR(20) NOT NULL, -- SEMESTRE, TRIMESTRE, QUADRIMESTRE
    year INTEGER NOT NULL, -- 2025, 2026, etc.
    start_month INTEGER NOT NULL, -- 1-12
    start_day INTEGER NOT NULL, -- 1-31
    end_month INTEGER NOT NULL, -- 1-12
    end_day INTEGER NOT NULL, -- 1-31
    start_date DATE GENERATED ALWAYS AS (
        make_date(year, start_month, start_day)
    ) STORED,
    end_date DATE GENERATED ALWAYS AS (
        make_date(year, end_month, end_day)
    ) STORED,
    is_current BOOLEAN GENERATED ALWAYS AS (
        CURRENT_DATE >= make_date(year, start_month, start_day) AND 
        CURRENT_DATE <= make_date(year, end_month, end_day)
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_global_cycles_year ON global_cycles(year);
CREATE INDEX idx_global_cycles_current ON global_cycles(is_current);
CREATE INDEX idx_global_cycles_type ON global_cycles(type);
```

### 2. Tabela `user_cycle_preferences`
```sql
CREATE TABLE user_cycle_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    global_cycle_code VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir uma preferência por usuário/empresa
    UNIQUE(user_id, company_id),
    
    -- Foreign key para global_cycles
    FOREIGN KEY (global_cycle_code, year) REFERENCES global_cycles(code, year)
);

-- Índices
CREATE INDEX idx_user_cycle_preferences_user ON user_cycle_preferences(user_id);
CREATE INDEX idx_user_cycle_preferences_company ON user_cycle_preferences(company_id);
```

## Dados Iniciais dos Ciclos Globais

### Templates de Ciclos por Tipo

#### Semestres (S1, S2)
- **S1**: Janeiro a Junho (01/01 - 30/06)
- **S2**: Julho a Dezembro (01/07 - 31/12)

#### Trimestres (Q1, Q2, Q3, Q4)
- **Q1**: Janeiro a Março (01/01 - 31/03)
- **Q2**: Abril a Junho (01/04 - 30/06)
- **Q3**: Julho a Setembro (01/07 - 30/09)
- **Q4**: Outubro a Dezembro (01/10 - 31/12)

#### Quadrimestres (T1, T2, T3)
- **T1**: Janeiro a Abril (01/01 - 30/04)
- **T2**: Maio a Agosto (01/05 - 31/08)
- **T3**: Setembro a Dezembro (01/09 - 31/12)

### Script de Populate Automático
```sql
-- Função para gerar ciclos de múltiplos anos
CREATE OR REPLACE FUNCTION generate_global_cycles(start_year INTEGER, end_year INTEGER)
RETURNS VOID AS $$
DECLARE
    current_year INTEGER;
BEGIN
    FOR current_year IN start_year..end_year LOOP
        -- Semestres
        INSERT INTO global_cycles (code, name, display_name, type, year, start_month, start_day, end_month, end_day) VALUES
        ('S1', '1º Semestre ' || current_year, '1º Semestre', 'SEMESTRE', current_year, 1, 1, 6, 30),
        ('S2', '2º Semestre ' || current_year, '2º Semestre', 'SEMESTRE', current_year, 7, 1, 12, 31);
        
        -- Trimestres
        INSERT INTO global_cycles (code, name, display_name, type, year, start_month, start_day, end_month, end_day) VALUES
        ('Q1', '1º Trimestre ' || current_year, '1º Trimestre', 'TRIMESTRE', current_year, 1, 1, 3, 31),
        ('Q2', '2º Trimestre ' || current_year, '2º Trimestre', 'TRIMESTRE', current_year, 4, 1, 6, 30),
        ('Q3', '3º Trimestre ' || current_year, '3º Trimestre', 'TRIMESTRE', current_year, 7, 1, 9, 30),
        ('Q4', '4º Trimestre ' || current_year, '4º Trimestre', 'TRIMESTRE', current_year, 10, 1, 12, 31);
        
        -- Quadrimestres
        INSERT INTO global_cycles (code, name, display_name, type, year, start_month, start_day, end_month, end_day) VALUES
        ('T1', '1º Quadrimestre ' || current_year, '1º Quadrimestre', 'QUADRIMESTRE', current_year, 1, 1, 4, 30),
        ('T2', '2º Quadrimestre ' || current_year, '2º Quadrimestre', 'QUADRIMESTRE', current_year, 5, 1, 8, 31),
        ('T3', '3º Quadrimestre ' || current_year, '3º Quadrimestre', 'QUADRIMESTRE', current_year, 9, 1, 12, 31);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Gerar ciclos para 2024-2030
SELECT generate_global_cycles(2024, 2030);
```

## Migração dos Dados Existentes

### Estratégia de Migração

1. **Manter tabela atual** como `cycles_legacy`
2. **Criar novas tabelas** com estrutura global
3. **Migrar objetivos** para usar ciclos globais
4. **Definir preferências padrão** para usuários existentes

### Script de Migração
```sql
-- 1. Renomear tabela atual
ALTER TABLE cycles RENAME TO cycles_legacy;

-- 2. Criar novas tabelas (já mostradas acima)

-- 3. Mapear ciclos existentes para globais
WITH cycle_mapping AS (
    SELECT 
        cl.id as legacy_id,
        cl.company_id,
        CASE 
            WHEN EXTRACT(MONTH FROM cl.start_date) = 1 AND EXTRACT(MONTH FROM cl.end_date) = 3 THEN 'Q1'
            WHEN EXTRACT(MONTH FROM cl.start_date) = 4 AND EXTRACT(MONTH FROM cl.end_date) = 6 THEN 'Q2'
            WHEN EXTRACT(MONTH FROM cl.start_date) = 7 AND EXTRACT(MONTH FROM cl.end_date) = 9 THEN 'Q3'
            WHEN EXTRACT(MONTH FROM cl.start_date) = 10 AND EXTRACT(MONTH FROM cl.end_date) = 12 THEN 'Q4'
            WHEN EXTRACT(MONTH FROM cl.start_date) = 1 AND EXTRACT(MONTH FROM cl.end_date) = 6 THEN 'S1'
            WHEN EXTRACT(MONTH FROM cl.start_date) = 7 AND EXTRACT(MONTH FROM cl.end_date) = 12 THEN 'S2'
            ELSE 'Q1' -- Default fallback
        END as global_code,
        EXTRACT(YEAR FROM cl.start_date) as year
    FROM cycles_legacy cl
    WHERE cl.is_active = true
)
-- 4. Criar preferências para usuários com ciclos ativos
INSERT INTO user_cycle_preferences (user_id, company_id, global_cycle_code, year)
SELECT DISTINCT 
    u.id as user_id,
    u.company_id,
    cm.global_code,
    cm.year
FROM users u
JOIN cycle_mapping cm ON u.company_id = cm.company_id
WHERE u.is_active = true;

-- 5. Atualizar objetivos para referenciar ciclos globais
-- Criar nova coluna temporary
ALTER TABLE objectives ADD COLUMN global_cycle_id UUID;

-- Mapear objetivos para novos ciclos
UPDATE objectives o
SET global_cycle_id = gc.id
FROM cycles_legacy cl, global_cycles gc
WHERE o.cycle_id = cl.id
AND gc.code = CASE 
    WHEN EXTRACT(MONTH FROM cl.start_date) = 1 AND EXTRACT(MONTH FROM cl.end_date) = 3 THEN 'Q1'
    WHEN EXTRACT(MONTH FROM cl.start_date) = 4 AND EXTRACT(MONTH FROM cl.end_date) = 6 THEN 'Q2'
    WHEN EXTRACT(MONTH FROM cl.start_date) = 7 AND EXTRACT(MONTH FROM cl.end_date) = 9 THEN 'Q3'
    WHEN EXTRACT(MONTH FROM cl.start_date) = 10 AND EXTRACT(MONTH FROM cl.end_date) = 12 THEN 'Q4'
    WHEN EXTRACT(MONTH FROM cl.start_date) = 1 AND EXTRACT(MONTH FROM cl.end_date) = 6 THEN 'S1'
    WHEN EXTRACT(MONTH FROM cl.start_date) = 7 AND EXTRACT(MONTH FROM cl.end_date) = 12 THEN 'S2'
    ELSE 'Q1'
END
AND gc.year = EXTRACT(YEAR FROM cl.start_date);

-- Remover constraint antiga e recriar com nova referência
ALTER TABLE objectives DROP CONSTRAINT IF EXISTS objectives_cycle_id_fkey;
ALTER TABLE objectives DROP COLUMN cycle_id;
ALTER TABLE objectives RENAME COLUMN global_cycle_id TO cycle_id;
ALTER TABLE objectives ADD CONSTRAINT objectives_cycle_id_fkey 
    FOREIGN KEY (cycle_id) REFERENCES global_cycles(id);
```

## Impactos na API

### Novas Rotas Necessárias

1. **`GET /api/cycles/global`** - Lista ciclos globais disponíveis
2. **`GET /api/cycles/user-preference`** - Preferência atual do usuário
3. **`PUT /api/cycles/user-preference`** - Atualizar preferência do usuário
4. **`GET /api/cycles/current`** - Ciclo atual baseado na data
5. **`POST /api/admin/generate-cycles`** - Gerar ciclos para novos anos

### Rotas a Modificar/Remover

- **`POST /api/cycles/`** - Remover (não criar mais ciclos custom)
- **`PUT /api/cycles/{cycle_id}`** - Remover (não editar ciclos globais)
- **`DELETE /api/cycles/{cycle_id}`** - Remover
- **`GET /api/cycles/active`** - Modificar para usar preferência do usuário

## Novos Models

### Backend Models
```python
# models/global_cycle.py
class GlobalCycle(BaseModel):
    id: UUID
    code: str
    name: str
    display_name: str
    type: str
    year: int
    start_date: date
    end_date: date
    is_current: bool

class UserCyclePreference(BaseModel):
    id: UUID
    user_id: UUID
    company_id: UUID
    global_cycle_code: str
    year: int
    created_at: datetime
    updated_at: datetime

class CyclePreferenceUpdate(BaseModel):
    global_cycle_code: str
    year: Optional[int] = None
```

### Frontend Types
```typescript
interface GlobalCycle {
  id: string;
  code: string;
  name: string;
  display_name: string;
  type: 'SEMESTRE' | 'TRIMESTRE' | 'QUADRIMESTRE';
  year: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  days_total?: number;
  days_elapsed?: number;
  days_remaining?: number;
  progress_percentage?: number;
}

interface UserCyclePreference {
  id: string;
  user_id: string;
  company_id: string;
  global_cycle_code: string;
  year: number;
  created_at: string;
  updated_at: string;
}
```

## Cronograma de Implementação

### Fase 1: Preparação (Backend)
1. ✅ Criar models para ciclos globais
2. ✅ Criar tabelas no banco
3. ✅ Popular ciclos globais
4. ✅ Criar rotas da nova API

### Fase 2: Migração
1. ✅ Script de migração dos dados
2. ✅ Testes da migração
3. ✅ Backup e execução

### Fase 3: Frontend
1. ✅ Atualizar tipos TypeScript
2. ✅ Modificar hooks de ciclos
3. ✅ Atualizar página Cycles.tsx
4. ✅ Atualizar dashboard

### Fase 4: Limpeza
1. ✅ Remover código legacy
2. ✅ Atualizar documentação
3. ✅ Testes finais

## Benefícios da Nova Estrutura

### 1. Consistência
- Todos usam os mesmos períodos
- Elimina confusão de datas personalizadas

### 2. Simplicidade
- Não precisa criar/gerenciar ciclos
- Sistema automático baseado no ano

### 3. Flexibilidade
- Usuário escolhe o período que faz sentido
- Pode mudar a qualquer momento

### 4. Escalabilidade
- Geração automática de novos anos
- Manutenção mínima

## Riscos e Mitigações

### Riscos
1. **Perda de dados** na migração
2. **Quebra de funcionalidade** durante transição
3. **Confusão de usuários** com nova interface

### Mitigações
1. **Backup completo** antes da migração
2. **Rollback plan** preparado
3. **Testes extensivos** em ambiente de staging
4. **Documentação clara** para usuários

## Próximos Passos Imediatos

1. **Validar estrutura** com stakeholder
2. **Criar ambiente de teste** 
3. **Implementar backend** primeiro
4. **Executar migração em staging**
5. **Atualizar frontend**
6. **Deploy gradual** 
#!/usr/bin/env python3
"""
Script para criar as tabelas dos ciclos globais
"""
import sys
import os
sys.path.append('.')

from app.utils.supabase import supabase_admin

def create_tables():
    """Criar tabelas de ciclos globais"""
    
    # SQL para criar tabela global_cycles
    create_global_cycles = """
    CREATE TABLE IF NOT EXISTS global_cycles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        display_name VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL,
        year INTEGER NOT NULL,
        start_month INTEGER NOT NULL,
        start_day INTEGER NOT NULL,
        end_month INTEGER NOT NULL,
        end_day INTEGER NOT NULL,
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(code, year)
    );
    """
    
    # SQL para criar tabela user_cycle_preferences
    create_preferences = """
    CREATE TABLE IF NOT EXISTS user_cycle_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        global_cycle_code VARCHAR(10) NOT NULL,
        year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, company_id)
    );
    """
    
    # Criar índices
    create_indexes = """
    CREATE INDEX IF NOT EXISTS idx_global_cycles_year ON global_cycles(year);
    CREATE INDEX IF NOT EXISTS idx_global_cycles_current ON global_cycles(is_current);
    CREATE INDEX IF NOT EXISTS idx_global_cycles_type ON global_cycles(type);
    CREATE INDEX IF NOT EXISTS idx_user_cycle_preferences_user ON user_cycle_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_cycle_preferences_company ON user_cycle_preferences(company_id);
    """
    
    try:
        print("🔧 Criando tabela global_cycles...")
        # Executar via query direta
        supabase_admin.query(create_global_cycles).execute()
        print("✅ Tabela global_cycles criada!")
        
        print("🔧 Criando tabela user_cycle_preferences...")
        supabase_admin.query(create_preferences).execute()
        print("✅ Tabela user_cycle_preferences criada!")
        
        print("🔧 Criando índices...")
        supabase_admin.query(create_indexes).execute()
        print("✅ Índices criados!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def populate_cycles():
    """Popular ciclos globais para 2024-2026"""
    
    cycles_data = []
    
    for year in range(2024, 2027):  # 2024, 2025, 2026
        # Semestres
        cycles_data.extend([
            {
                'code': 'S1', 'name': f'1º Semestre {year}', 'display_name': '1º Semestre',
                'type': 'SEMESTRE', 'year': year, 'start_month': 1, 'start_day': 1,
                'end_month': 6, 'end_day': 30
            },
            {
                'code': 'S2', 'name': f'2º Semestre {year}', 'display_name': '2º Semestre',
                'type': 'SEMESTRE', 'year': year, 'start_month': 7, 'start_day': 1,
                'end_month': 12, 'end_day': 31
            }
        ])
        
        # Trimestres
        cycles_data.extend([
            {
                'code': 'Q1', 'name': f'1º Trimestre {year}', 'display_name': '1º Trimestre',
                'type': 'TRIMESTRE', 'year': year, 'start_month': 1, 'start_day': 1,
                'end_month': 3, 'end_day': 31
            },
            {
                'code': 'Q2', 'name': f'2º Trimestre {year}', 'display_name': '2º Trimestre',
                'type': 'TRIMESTRE', 'year': year, 'start_month': 4, 'start_day': 1,
                'end_month': 6, 'end_day': 30
            },
            {
                'code': 'Q3', 'name': f'3º Trimestre {year}', 'display_name': '3º Trimestre',
                'type': 'TRIMESTRE', 'year': year, 'start_month': 7, 'start_day': 1,
                'end_month': 9, 'end_day': 30
            },
            {
                'code': 'Q4', 'name': f'4º Trimestre {year}', 'display_name': '4º Trimestre',
                'type': 'TRIMESTRE', 'year': year, 'start_month': 10, 'start_day': 1,
                'end_month': 12, 'end_day': 31
            }
        ])
        
        # Quadrimestres
        cycles_data.extend([
            {
                'code': 'T1', 'name': f'1º Quadrimestre {year}', 'display_name': '1º Quadrimestre',
                'type': 'QUADRIMESTRE', 'year': year, 'start_month': 1, 'start_day': 1,
                'end_month': 4, 'end_day': 30
            },
            {
                'code': 'T2', 'name': f'2º Quadrimestre {year}', 'display_name': '2º Quadrimestre',
                'type': 'QUADRIMESTRE', 'year': year, 'start_month': 5, 'start_day': 1,
                'end_month': 8, 'end_day': 31
            },
            {
                'code': 'T3', 'name': f'3º Quadrimestre {year}', 'display_name': '3º Quadrimestre',
                'type': 'QUADRIMESTRE', 'year': year, 'start_month': 9, 'start_day': 1,
                'end_month': 12, 'end_day': 31
            }
        ])
    
    try:
        print("📅 Populando ciclos globais...")
        response = supabase_admin.from_('global_cycles').insert(cycles_data).execute()
        print(f"✅ {len(cycles_data)} ciclos globais criados!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao popular ciclos: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando criação das tabelas de ciclos globais...")
    
    if create_tables():
        print("\n📦 Tabelas criadas com sucesso!")
        
        if populate_cycles():
            print("\n🎉 Setup completo! Sistema de ciclos globais pronto.")
        else:
            print("\n⚠️ Tabelas criadas, mas falha ao popular dados.")
    else:
        print("\n❌ Falha na criação das tabelas.") 
#!/usr/bin/env python3
"""
Script de inicialização otimizado do servidor OKR Backend
Uso: python start_server.py [--port PORT] [--host HOST] [--reload] [--workers WORKERS]
"""

import argparse
import sys
import os
import uvicorn
from pathlib import Path

# Adicionar o diretório do projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 🔧 CARREGAR ARQUIVO .env ANTES DE VERIFICAR VARIÁVEIS
try:
    from app.core.config import *  # Isso carrega o load_dotenv()
    print("✅ Arquivo .env carregado com sucesso!")
except Exception as e:
    print(f"⚠️  Erro ao carregar .env: {e}")
    # Tentar carregar diretamente como fallback
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Arquivo .env carregado via fallback!")
    except Exception as fallback_error:
        print(f"❌ Erro no fallback: {fallback_error}")

def check_environment():
    """Verificar se as variáveis de ambiente estão configuradas"""
    required_vars = ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_SERVICE_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("⚠️  AVISO: As seguintes variáveis de ambiente não estão configuradas:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n💡 Crie um arquivo .env no diretório backend/ com essas variáveis.")
        print("   O servidor pode não funcionar corretamente sem elas.\n")
        return False
    else:
        print("✅ Todas as variáveis de ambiente necessárias estão configuradas.")
        return True

def get_server_config(args):
    """Configurações otimizadas do servidor baseadas no ambiente"""
    
    # Configurações base
    config = {
        "app": "app.main:app",
        "host": args.host,
        "port": args.port,
        "reload": args.reload,
        "access_log": True,
        "log_level": "info",
    }
    
    # Verificar se está em produção
    is_production = os.getenv("ENVIRONMENT") == "production"
    
    if is_production:
        print("🏭 Modo PRODUÇÃO detectado")
        config.update({
            "workers": args.workers if args.workers > 1 else 4,
            "timeout_keep_alive": 65,
            "timeout_graceful_shutdown": 15,
            "reload": False,  # Nunca reload em produção
            "log_level": "warning",
            "access_log": False,
        })
    else:
        print("🛠️  Modo DESENVOLVIMENTO detectado")
        config.update({
            "workers": 1,  # Apenas 1 worker em desenvolvimento
            "timeout_keep_alive": 30,
            "timeout_graceful_shutdown": 5,
            "reload": args.reload,
        })
    
    return config

def main():
    """Função principal otimizada"""
    parser = argparse.ArgumentParser(description='Servidor OKR Backend Otimizado')
    parser.add_argument('--port', type=int, default=8001, help='Porta do servidor (padrão: 8001)')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host do servidor (padrão: 0.0.0.0)')
    parser.add_argument('--reload', action='store_true', help='Ativar reload automático (apenas desenvolvimento)')
    parser.add_argument('--workers', type=int, default=1, help='Número de workers (padrão: 1)')
    
    args = parser.parse_args()
    
    # Verificar ambiente
    env_ok = check_environment()
    
    print("🚀 Iniciando Sistema OKR Backend Otimizado...")
    print(f"   📍 Host: {args.host}")
    print(f"   🔌 Porta: {args.port}")
    print(f"   🔄 Reload: {'Ativado' if args.reload else 'Desativado'}")
    print(f"   📂 Diretório: {project_root}")
    
    if not env_ok:
        print("⚠️  Continuando mesmo com variáveis de ambiente faltando...")
    
    try:
        # Obter configurações otimizadas
        config = get_server_config(args)
        
        print(f"   👥 Workers: {config['workers']}")
        print(f"   ⏱️  Keep-Alive: {config['timeout_keep_alive']}s")
        print(f"   🛑 Shutdown: {config['timeout_graceful_shutdown']}s")
        print()
        
        # Iniciar servidor
        uvicorn.run(**config)
        
    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário.")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")
        sys.exit(1)
    finally:
        print("👋 Servidor finalizado com sucesso.")

if __name__ == "__main__":
    main() 
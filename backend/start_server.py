#!/usr/bin/env python3
"""
Script de inicialização do servidor OKR Backend
Uso: python start_server.py [--port PORT] [--host HOST] [--reload]
"""

import argparse
import sys
import os
import signal
import uvicorn
from pathlib import Path

# Adicionar o diretório do projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def signal_handler(signum, frame):
    """Handler para sinais de interrupção"""
    print(f"\n🛑 Recebido sinal {signum}. Finalizando servidor graciosamente...")
    sys.exit(0)

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
    else:
        print("✅ Todas as variáveis de ambiente necessárias estão configuradas.")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='Servidor OKR Backend')
    parser.add_argument('--port', type=int, default=8000, help='Porta do servidor (padrão: 8000)')
    parser.add_argument('--host', type=str, default='127.0.0.1', help='Host do servidor (padrão: 127.0.0.1)')
    parser.add_argument('--reload', action='store_true', help='Ativar reload automático')
    parser.add_argument('--workers', type=int, default=1, help='Número de workers (padrão: 1)')
    
    args = parser.parse_args()
    
    # Registrar handlers de sinal
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Verificar ambiente
    check_environment()
    
    print("🚀 Iniciando Sistema OKR Backend...")
    print(f"   📍 Host: {args.host}")
    print(f"   🔌 Porta: {args.port}")
    print(f"   🔄 Reload: {'Ativado' if args.reload else 'Desativado'}")
    print(f"   👥 Workers: {args.workers}")
    print(f"   📂 Diretório: {project_root}")
    print()
    
    try:
        # Configurações do uvicorn
        config = {
            "app": "app.main:app",
            "host": args.host,
            "port": args.port,
            "reload": args.reload,
            "workers": args.workers if not args.reload else 1,  # Reload não funciona com múltiplos workers
            "timeout_keep_alive": 30,
            "timeout_graceful_shutdown": 10,
            "access_log": True,
            "log_level": "info",
        }
        
        # Iniciar servidor
        uvicorn.run(**config)
        
    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário.")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")
        sys.exit(1)
    finally:
        print("👋 Servidor finalizado.")

if __name__ == "__main__":
    main() 
#!/usr/bin/env python3
"""
Script de inicialização do servidor OKR Backend
Uso: python start_server.py [--port PORT] [--host HOST] [--reload]
"""

import argparse
import uvicorn
import os

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='Servidor OKR Backend')
    parser.add_argument('--port', type=int, default=8000, help='Porta do servidor (padrão: 8000)')
    parser.add_argument('--host', type=str, default='127.0.0.1', help='Host do servidor (padrão: 127.0.0.1)')
    parser.add_argument('--reload', action='store_true', help='Ativar reload automático')
    
    args = parser.parse_args()
    
    print("🚀 Iniciando Sistema OKR Backend...")
    print(f"   📍 Host: {args.host}")
    print(f"   🔌 Porta: {args.port}")
    print(f"   🔄 Reload: {'Ativado' if args.reload else 'Desativado'}")
    print()
    
    # Iniciar servidor
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload
    )

if __name__ == "__main__":
    main() 
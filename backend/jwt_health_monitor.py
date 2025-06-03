#!/usr/bin/env python3
"""
Script de monitoramento da saúde dos tokens JWT do Supabase
Pode ser executado de forma independente para verificar problemas
"""
import asyncio
import time
import os
import sys
from pathlib import Path

# Adicionar o diretório do app ao path
sys.path.insert(0, str(Path(__file__).parent))

async def monitor_jwt_health():
    """Monitora a saúde dos JWTs e renova quando necessário"""
    from app.utils.supabase import (
        check_connection, 
        get_connectivity_status, 
        refresh_all_connections,
        get_admin_client,
        _test_client_health
    )
    
    print("🔍 JWT Health Monitor iniciado")
    print("=" * 50)
    
    while True:
        try:
            print(f"\n⏰ Verificação em {time.strftime('%H:%M:%S')}")
            
            # Verificar status geral
            connectivity = get_connectivity_status()
            connection_ok = check_connection()
            
            print(f"📊 Status geral: {'✅ OK' if connection_ok else '❌ PROBLEMA'}")
            print(f"📊 Credenciais configuradas: {'✅' if connectivity['credentials_configured'] else '❌'}")
            print(f"📊 Falhas consecutivas: {connectivity['consecutive_failures']}")
            print(f"📊 Últimos {connectivity['error_count']} erros")
            
            if connectivity['last_error']:
                print(f"📊 Último erro: {connectivity['last_error']}")
            
            # Testar cliente admin especificamente
            try:
                admin_client = get_admin_client()
                admin_healthy = _test_client_health(admin_client) if admin_client else False
                print(f"🔑 JWT Admin: {'✅ Saudável' if admin_healthy else '❌ Expirado/Problemático'}")
                
                if not admin_healthy and connectivity['credentials_configured']:
                    print("🔧 Renovando conexões...")
                    refresh_all_connections()
                    
                    # Testar novamente
                    time.sleep(2)
                    admin_client_new = get_admin_client()
                    admin_healthy_new = _test_client_health(admin_client_new) if admin_client_new else False
                    print(f"🔑 JWT Admin pós-renovação: {'✅ Saudável' if admin_healthy_new else '❌ Ainda com problemas'}")
                    
            except Exception as e:
                print(f"❌ Erro ao testar JWT Admin: {e}")
            
            # Aguardar 2 minutos entre verificações
            print("⏳ Próxima verificação em 2 minutos...")
            await asyncio.sleep(120)
            
        except KeyboardInterrupt:
            print("\n🛑 Monitor interrompido pelo usuário")
            break
        except Exception as e:
            print(f"❌ Erro no monitor: {e}")
            await asyncio.sleep(30)  # Aguardar 30s em caso de erro

async def run_single_check():
    """Executa uma única verificação da saúde dos JWTs"""
    from app.utils.supabase import (
        check_connection, 
        get_connectivity_status, 
        refresh_all_connections,
        get_admin_client,
        _test_client_health
    )
    
    print("🔍 Verificação única da saúde dos JWTs")
    print("=" * 50)
    
    # Status geral
    connectivity = get_connectivity_status()
    connection_ok = check_connection()
    
    print(f"📊 Status geral: {'✅ OK' if connection_ok else '❌ PROBLEMA'}")
    print(f"📊 Ambiente: {connectivity['environment']}")
    print(f"📊 Credenciais configuradas: {'✅' if connectivity['credentials_configured'] else '❌'}")
    print(f"📊 Falhas consecutivas: {connectivity['consecutive_failures']}")
    print(f"📊 Intervalo de renovação: {connectivity['refresh_interval']}s")
    
    if connectivity['last_error']:
        print(f"📊 Último erro: {connectivity['last_error']}")
    
    # Testar JWT Admin
    try:
        admin_client = get_admin_client()
        admin_healthy = _test_client_health(admin_client) if admin_client else False
        print(f"🔑 JWT Admin: {'✅ Saudável' if admin_healthy else '❌ Expirado/Problemático'}")
        
        if not admin_healthy and connectivity['credentials_configured']:
            print("🔧 Tentando renovar conexões...")
            refresh_all_connections()
            
            # Testar novamente
            time.sleep(1)
            admin_client_new = get_admin_client()
            admin_healthy_new = _test_client_health(admin_client_new) if admin_client_new else False
            print(f"🔑 JWT Admin pós-renovação: {'✅ Saudável' if admin_healthy_new else '❌ Ainda com problemas'}")
            
            return admin_healthy_new
        
        return admin_healthy
        
    except Exception as e:
        print(f"❌ Erro ao testar JWT Admin: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--single":
        # Executar verificação única
        result = asyncio.run(run_single_check())
        sys.exit(0 if result else 1)
    else:
        # Executar monitor contínuo
        try:
            asyncio.run(monitor_jwt_health())
        except KeyboardInterrupt:
            print("\n✅ Monitor finalizado")
            sys.exit(0) 
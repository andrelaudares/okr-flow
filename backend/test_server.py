#!/usr/bin/env python3
"""
Script para testar a saúde do servidor OKR Backend
Uso: python test_server.py [--url URL]
"""

import argparse
import requests
import time
import sys
from datetime import datetime

def test_health_check(base_url):
    """Testa o endpoint de health check"""
    try:
        print(f"🔍 Testando health check em {base_url}")
        start_time = time.time()
        
        response = requests.get(f"{base_url}/", timeout=10)
        
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check OK")
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Versão: {data.get('version', 'N/A')}")
            print(f"   Tempo de resposta: {response_time:.2f}ms")
            return True
        else:
            print(f"❌ Health check falhou - Status: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"⏰ Timeout na requisição (>10s)")
        return False
    except requests.exceptions.ConnectionError:
        print(f"🔌 Erro de conexão - Servidor pode estar offline")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_load(base_url, num_requests=10):
    """Testa a capacidade de resposta com múltiplas requisições"""
    print(f"\n🚀 Testando carga com {num_requests} requisições...")
    
    success_count = 0
    total_time = 0
    response_times = []
    
    for i in range(num_requests):
        try:
            start_time = time.time()
            response = requests.get(f"{base_url}/", timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            response_times.append(response_time)
            total_time += response_time
            
            if response.status_code == 200:
                success_count += 1
                print(f"   Requisição {i+1}/{num_requests}: ✅ {response_time:.2f}ms")
            else:
                print(f"   Requisição {i+1}/{num_requests}: ❌ Status {response.status_code}")
                
        except Exception as e:
            print(f"   Requisição {i+1}/{num_requests}: ❌ Erro: {e}")
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        min_time = min(response_times)
        max_time = max(response_times)
        
        print(f"\n📊 Resultados do teste de carga:")
        print(f"   Sucessos: {success_count}/{num_requests} ({(success_count/num_requests)*100:.1f}%)")
        print(f"   Tempo médio: {avg_time:.2f}ms")
        print(f"   Tempo mínimo: {min_time:.2f}ms")
        print(f"   Tempo máximo: {max_time:.2f}ms")
        
        return success_count == num_requests
    
    return False

def main():
    parser = argparse.ArgumentParser(description='Testar servidor OKR Backend')
    parser.add_argument('--url', type=str, default='http://localhost:8000', 
                       help='URL base do servidor (padrão: http://localhost:8000)')
    parser.add_argument('--load', type=int, default=10, 
                       help='Número de requisições para teste de carga (padrão: 10)')
    
    args = parser.parse_args()
    
    print(f"🧪 Testando servidor OKR Backend")
    print(f"   URL: {args.url}")
    print(f"   Horário: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    # Teste básico de health check
    health_ok = test_health_check(args.url)
    
    if health_ok:
        # Teste de carga se o health check passou
        load_ok = test_load(args.url, args.load)
        
        if load_ok:
            print(f"\n🎉 Todos os testes passaram! Servidor está funcionando bem.")
            sys.exit(0)
        else:
            print(f"\n⚠️ Teste de carga falhou. Servidor pode ter problemas de performance.")
            sys.exit(1)
    else:
        print(f"\n❌ Health check falhou. Servidor não está respondendo adequadamente.")
        sys.exit(1)

if __name__ == "__main__":
    main() 
#!/usr/bin/env python3
"""
Script de teste para verificar se o servidor está funcionando corretamente
Uso: python test_server.py [--url URL] [--requests NUM]
"""

import argparse
import asyncio
import aiohttp
import time
import sys
from typing import List, Dict, Any

async def test_endpoint(session: aiohttp.ClientSession, url: str, name: str) -> Dict[str, Any]:
    """Testa um endpoint específico"""
    start_time = time.time()
    try:
        async with session.get(url) as response:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000  # em ms
            
            data = await response.json()
            
            return {
                "name": name,
                "status": response.status,
                "response_time": round(response_time, 2),
                "success": response.status == 200,
                "data": data
            }
    except Exception as e:
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        
        return {
            "name": name,
            "status": 0,
            "response_time": round(response_time, 2),
            "success": False,
            "error": str(e)
        }

async def test_server_performance(base_url: str, num_requests: int = 10) -> List[Dict[str, Any]]:
    """Testa a performance do servidor"""
    
    endpoints = [
        ("/", "Health Check"),
        ("/health", "Health Detail"),
        ("/docs", "API Docs")
    ]
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        print(f"🧪 Testando servidor: {base_url}")
        print(f"📊 Fazendo {num_requests} requests por endpoint...\n")
        
        for endpoint, name in endpoints:
            url = f"{base_url}{endpoint}"
            endpoint_results = []
            
            print(f"🔍 Testando {name} ({endpoint})...")
            
            # Fazer múltiplas requests
            tasks = []
            for i in range(num_requests):
                task = test_endpoint(session, url, f"{name} #{i+1}")
                tasks.append(task)
            
            endpoint_results = await asyncio.gather(*tasks)
            
            # Calcular estatísticas
            successful_results = [r for r in endpoint_results if r["success"]]
            success_rate = len(successful_results) / len(endpoint_results) * 100
            
            if successful_results:
                avg_time = sum(r["response_time"] for r in successful_results) / len(successful_results)
                min_time = min(r["response_time"] for r in successful_results)
                max_time = max(r["response_time"] for r in successful_results)
            else:
                avg_time = min_time = max_time = 0
            
            print(f"   ✅ Taxa de sucesso: {success_rate:.1f}%")
            print(f"   ⏱️  Tempo médio: {avg_time:.2f}ms")
            print(f"   🚀 Tempo mínimo: {min_time:.2f}ms")
            print(f"   🐌 Tempo máximo: {max_time:.2f}ms")
            
            if not successful_results:
                print(f"   ❌ Erros encontrados:")
                for result in endpoint_results:
                    if not result["success"]:
                        print(f"      - {result.get('error', 'Erro desconhecido')}")
            
            print()
            
            results.extend(endpoint_results)
    
    return results

def analyze_results(results: List[Dict[str, Any]]):
    """Analisa os resultados dos testes"""
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print("📈 RESUMO DOS TESTES:")
    print(f"   📊 Total de requests: {len(results)}")
    print(f"   ✅ Sucessos: {len(successful)}")
    print(f"   ❌ Falhas: {len(failed)}")
    print(f"   📈 Taxa de sucesso geral: {len(successful)/len(results)*100:.1f}%")
    
    if successful:
        avg_time = sum(r["response_time"] for r in successful) / len(successful)
        print(f"   ⏱️  Tempo médio geral: {avg_time:.2f}ms")
        
        if avg_time < 100:
            print("   🚀 Performance EXCELENTE!")
        elif avg_time < 500:
            print("   👍 Performance BOA!")
        elif avg_time < 1000:
            print("   ⚠️  Performance ACEITÁVEL")
        else:
            print("   🐌 Performance LENTA - considere otimizações")
    
    print()

async def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='Teste de Performance do Servidor OKR')
    parser.add_argument('--url', type=str, default='http://localhost:8000', 
                       help='URL base do servidor (padrão: http://localhost:8000)')
    parser.add_argument('--requests', type=int, default=10, 
                       help='Número de requests por endpoint (padrão: 10)')
    
    args = parser.parse_args()
    
    try:
        print("🔧 Iniciando testes de performance do Sistema OKR Backend...")
        print(f"🎯 Alvo: {args.url}")
        print(f"🔢 Requests por endpoint: {args.requests}")
        print()
        
        results = await test_server_performance(args.url, args.requests)
        analyze_results(results)
        
        # Verificar se há problemas críticos
        failed_results = [r for r in results if not r["success"]]
        if failed_results:
            print("⚠️  ATENÇÃO: Foram encontrados problemas!")
            return 1
        else:
            print("🎉 Todos os testes passaram com sucesso!")
            return 0
            
    except KeyboardInterrupt:
        print("\n🛑 Testes interrompidos pelo usuário.")
        return 1
    except Exception as e:
        print(f"\n❌ Erro durante os testes: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 
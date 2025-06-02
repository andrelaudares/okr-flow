#!/usr/bin/env python3
"""
Script para testar o endpoint de registro
"""
import requests
import json
import sys

def test_register():
    """Testa o endpoint de registro"""
    url = "http://localhost:8000/api/auth/register"
    
    # Dados de teste
    test_data = {
        "email": "maria@teste.com",
        "password": "Teste123",
        "name": "Maria da Silva",
        "username": "maria_teste",
        "cpf_cnpj": "12345678902"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print("🧪 Testando endpoint de registro...")
    print(f"📍 URL: {url}")
    print(f"📝 Dados: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        response = requests.post(url, json=test_data, headers=headers)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 201:
            print("✅ SUCESSO!")
            print(f"📃 Resposta: {json.dumps(response.json(), indent=2)}")
        else:
            print("❌ ERRO!")
            print(f"📃 Resposta: {response.text}")
            
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    error_data = response.json()
                    print(f"📃 Erro JSON: {json.dumps(error_data, indent=2)}")
                except:
                    pass
                    
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False
    
    return response.status_code == 201

if __name__ == "__main__":
    success = test_register()
    sys.exit(0 if success else 1) 
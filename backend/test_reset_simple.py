#!/usr/bin/env python3
"""
Script simples para testar reset de senha automaticamente
"""

import requests
import json
import sys

def test_reset_password_simple():
    """
    Testa a funcionalidade de reset de senha automaticamente
    """
    email = "andrelaudares@hotmail.com"
    url = "http://localhost:8000/api/auth/reset-password"
    
    print(f"🔄 Testando reset de senha para: {email}")
    print("=" * 50)
    
    # Dados da requisição
    data = {"email": email}
    
    try:
        # Fazer requisição POST
        response = requests.post(url, json=data)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Reset de senha funcionou!")
            print("📧 Verifique seu email para o link de reset")
            return True
        else:
            print("❌ Erro no reset de senha")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Servidor não está acessível")
        print("💡 Certifique-se de que o servidor está rodando em http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

if __name__ == "__main__":
    test_reset_password_simple() 
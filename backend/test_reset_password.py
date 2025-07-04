#!/usr/bin/env python3
"""
Script para testar o sistema de reset de senha.
"""

import requests
import json
import sys
import os

# Configuração da API
API_BASE_URL = "http://localhost:8000"

def test_reset_password(email: str):
    """
    Testa a funcionalidade de reset de senha.
    """
    print(f"🔄 Testando reset de senha para: {email}")
    
    # Endpoint de reset de senha
    url = f"{API_BASE_URL}/api/auth/reset-password"
    
    # Dados da requisição
    data = {
        "email": email
    }
    
    try:
        # Fazer requisição POST
        response = requests.post(url, json=data)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Reset de senha solicitado com sucesso!")
            result = response.json()
            print(f"📧 Mensagem: {result.get('message', 'N/A')}")
            return True
        else:
            print("❌ Erro ao solicitar reset de senha")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao servidor")
        print("💡 Certifique-se de que o servidor backend está rodando em http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_server_health():
    """
    Testa se o servidor está rodando.
    """
    try:
        response = requests.get(f"{API_BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ Servidor está rodando e acessível")
            return True
        else:
            print("⚠️  Servidor respondeu, mas com status não esperado")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Servidor não está acessível")
        return False

def main():
    """
    Função principal do script.
    """
    print("🚀 Iniciando teste do sistema de reset de senha...")
    print("=" * 50)
    
    # Testar saúde do servidor
    if not test_server_health():
        print("\n💡 Para iniciar o servidor, execute:")
        print("   cd backend && python start_server.py")
        sys.exit(1)
    
    # Email de teste
    email = input("\n📧 Digite o email para testar o reset de senha: ").strip()
    
    if not email:
        print("❌ Email é obrigatório!")
        sys.exit(1)
    
    # Testar reset de senha
    success = test_reset_password(email)
    
    if success:
        print("\n✅ Teste concluído com sucesso!")
        print("📧 Verifique sua caixa de email para as instruções de reset.")
    else:
        print("\n❌ Teste falhou!")
        print("🔍 Verifique os logs do servidor para mais detalhes.")

if __name__ == "__main__":
    main() 
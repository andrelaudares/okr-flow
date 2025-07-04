#!/usr/bin/env python3
import requests
import json
from dotenv import load_dotenv
import os
import webbrowser
import time
from urllib.parse import urlparse, parse_qs

# Carregar variáveis de ambiente
load_dotenv()

def test_complete_reset_flow():
    """
    Demonstra e testa o fluxo completo de reset de senha
    """
    
    print("🚀 TESTE COMPLETO DO FLUXO DE RESET DE SENHA")
    print("=" * 60)
    
    # Email para teste
    test_email = "andrelaudares@hotmail.com"
    
    print(f"📧 Email de teste: {test_email}")
    print("\n🔄 FLUXO COMPLETO:")
    print("1. ✅ Enviar email de reset")
    print("2. 📧 Usuário recebe email")
    print("3. 🔗 Usuário clica no link")
    print("4. 🎯 Frontend captura tokens")
    print("5. 🔐 Usuário define nova senha")
    print("6. ✅ Senha atualizada")
    
    print("\n" + "=" * 60)
    
    # PASSO 1: Solicitar reset
    print("\n📤 PASSO 1: Solicitando reset de senha...")
    try:
        response = requests.post(
            'http://localhost:8000/api/auth/reset-password',
            json={'email': test_email}
        )
        
        if response.status_code == 200:
            print("✅ Reset solicitado com sucesso!")
            print("📧 Verifique seu email para continuar")
        else:
            print(f"❌ Erro: {response.status_code} - {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return
    
    # PASSO 2: Explicar o que acontece no email
    print("\n📧 PASSO 2: Email recebido")
    print("   • Assunto: 'Reset Your Password'")
    print("   • Remetente: app@nobug.com.br")
    print("   • Link contém tokens de acesso")
    
    # PASSO 3: Simular link do email
    print("\n🔗 PASSO 3: Estrutura do link do email")
    example_url = f"http://localhost:5173/reset-password?access_token=TOKEN_AQUI&refresh_token=REFRESH_TOKEN_AQUI"
    print(f"   URL: {example_url}")
    
    # PASSO 4: Como o frontend funciona
    print("\n🎯 PASSO 4: Como o frontend funciona")
    print("   • Detecta tokens na URL")
    print("   • Mostra formulário de nova senha")
    print("   • Valida senha e confirmação")
    print("   • Envia para API /api/auth/update-password")
    
    # PASSO 5: Estrutura da API de update
    print("\n🔐 PASSO 5: API de atualização")
    print("   Endpoint: POST /api/auth/update-password")
    print("   Payload: {")
    print("     'access_token': 'token_do_email',")
    print("     'refresh_token': 'refresh_token_do_email',") 
    print("     'new_password': 'nova_senha'")
    print("   }")
    
    print("\n" + "=" * 60)
    print("🌐 TESTANDO CONECTIVIDADE:")
    
    # Verificar se frontend está rodando
    try:
        frontend_response = requests.get('http://localhost:5173', timeout=5)
        print("✅ Frontend rodando em http://localhost:5173")
        
        # Abrir página de reset no navegador
        reset_url = "http://localhost:5173/reset-password"
        print(f"🌐 Abrindo página de reset: {reset_url}")
        webbrowser.open(reset_url)
        
    except Exception as e:
        print("❌ Frontend NÃO está rodando!")
        print("   Execute: cd frontend && npm run dev")
        return
    
    # Verificar se backend está rodando  
    try:
        backend_response = requests.get('http://localhost:8000/docs', timeout=5)
        print("✅ Backend rodando em http://localhost:8000")
    except Exception as e:
        print("❌ Backend NÃO está rodando!")
        print("   Execute: cd backend && python start_server.py")
    
    print("\n" + "=" * 60)
    print("📋 PRÓXIMOS PASSOS:")
    print("1. ✅ Verifique seu email")
    print("2. 🔗 Clique no link 'Reset Password'")
    print("3. 🎯 Deve abrir: http://localhost:5173/reset-password")
    print("4. 📝 Digite nova senha")
    print("5. ✅ Confirme e teste login")

def explain_token_flow():
    """
    Explica detalhadamente como funcionam os tokens
    """
    print("\n" + "=" * 60)
    print("🔐 COMO FUNCIONAM OS TOKENS DE RESET:")
    print()
    
    print("1. 📧 EMAIL ENVIADO:")
    print("   • Supabase gera tokens temporários")
    print("   • access_token: válido por ~1 hora")
    print("   • refresh_token: para renovar sessão")
    print("   • URL: http://localhost:5173/reset-password?access_token=ABC&refresh_token=DEF")
    print()
    
    print("2. 🎯 FRONTEND DETECTA:")
    print("   • useSearchParams() captura tokens da URL")
    print("   • Se tokens existem → Mostra formulário nova senha")
    print("   • Se tokens não existem → Mostra formulário solicitar reset")
    print()
    
    print("3. 🔐 ATUALIZAÇÃO DE SENHA:")
    print("   • Frontend envia tokens + nova senha para backend")
    print("   • Backend valida tokens com Supabase")
    print("   • Se válidos → Atualiza senha")
    print("   • Se inválidos → Retorna erro")
    print()
    
    print("4. ✅ CONCLUSÃO:")
    print("   • Senha atualizada no Supabase")
    print("   • Usuário pode fazer login com nova senha")
    print("   • Tokens expiram automaticamente")

if __name__ == "__main__":
    test_complete_reset_flow()
    explain_token_flow()
    
    print("\n🎯 TESTE FINAL:")
    print("1. Execute este script")
    print("2. Verifique seu email") 
    print("3. Clique no link")
    print("4. Digite nova senha")
    print("5. Faça login!") 
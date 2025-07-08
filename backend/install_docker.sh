#!/bin/bash

# 🐳 Script de Instalação Rápida - OKR Flow Backend
# Este script automatiza a instalação do backend usando Docker

set -e  # Parar se qualquer comando falhar

echo "🐳 === INSTALAÇÃO OKR FLOW BACKEND COM DOCKER ==="
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado!"
    echo "   Instale o Docker primeiro: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado!"
    echo "   Instale o Docker Compose primeiro: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"
echo ""

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    echo "📝 Arquivo .env não encontrado. Criando a partir do exemplo..."
    
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Arquivo .env criado a partir de env.example"
        echo ""
        echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais Supabase!"
        echo "   - SUPABASE_URL"
        echo "   - SUPABASE_KEY" 
        echo "   - SUPABASE_SERVICE_KEY"
        echo ""
        read -p "Pressione ENTER após configurar o arquivo .env..." temp
    else
        echo "❌ Arquivo env.example não encontrado!"
        echo "   Crie manualmente o arquivo .env com as credenciais Supabase"
        exit 1
    fi
else
    echo "✅ Arquivo .env encontrado"
fi

echo ""
echo "🔧 Iniciando build e deploy..."

# Parar containers anteriores se existirem
echo "🛑 Parando containers anteriores (se existirem)..."
docker-compose down 2>/dev/null || true

# Build da imagem
echo "🏗️  Construindo imagem Docker..."
docker-compose build --no-cache

# Subir o container
echo "🚀 Iniciando container..."
docker-compose up -d

# Aguardar alguns segundos
echo "⏳ Aguardando inicialização..."
sleep 10

# Verificar se está funcionando
echo "🔍 Verificando se a API está respondendo..."

max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8001/health > /dev/null 2>&1; then
        echo "✅ API está respondendo!"
        break
    else
        echo "   Tentativa $attempt/$max_attempts - aguardando..."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ API não está respondendo após 60 segundos"
    echo "   Verificando logs..."
    docker-compose logs --tail=20
    exit 1
fi

echo ""
echo "🎉 === INSTALAÇÃO CONCLUÍDA COM SUCESSO! ==="
echo ""
echo "📊 Status do sistema:"
docker-compose ps

echo ""
echo "🌐 API disponível em: http://localhost:8001"
echo "🏥 Health check: http://localhost:8001/health"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
echo "🔧 Para configurar o frontend (Vercel):"
echo "   Configure a variável VITE_API_URL para:"
echo "   http://$(curl -s ifconfig.me):8001"
echo ""
echo "📖 Documentação completa: ./DOCKER_README.md"
echo ""
echo "✨ Sistema OKR Flow backend rodando com Docker!" 
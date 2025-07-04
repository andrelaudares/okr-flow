#!/bin/bash

# Script de Deploy Automatizado - Sistema OKR Backend
# Uso: ./deploy.sh [--dev|--prod] [--update]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar pré-requisitos
check_prerequisites() {
    print_info "Verificando pré-requisitos..."
    
    if ! command_exists docker; then
        print_error "Docker não está instalado!"
        print_info "Execute: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose não está instalado!"
        print_info "Execute: sudo curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
        print_info "         sudo chmod +x /usr/local/bin/docker-compose"
        exit 1
    fi
    
    print_success "Pré-requisitos verificados"
}

# Função para verificar arquivo .env
check_env_file() {
    print_info "Verificando arquivo .env..."
    
    if [ ! -f ".env" ]; then
        print_warning "Arquivo .env não encontrado!"
        print_info "Criando arquivo .env de exemplo..."
        
        cat > .env << EOF
# Configurações Obrigatórias do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica
SUPABASE_SERVICE_KEY=sua-chave-de-servico

# Configurações de Ambiente
ENVIRONMENT=production
FRONTEND_URL=https://okr.nobug.com.br

# Configurações de Performance
WORKERS_COUNT=4
TIMEOUT_KEEP_ALIVE=65
ENABLE_GZIP=true
LOG_LEVEL=WARNING

# Configurações de Cache
CACHE_TTL=300
CACHE_MAXSIZE=1000

# Configurações de JWT
JWT_EXPIRATION_TIME=2592000
JWT_REFRESH_EXPIRATION_TIME=7776000
SESSION_TIMEOUT=86400
EOF
        
        print_warning "Arquivo .env criado! Configure as variáveis necessárias antes de continuar."
        print_info "Edite o arquivo .env e execute o script novamente."
        exit 1
    fi
    
    # Verificar se variáveis obrigatórias estão definidas
    source .env
    
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
        print_error "Variáveis obrigatórias do Supabase não configuradas no .env!"
        print_info "Configure: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY"
        exit 1
    fi
    
    print_success "Arquivo .env configurado corretamente"
}

# Função para criar diretórios necessários
create_directories() {
    print_info "Criando diretórios necessários..."
    
    mkdir -p logs
    mkdir -p tmp
    
    print_success "Diretórios criados"
}

# Função para configurar firewall
configure_firewall() {
    print_info "Verificando configuração de firewall..."
    
    if command_exists ufw; then
        if ufw status | grep -q "Status: active"; then
            print_info "Configurando firewall para porta 8000..."
            sudo ufw allow 8000/tcp
            print_success "Porta 8000 liberada no firewall"
        else
            print_warning "UFW não está ativo. Certifique-se de que a porta 8000 está liberada."
        fi
    else
        print_warning "UFW não encontrado. Certifique-se de que a porta 8000 está liberada no firewall."
    fi
}

# Função para fazer backup
backup_config() {
    print_info "Fazendo backup das configurações..."
    
    backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    cp .env "$backup_dir/.env.backup" 2>/dev/null || true
    cp docker-compose.yml "$backup_dir/docker-compose.yml.backup" 2>/dev/null || true
    
    if [ -d "logs" ]; then
        tar -czf "$backup_dir/logs-backup.tar.gz" ./logs/
    fi
    
    print_success "Backup salvo em: $backup_dir"
}

# Função para fazer deploy
deploy_system() {
    local mode=$1
    local update=$2
    
    print_info "Iniciando deploy em modo: $mode"
    
    if [ "$update" = "true" ]; then
        print_info "Parando serviços para atualização..."
        docker-compose down
        
        print_info "Fazendo pull da imagem base..."
        docker-compose pull
    fi
    
    print_info "Fazendo build e iniciando serviços..."
    docker-compose up -d --build
    
    print_success "Serviços iniciados com sucesso!"
}

# Função para verificar saúde do sistema
health_check() {
    print_info "Verificando saúde do sistema..."
    
    # Aguardar serviços iniciarem
    sleep 10
    
    # Verificar se container está rodando
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Container não está rodando!"
        print_info "Verificando logs..."
        docker-compose logs --tail=50 okr-backend
        exit 1
    fi
    
    # Verificar health check
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Health check passou! Sistema está funcionando."
            break
        else
            print_info "Tentativa $attempt/$max_attempts - Aguardando sistema inicializar..."
            sleep 5
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Health check falhou após $max_attempts tentativas!"
        print_info "Verificando logs..."
        docker-compose logs --tail=50 okr-backend
        exit 1
    fi
}

# Função para mostrar informações do sistema
show_system_info() {
    print_success "🚀 Sistema OKR Backend Deploy Completo!"
    echo ""
    print_info "📊 Informações do Sistema:"
    echo "   • Container: $(docker-compose ps --services)"
    echo "   • Status: $(docker-compose ps --format 'table {{.Service}}\t{{.Status}}')"
    echo "   • URL: http://localhost:8000"
    echo "   • Health Check: http://localhost:8000/health"
    echo "   • Documentação: http://localhost:8000/docs"
    echo ""
    
    # Obter IP do servidor
    local_ip=$(hostname -I | awk '{print $1}')
    print_info "🌐 URLs de Acesso:"
    echo "   • Local: http://localhost:8000"
    echo "   • Rede: http://$local_ip:8000"
    echo ""
    
    print_info "📋 Comandos Úteis:"
    echo "   • Ver logs: docker-compose logs -f okr-backend"
    echo "   • Parar sistema: docker-compose down"
    echo "   • Reiniciar: docker-compose restart okr-backend"
    echo "   • Status: docker-compose ps"
    echo ""
    
    print_warning "🔧 Próximos Passos:"
    echo "   1. Configure o frontend (Vercel) com a URL: http://$local_ip:8000"
    echo "   2. Teste a conectividade do frontend"
    echo "   3. Configure certificado SSL (opcional)"
    echo "   4. Configure monitoramento"
}

# Função principal
main() {
    local mode="prod"
    local update=false
    
    # Processar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dev)
                mode="dev"
                shift
                ;;
            --prod)
                mode="prod"
                shift
                ;;
            --update)
                update=true
                shift
                ;;
            -h|--help)
                echo "Uso: $0 [--dev|--prod] [--update]"
                echo "  --dev     Deploy em modo desenvolvimento"
                echo "  --prod    Deploy em modo produção (padrão)"
                echo "  --update  Atualizar sistema existente"
                exit 0
                ;;
            *)
                print_error "Opção desconhecida: $1"
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Sistema OKR Backend - Deploy Automatizado"
    echo "================================================"
    
    check_prerequisites
    check_env_file
    create_directories
    configure_firewall
    
    if [ "$update" = "true" ]; then
        backup_config
    fi
    
    deploy_system "$mode" "$update"
    health_check
    show_system_info
}

# Executar apenas se for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 
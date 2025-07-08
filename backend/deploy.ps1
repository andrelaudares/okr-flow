# Script de Deploy para Windows PowerShell - Sistema OKR Backend
# Uso: .\deploy.ps1 [-Mode "prod"|"dev"] [-Update]

param(
    [string]$Mode = "prod",
    [switch]$Update = $false
)

# Função para imprimir mensagens coloridas
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Função para verificar se comando existe
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Função para verificar pré-requisitos
function Test-Prerequisites {
    Write-Info "Verificando pré-requisitos..."
    
    if (-not (Test-Command "docker")) {
        Write-Error "Docker não está instalado!"
        Write-Info "Baixe em: https://www.docker.com/products/docker-desktop"
        exit 1
    }
    
    if (-not (Test-Command "docker-compose")) {
        Write-Error "Docker Compose não está instalado!"
        Write-Info "Instale o Docker Desktop que inclui o Docker Compose"
        exit 1
    }
    
    Write-Success "Pré-requisitos verificados"
}

# Função para verificar arquivo .env
function Test-EnvFile {
    Write-Info "Verificando arquivo .env..."
    
    if (-not (Test-Path ".env")) {
        Write-Warning "Arquivo .env não encontrado!"
        Write-Info "Criando arquivo .env de exemplo..."
        
        $envContent = @"
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
"@
        
        Set-Content -Path ".env" -Value $envContent
        Write-Warning "Arquivo .env criado! Configure as variáveis necessárias antes de continuar."
        Write-Info "Edite o arquivo .env e execute o script novamente."
        exit 1
    }
    
    # Verificar se variáveis obrigatórias estão definidas
    $envVars = Get-Content ".env" | Where-Object { $_ -match "^[^#]" }
    $hasSupabaseUrl = $envVars | Where-Object { $_ -match "SUPABASE_URL=" -and $_ -notmatch "seu-projeto" }
    $hasSupabaseKey = $envVars | Where-Object { $_ -match "SUPABASE_KEY=" -and $_ -notmatch "sua-chave" }
    $hasSupabaseService = $envVars | Where-Object { $_ -match "SUPABASE_SERVICE_KEY=" -and $_ -notmatch "sua-chave" }
    
    if (-not ($hasSupabaseUrl -and $hasSupabaseKey -and $hasSupabaseService)) {
        Write-Error "Variáveis obrigatórias do Supabase não configuradas no .env!"
        Write-Info "Configure: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY"
        exit 1
    }
    
    Write-Success "Arquivo .env configurado corretamente"
}

# Função para criar diretórios necessários
function New-Directories {
    Write-Info "Criando diretórios necessários..."
    
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs"
    }
    
    if (-not (Test-Path "tmp")) {
        New-Item -ItemType Directory -Path "tmp"
    }
    
    Write-Success "Diretórios criados"
}

# Função para fazer backup
function Backup-Config {
    Write-Info "Fazendo backup das configurações..."
    
    $backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir
    
    if (Test-Path ".env") {
        Copy-Item ".env" "$backupDir\.env.backup"
    }
    
    if (Test-Path "docker-compose.yml") {
        Copy-Item "docker-compose.yml" "$backupDir\docker-compose.yml.backup"
    }
    
    if (Test-Path "logs") {
        Compress-Archive -Path "logs\*" -DestinationPath "$backupDir\logs-backup.zip"
    }
    
    Write-Success "Backup salvo em: $backupDir"
}

# Função para fazer deploy
function Start-Deploy {
    param([string]$DeployMode, [bool]$UpdateMode)
    
    Write-Info "Iniciando deploy em modo: $DeployMode"
    
    if ($UpdateMode) {
        Write-Info "Parando serviços para atualização..."
        docker-compose down
        
        Write-Info "Fazendo pull da imagem base..."
        docker-compose pull
    }
    
    Write-Info "Fazendo build e iniciando serviços..."
    docker-compose up -d --build
    
    Write-Success "Serviços iniciados com sucesso!"
}

# Função para verificar saúde do sistema
function Test-HealthCheck {
    Write-Info "Verificando saúde do sistema..."
    
    # Aguardar serviços iniciarem
    Start-Sleep -Seconds 10
    
    # Verificar se container está rodando
    $containerStatus = docker-compose ps --format "table {{.Service}}\t{{.Status}}"
    if ($containerStatus -notmatch "Up") {
        Write-Error "Container não está rodando!"
        Write-Info "Verificando logs..."
        docker-compose logs --tail=50 okr-backend
        exit 1
    }
    
    # Verificar health check
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Success "Health check passou! Sistema está funcionando."
                break
            }
        }
        catch {
            Write-Info "Tentativa $attempt/$maxAttempts - Aguardando sistema inicializar..."
            Start-Sleep -Seconds 5
            $attempt++
        }
    }
    
    if ($attempt -gt $maxAttempts) {
        Write-Error "Health check falhou após $maxAttempts tentativas!"
        Write-Info "Verificando logs..."
        docker-compose logs --tail=50 okr-backend
        exit 1
    }
}

# Função para mostrar informações do sistema
function Show-SystemInfo {
    Write-Success "🚀 Sistema OKR Backend Deploy Completo!"
    Write-Host ""
    Write-Info "📊 Informações do Sistema:"
    
    $services = docker-compose ps --services
    $status = docker-compose ps --format "table {{.Service}}\t{{.Status}}"
    
    Write-Host "   • Container: $services"
    Write-Host "   • Status: $status"
    Write-Host "   • URL: http://localhost:8001"
Write-Host "   • Health Check: http://localhost:8001/health"
Write-Host "   • Documentação: http://localhost:8001/docs"
    Write-Host ""
    
    # Obter IP do servidor
    $localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*","Wi-Fi*" | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress
    
    Write-Info "🌐 URLs de Acesso:"
    Write-Host "   • Local: http://localhost:8001"
Write-Host "   • Rede: http://$localIp:8001"
    Write-Host ""
    
    Write-Info "📋 Comandos Úteis:"
    Write-Host "   • Ver logs: docker-compose logs -f okr-backend"
    Write-Host "   • Parar sistema: docker-compose down"
    Write-Host "   • Reiniciar: docker-compose restart okr-backend"
    Write-Host "   • Status: docker-compose ps"
    Write-Host ""
    
    Write-Warning "🔧 Próximos Passos:"
    Write-Host "   1. Configure o frontend (Vercel) com a URL: http://$localIp:8001"
    Write-Host "   2. Teste a conectividade do frontend"
    Write-Host "   3. Configure certificado SSL (opcional)"
    Write-Host "   4. Configure monitoramento"
}

# Função principal
function Main {
    Write-Host "🚀 Sistema OKR Backend - Deploy Automatizado (Windows)"
    Write-Host "======================================================="
    
    Test-Prerequisites
    Test-EnvFile
    New-Directories
    
    if ($Update) {
        Backup-Config
    }
    
    Start-Deploy -DeployMode $Mode -UpdateMode $Update
    Test-HealthCheck
    Show-SystemInfo
}

# Executar script
try {
    Main
}
catch {
    Write-Error "Erro durante o deploy: $_"
    exit 1
} 
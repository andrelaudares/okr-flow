# Dockerfile otimizado para produção
FROM python:3.11-slim

# Definir variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000
ENV ENVIRONMENT=production
ENV WORKERS_COUNT=4

# Criar diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN useradd --create-home --shell /bin/bash app

# Copiar requirements primeiro para aproveitar cache do Docker
COPY requirements.txt .

# Atualizar pip e instalar dependências
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código da aplicação
COPY . .

# Criar diretório de logs
RUN mkdir -p /app/logs && chown -R app:app /app/logs

# Alterar permissões do diretório
RUN chown -R app:app /app

# Mudar para usuário não-root
USER app

# Expor a porta
EXPOSE $PORT

# Comando para executar a aplicação
CMD ["python", "start_server.py", "--port", "8001", "--workers", "4"] 
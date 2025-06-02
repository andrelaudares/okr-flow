# Configuração do Gunicorn para produção
# Uso: gunicorn -c gunicorn.conf.py app.main:app

import os
import multiprocessing

# Configurações básicas
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = int(os.getenv('WEB_CONCURRENCY', multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000

# Configurações de timeout
timeout = 120
keepalive = 5
graceful_timeout = 30

# Configurações de logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Configurações de processo
preload_app = True
max_requests = 1000
max_requests_jitter = 100

# Configurações de memória
worker_tmp_dir = "/dev/shm"

# Hooks
def when_ready(server):
    server.log.info("🚀 Servidor OKR Backend pronto para receber conexões")

def worker_int(worker):
    worker.log.info("🛑 Worker interrompido graciosamente")

def on_exit(server):
    server.log.info("👋 Servidor OKR Backend finalizado") 
.PHONY: help build up down restart logs clean dev prod test

# Variables
COMPOSE_FILE = docker-compose.yml
BACKEND_DIR = vambe-backend
FRONTEND_DIR = vambe-frontend

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir las imágenes Docker
	docker compose build

up: ## Iniciar los contenedores
	docker compose up -d

down: ## Detener y eliminar los contenedores
	docker compose down

restart: ## Reiniciar los contenedores
	docker compose restart

logs: ## Ver logs de todos los servicios
	docker compose logs -f

logs-backend: ## Ver logs del backend
	docker compose logs -f backend

logs-frontend: ## Ver logs del frontend
	docker compose logs -f frontend

clean: ## Eliminar contenedores, imágenes y volúmenes
	docker compose down -v --rmi all

dev: ## Iniciar en modo desarrollo (sin Docker)
	@echo "Iniciando backend..."
	@cd $(BACKEND_DIR) && npm run start:dev &
	@echo "Iniciando frontend..."
	@cd $(FRONTEND_DIR) && npm run dev

prod: build up ## Construir e iniciar en producción
	@echo "Aplicación iniciada en producción"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"

test: ## Ejecutar tests
	@echo "Ejecutando tests del backend..."
	@cd $(BACKEND_DIR) && npm test
	@echo "Ejecutando tests del frontend..."
	@cd $(FRONTEND_DIR) && npm test

rebuild: ## Reconstruir las imágenes sin caché
	docker compose build --no-cache

shell-backend: ## Abrir shell en el contenedor del backend
	docker compose exec backend sh

shell-frontend: ## Abrir shell en el contenedor del frontend
	docker compose exec frontend sh

status: ## Ver estado de los contenedores
	docker compose ps


# CroweCad Makefile

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install dependencies
	npm ci

.PHONY: dev
dev: ## Start development server
	npm run dev

.PHONY: build
build: ## Build for production
	npm run build

.PHONY: test
test: ## Run all tests
	npm run test

.PHONY: test-unit
test-unit: ## Run unit tests
	npm run test:unit

.PHONY: test-integration
test-integration: ## Run integration tests
	npm run test:integration

.PHONY: test-e2e
test-e2e: ## Run E2E tests
	npm run test:e2e

.PHONY: lint
lint: ## Run linters
	npm run lint

.PHONY: format
format: ## Format code
	npm run format

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t crowecad:latest .

.PHONY: docker-up
docker-up: ## Start Docker containers
	docker-compose up -d

.PHONY: docker-down
docker-down: ## Stop Docker containers
	docker-compose down

.PHONY: docker-logs
docker-logs: ## View Docker logs
	docker-compose logs -f

.PHONY: docker-dev
docker-dev: ## Start development containers
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

.PHONY: docker-clean
docker-clean: ## Clean Docker resources
	docker-compose down -v
	docker system prune -f

.PHONY: db-migrate
db-migrate: ## Run database migrations
	npm run db:migrate

.PHONY: db-seed
db-seed: ## Seed database
	npm run db:seed

.PHONY: db-reset
db-reset: docker-down ## Reset database
	docker volume rm crowecad_postgres_data || true
	$(MAKE) docker-up
	sleep 5
	$(MAKE) db-seed

.PHONY: skill-mine
skill-mine: ## Run skill mining
	docker exec crowecad-app node scripts/mine-skills.js

.PHONY: backup
backup: ## Backup database and skills
	mkdir -p backups
	docker exec crowecad-db pg_dump -U crowecad crowecad > backups/crowecad_$$(date +%Y%m%d_%H%M%S).sql
	cp crowecad_skills.json backups/crowecad_skills_$$(date +%Y%m%d_%H%M%S).json || true
	cp crowecad_skills_embeddings.pkl backups/crowecad_skills_embeddings_$$(date +%Y%m%d_%H%M%S).pkl || true

.PHONY: restore
restore: ## Restore from latest backup
	@echo "Available backups:"
	@ls -la backups/*.sql 2>/dev/null || echo "No backups found"
	@echo ""
	@echo "To restore a specific backup, run:"
	@echo "  docker exec -i crowecad-db psql -U crowecad crowecad < backups/[backup_file].sql"

.PHONY: logs
logs: ## View application logs
	docker-compose logs -f crowecad

.PHONY: shell
shell: ## Enter container shell
	docker exec -it crowecad-app sh

.PHONY: psql
psql: ## Connect to PostgreSQL
	docker exec -it crowecad-db psql -U crowecad -d crowecad

.PHONY: redis-cli
redis-cli: ## Connect to Redis
	docker exec -it crowecad-cache redis-cli

.PHONY: clean
clean: ## Clean build artifacts
	rm -rf dist build node_modules uploads/*.dxf uploads/*.dwg

.PHONY: status
status: ## Check service status
	@echo "=== Service Status ==="
	@docker-compose ps
	@echo ""
	@echo "=== Health Checks ==="
	@curl -s http://localhost:5000/api/health | jq . || echo "API not responding"
	@echo ""
	@echo "=== Database Status ==="
	@docker exec crowecad-db pg_isready -U crowecad || echo "Database not ready"
	@echo ""
	@echo "=== Redis Status ==="
	@docker exec crowecad-cache redis-cli ping || echo "Redis not responding"
.PHONY: help start stop restart logs status clean build setup test start-edge start-backend start-ui stop-edge stop-backend stop-ui

# Default target
help:
	@echo "Energy Management System - Available Commands:"
	@echo ""
	@echo "  make setup       - Initial setup (copy env file)"
	@echo "  make start       - Start all services"
	@echo "  make stop        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo ""
	@echo "Component-Specific Deployment:"
	@echo "  make start-edge     - Start only Edge service"
	@echo "  make start-backend  - Start Backend with databases"
	@echo "  make start-ui       - Start UI with dependencies"
	@echo "  make stop-edge      - Stop only Edge service"
	@echo "  make stop-backend   - Stop Backend service"
	@echo "  make stop-ui        - Stop UI service"
	@echo ""
	@echo "  make logs        - View logs (all services)"
	@echo "  make logs-edge   - View Edge logs"
	@echo "  make logs-backend - View Backend logs"
	@echo "  make logs-ui     - View UI logs"
	@echo "  make status      - Check service status"
	@echo "  make clean       - Stop and remove all data"
	@echo "  make test        - Run system tests"
	@echo "  make backup      - Backup databases"
	@echo "  make restore     - Restore databases"
	@echo ""

# Initial setup
setup:
	@echo "Setting up Energy Management System..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓ Created .env file"; \
	else \
		echo "✓ .env file already exists"; \
	fi
	@mkdir -p config/edge config/backend
	@echo "✓ Created config directories"
	@echo ""
	@echo "Setup complete! You can now run: make start"

# Start services
start:
	@echo "Starting Energy Management System..."
	docker compose up -d
	@echo ""
	@echo "✓ Services started!"
	@echo ""
	@echo "Access the system:"
	@echo "  - OpenEMS UI:    http://localhost:8080"
	@echo "  - InfluxDB UI:   http://localhost:8086"
	@echo ""
	@echo "View logs with: make logs"

# Stop services
stop:
	@echo "Stopping Energy Management System..."
	docker compose down
	@echo "✓ Services stopped"

# Restart services
restart:
	@echo "Restarting Energy Management System..."
	docker compose restart
	@echo "✓ Services restarted"

# View all logs
logs:
	docker compose logs -f

# View Edge logs
logs-edge:
	docker compose logs -f openems-edge

# View Backend logs
logs-backend:
	docker compose logs -f openems-backend

# View UI logs
logs-ui:
	docker compose logs -f openems-ui

# Check status
status:
	@echo "Service Status:"
	@docker compose ps

# Clean everything
clean:
	@echo "WARNING: This will remove all data!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read dummy
	docker compose down -v
	@echo "✓ All services and data removed"

# Run tests
test:
	@echo "Running system tests..."
	@echo "Checking if services are running..."
	@docker compose ps | grep -q "Up" && echo "✓ Services are running" || (echo "✗ Services not running" && exit 1)
	@echo "Testing OpenEMS UI..."
	@curl -f http://localhost:8080 > /dev/null 2>&1 && echo "✓ UI is accessible" || echo "✗ UI not accessible"
	@echo "Testing InfluxDB..."
	@curl -f http://localhost:8086/health > /dev/null 2>&1 && echo "✓ InfluxDB is accessible" || echo "✗ InfluxDB not accessible"
	@echo ""
	@echo "Tests complete!"

# Backup databases
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@docker compose exec -T postgres pg_dump -U openems openems > backups/postgres_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ PostgreSQL backup created"
	@docker compose exec -T influxdb influx backup /tmp/backup
	@docker cp openems-influxdb:/tmp/backup backups/influxdb_$$(date +%Y%m%d_%H%M%S)
	@echo "✓ InfluxDB backup created"
	@echo "Backups saved in ./backups/"

# Restore databases
restore:
	@echo "Available backups:"
	@ls -1 backups/
	@echo ""
	@echo "Enter PostgreSQL backup filename to restore:"
	@read backup_file; \
	if [ -f "backups/$$backup_file" ]; then \
		docker compose exec -T postgres psql -U openems -d openems < backups/$$backup_file; \
		echo "✓ PostgreSQL restored from $$backup_file"; \
	else \
		echo "✗ Backup file not found"; \
	fi

# Pull latest images
update:
	@echo "Pulling latest OpenEMS images..."
	docker compose pull
	@echo "✓ Images updated"
	@echo "Run 'make restart' to use the new images"

# View resource usage
stats:
	@echo "Resource Usage:"
	docker stats --no-stream

# Component-specific deployment commands

# Start only Edge service
start-edge:
	@echo "Starting Edge service..."
	docker compose up -d openems-edge
	@echo "✓ Edge service started on port 8085"
	@echo ""
	@echo "View logs with: make logs-edge"

# Start Backend with databases
start-backend:
	@echo "Starting Backend services..."
	docker compose up -d openems-backend postgres influxdb
	@echo "✓ Backend services started"
	@echo "  - Backend API:  http://localhost:8084"
	@echo "  - InfluxDB UI:  http://localhost:8086"
	@echo ""
	@echo "View logs with: make logs-backend"

# Start UI with dependencies
start-ui:
	@echo "Starting UI and dependencies..."
	docker compose up -d openems-ui openems-backend postgres
	@echo "✓ UI services started"
	@echo "  - OpenEMS UI:   http://localhost:8080"
	@echo ""
	@echo "View logs with: make logs-ui"

# Stop Edge service
stop-edge:
	@echo "Stopping Edge service..."
	docker compose stop openems-edge
	@echo "✓ Edge service stopped"

# Stop Backend service
stop-backend:
	@echo "Stopping Backend service..."
	docker compose stop openems-backend
	@echo "✓ Backend service stopped"

# Stop UI service
stop-ui:
	@echo "Stopping UI service..."
	docker compose stop openems-ui
	@echo "✓ UI service stopped"

# Restart specific components
restart-edge:
	@echo "Restarting Edge service..."
	docker compose restart openems-edge
	@echo "✓ Edge service restarted"

restart-backend:
	@echo "Restarting Backend service..."
	docker compose restart openems-backend
	@echo "✓ Backend service restarted"

restart-ui:
	@echo "Restarting UI service..."
	docker compose restart openems-ui
	@echo "✓ UI service restarted"

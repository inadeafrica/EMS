# Repository Structure Guide

## Overview

This repository provides a **Docker-based deployment configuration** for OpenEMS (Open Energy Management System). It uses pre-built Docker images to deploy OpenEMS components without requiring the full source code.

## Current Structure

The repository contains Docker configuration and documentation:

```
Energy-Management-System/
├── config/                 # Runtime configuration (created during setup)
│   ├── edge/               # Edge device configuration files
│   └── backend/            # Backend server configuration files
├── docker-compose.yml      # Docker service definitions
├── Makefile               # Automation commands for deployment
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── validate.sh            # Setup validation script
└── [documentation files]   # README, ARCHITECTURE, etc.
```

## Docker Deployment Architecture

This repository deploys the following OpenEMS components using pre-built Docker images:

### 1. OpenEMS UI (Port 8080)
- **Technology**: Angular, TypeScript, nginx
- **Docker Image**: `openems/ui-backend:latest`
- **Purpose**: Web-based user interface

### 2. OpenEMS Edge (Port 8085)
- **Technology**: Java, OSGi framework
- **Docker Image**: `openems/edge:latest`
- **Purpose**: Edge device controller for real-time energy management

### 3. OpenEMS Backend (Port 8084)
- **Technology**: Java, Spring Boot
- **Docker Image**: `openems/backend:latest`
- **Purpose**: Central management server

### 4. PostgreSQL (Port 5432)
- **Docker Image**: `postgres:15-alpine`
- **Purpose**: Configuration and metadata storage

### 5. InfluxDB (Port 8086)
- **Docker Image**: `influxdb:2.7-alpine`
- **Purpose**: Time-series energy data storage

## Deployment Approach

This repository uses **Docker Compose** to orchestrate multiple containerized services. The configuration allows for:

- **Simple deployment**: All services defined in one `docker-compose.yml` file
- **Pre-built images**: Uses official OpenEMS Docker images from Docker Hub
- **Configuration management**: Runtime configuration stored in `config/` directory
- **Easy updates**: Pull latest images with `make update`
- **Selective deployment**: Deploy only specific services (see below)

## Customization and Extension

### For Configuration Changes
- Modify files in `config/edge/` for Edge configuration
- Modify files in `config/backend/` for Backend configuration
- Update `.env` file for environment variables

### For Source Code Changes
If you need to modify the OpenEMS source code, you should:
1. Fork the official OpenEMS repository: https://github.com/OpenEMS/openems
2. Make your changes in that repository
3. Build custom Docker images
4. Update `docker-compose.yml` to use your custom images

This separation keeps the deployment configuration clean and maintainable.

## Independent Component Deployment

One of the common questions about monorepo structure is: **"How can I deploy individual components without deploying everything?"**

Even in a monorepo, you can deploy components independently. Here are the strategies:

### Strategy 1: Docker Compose Service Selection

Deploy only specific services using Docker Compose:

```bash
# Deploy only Edge component
docker compose up -d openems-edge

# Deploy only Backend and its dependencies
docker compose up -d openems-backend postgres influxdb

# Deploy only UI and its dependencies
docker compose up -d openems-ui openems-backend postgres

# Deploy Edge and Backend without UI
docker compose up -d openems-edge openems-backend postgres influxdb
```

**Stop specific services:**
```bash
# Stop only Edge
docker compose stop openems-edge

# Restart only Backend
docker compose restart openems-backend
```

### Strategy 2: Multiple Docker Compose Files

Create separate compose files for different deployment scenarios:

**docker-compose.edge.yml** (Edge only):
```yaml
services:
  openems-edge:
    image: openems/edge:latest
    # ... edge configuration
```

**docker-compose.backend.yml** (Backend only):
```yaml
services:
  openems-backend:
    image: openems/backend:latest
    # ... backend configuration
  postgres:
    # ... postgres configuration
  influxdb:
    # ... influxdb configuration
```

Deploy using:
```bash
# Deploy only Edge
docker compose -f docker-compose.edge.yml up -d

# Deploy only Backend
docker compose -f docker-compose.backend.yml up -d
```

### Strategy 3: Custom Docker Images

If you need to build custom Docker images with your own modifications:

```bash
# Clone the official OpenEMS repository
git clone https://github.com/OpenEMS/openems.git
cd openems

# Build custom Edge image
docker build -f tools/docker/edge/Dockerfile -t my-org/edge:custom .

# Build custom Backend image
docker build -f tools/docker/backend/Dockerfile -t my-org/backend:custom .

# Build custom UI image
docker build -f tools/docker/ui/Dockerfile.backend -t my-org/ui:custom .
```

Then update your `docker-compose.yml` to use your custom images:
```yaml
services:
  openems-edge:
    image: my-org/edge:custom  # Instead of openems/edge:latest
```

### Strategy 4: Selective Deploy with Makefile

Add component-specific targets to the Makefile:

```makefile
# Deploy only Edge
start-edge:
	docker compose up -d openems-edge
	@echo "✓ Edge service started"

# Deploy only Backend with dependencies
start-backend:
	docker compose up -d openems-backend postgres influxdb
	@echo "✓ Backend services started"

# Deploy only UI with dependencies
start-ui:
	docker compose up -d openems-ui openems-backend postgres
	@echo "✓ UI services started"

# Build only Edge from source
build-edge:
	cd src && ./gradlew :io.openems.edge.application:build
	@echo "✓ Edge built"

# Build only Backend from source
build-backend:

Usage:
```bash
make start-edge      # Deploy only Edge
make start-backend   # Deploy only Backend stack
make start-ui        # Deploy only UI stack
```

### Strategy 5: Environment-Specific Configurations
        run: |

### Strategy 5: Environment-Specific Configurations

Use different environment files for different deployments:

```bash
# Development environment
cp .env.dev .env
docker compose up -d

# Production environment
cp .env.prod .env
docker compose up -d
```

### Summary: Independent Component Deployment

| Deployment Need | Solution |
|----------------|----------|
| Deploy single service | `docker compose up -d [service-name]` |
| Deploy service group | Create separate compose files or use Makefile targets |
| Update specific component | Pull new image and restart: `docker compose pull openems-edge && docker compose up -d openems-edge` |
| Custom modifications | Fork OpenEMS, build custom images, update compose file |
| Development workflow | Use Makefile targets: `make start-edge`, `make start-backend` |

**Key Insight**: Docker-based deployment allows flexible service management:
- What to deploy (Docker Compose service selection)
- When to update (Pull and restart specific services)
- Where to deploy (Multi-environment support with .env files)
- How to customize (Use custom Docker images)

## Best Practices

### For Docker Deployment:
- Use clear environment variable naming
- Document configuration options
- Keep sensitive data in `.env` (never commit)
- Use Docker Compose service selection for independent deployment
- Version-pin Docker images in production
- Regularly update images with `make update`
- Monitor logs with `make logs`

### For Customization:
- Fork the official OpenEMS repository for source code changes
- Build custom Docker images from your fork
- Test thoroughly before deploying custom images
- Document your customizations
- Consider contributing back to OpenEMS

## References

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system architecture
- [README.md](README.md) - Project overview and setup
- [OpenEMS Documentation](https://openems.github.io/openems.io/) - Upstream project docs
- [OpenEMS GitHub](https://github.com/OpenEMS/openems) - Official source code repository

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-16 | Use Docker deployment repo | Separates deployment configuration from source code, uses pre-built images |

## Conclusion

This repository provides a clean Docker-based deployment solution for OpenEMS. By separating deployment configuration from source code:

- **Easier to maintain**: Focus on configuration, not code complexity
- **Faster to deploy**: Use pre-built, tested Docker images
- **Simpler to understand**: Clear separation of concerns
- **Easy to customize**: Fork OpenEMS for modifications, build custom images

**Current Status**: ✅ Docker deployment repository with pre-built images

**For Source Code Development**: Visit the [official OpenEMS repository](https://github.com/OpenEMS/openems) to contribute or build custom versions.

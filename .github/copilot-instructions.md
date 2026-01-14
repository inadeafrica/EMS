# Copilot Instructions for Energy Management System

## Project Overview

This is an Energy Management System built on OpenEMS (Open Energy Management System), using Docker containers to manage renewable energy sources, battery storage, and grid interaction. The system is designed for monitoring and controlling energy flows in real-time.

## Technology Stack

- **OpenEMS**: Core energy management platform (Java, OSGi, Apache Felix)
- **Docker & Docker Compose**: Containerized deployment
- **PostgreSQL 15**: Configuration and metadata storage
- **InfluxDB 2.7**: Time-series energy data storage
- **Angular/TypeScript**: Web UI (OpenEMS UI)
- **Makefile**: Build automation and task management

## Architecture

The system consists of 5 main components running as Docker containers:
1. **OpenEMS Edge** (Port 8085): Edge device controller for real-time management
2. **OpenEMS Backend** (Port 8084): Central management server
3. **OpenEMS UI** (Port 8080): Web-based user interface
4. **PostgreSQL** (Port 5432): Relational database
5. **InfluxDB** (Port 8086): Time-series database

All containers communicate via Docker bridge network `openems-network`.

## Build & Test Commands

### Setup
```bash
make setup          # Initial setup (copy .env file, create config directories)
```

### Development
```bash
make start          # Start all Docker services
make stop           # Stop all services
make restart        # Restart services
make status         # Check service status
```

### Testing
```bash
make test           # Run system tests (check services, URLs)
./validate.sh       # Validate setup requirements
```

### Monitoring
```bash
make logs           # View all service logs
make logs-edge      # View Edge logs only
make logs-backend   # View Backend logs only
make logs-ui        # View UI logs only
make stats          # View resource usage
```

### Maintenance
```bash
make clean          # Stop and remove all data (WARNING: removes volumes)
make backup         # Backup databases
make restore        # Restore databases
make update         # Pull latest OpenEMS images
```

## Coding Standards & Conventions

### Docker Compose Files
- Use 2-space indentation
- Add comments for complex configurations
- Group related services together
- Use meaningful service names
- Always specify container names for clarity
- Use environment variables from `.env` file with sensible defaults

### Configuration Files
- Use JSON for OpenEMS configuration files
- Follow OpenEMS naming conventions for components
- Validate syntax before committing
- Store examples as `.example` files (e.g., `.env.example`)

### Documentation (Markdown)
- Keep lines under 100 characters where practical
- Use code blocks with language specifiers
- Include practical examples
- Update relevant docs when making changes (README, ARCHITECTURE, etc.)
- Use clear headings and structure

### Shell Scripts
- Include shebang: `#!/bin/bash`
- Use `set -e` for error handling
- Add descriptive comments
- Make scripts executable (`chmod +x`)
- Use color codes for output (GREEN, RED, YELLOW, NC)

## File Structure

Key files and directories:
- `docker-compose.yml`: Main service definitions
- `.env`: Environment configuration (not committed)
- `.env.example`: Environment template (committed)
- `Makefile`: Build and deployment commands
- `config/edge/`: OpenEMS Edge configuration
- `config/backend/`: OpenEMS Backend configuration
- `validate.sh`: Setup validation script

Documentation files:
- `README.md`: Main project documentation
- `ARCHITECTURE.md`: System architecture details
- `CONTRIBUTING.md`: Contribution guidelines
- `GETTING_STARTED.md`: Quick start guide
- `TROUBLESHOOTING.md`: Common issues and solutions
- `SECURITY.md`: Security guidelines and practices

## Security Guidelines

### Never Commit Secrets
- Never commit `.env` files with real credentials
- Never commit passwords, tokens, or API keys
- Use `.env.example` as a template with placeholder values
- Change all default passwords in production

### Database Security
- Change default database passwords before production deployment
- Use strong, randomly generated tokens for InfluxDB
- Restrict database access to Backend service only
- Use environment variables for credentials

### Network Security
- Use TLS/SSL for production deployments
- Configure firewall rules for exposed ports
- Restrict Edge API (8085) access in production
- Keep InfluxDB API (8086) restricted or behind authentication

### Docker Security
- Never expose PostgreSQL port (5432) externally
- Use specific image tags rather than `latest` in production
- Review OpenEMS security updates regularly
- Use Docker secrets for sensitive data in production

## Development Workflow

### Making Changes

1. **Before Making Changes**:
   - Run `make status` to check current state
   - Review relevant documentation (ARCHITECTURE.md, README.md)
   - Test the current setup: `make test`

2. **During Development**:
   - Make minimal, focused changes
   - Test changes: `make restart && make logs`
   - Verify services are running: `make status`
   - Check web UI at http://localhost:8080

3. **Before Committing**:
   - Run `./validate.sh` to ensure setup is valid
   - Run `make test` to verify services work
   - Update documentation if needed
   - Verify `.env` is not being committed

### Testing Changes

Always test changes by:
1. Running `make clean` for a fresh start (if needed)
2. Running `make setup && make start`
3. Checking `make status` shows all services as "Up"
4. Accessing http://localhost:8080 to verify UI loads
5. Checking logs for errors: `make logs`

## OpenEMS-Specific Guidelines

### Component Configuration
- Follow OpenEMS component naming conventions
- Use simulation components for testing (e.g., Simulator.GridMeter.Acting)
- Configure real device drivers only with proper hardware
- Validate component IDs are unique

### Data Flow
- Edge collects data every 1 second (typical control cycle)
- Backend stores time-series data in InfluxDB
- UI subscribes to real-time data via WebSocket
- Historical queries use Backend REST API

### Modifying OpenEMS Core
- For core OpenEMS changes, contribute to [OpenEMS GitHub](https://github.com/OpenEMS/openems)
- This repository focuses on Docker deployment and configuration
- Follow [OpenEMS Contributing Guide](https://github.com/OpenEMS/openems/blob/develop/CONTRIBUTING.md)

## Common Pitfalls to Avoid

1. **Don't** remove or modify working Docker Compose configurations without testing
2. **Don't** expose database ports externally in production
3. **Don't** commit `.env` files with credentials
4. **Don't** use `latest` tags for production deployments
5. **Don't** modify OpenEMS core behavior without consulting OpenEMS documentation
6. **Don't** remove error handling from shell scripts
7. **Don't** hard-code values that should be environment variables
8. **Don't** skip validation steps before committing

## Pull Request Guidelines

### PR Title Format
Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `chore:` for maintenance
- `refactor:` for code refactoring

Examples:
- `feat: add solar panel configuration example`
- `fix: correct InfluxDB connection timeout`
- `docs: update installation guide for Windows`

### PR Description Should Include
- What changed and why
- How to test the changes
- Any breaking changes
- Related issues or discussions
- Screenshots for UI changes

### Before Submitting PR
- [ ] Changes are tested with `make test`
- [ ] Services start successfully with `make start`
- [ ] Documentation is updated
- [ ] No secrets or credentials committed
- [ ] `.env` is not committed
- [ ] Commit messages are clear and descriptive

## Additional Resources

- [OpenEMS Documentation](https://openems.github.io/openems.io/)
- [OpenEMS Community Forum](https://community.openems.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [InfluxDB Documentation](https://docs.influxdata.com/)

## Project-Specific Notes

- This is a demonstration/development setup; production deployments require additional security hardening
- Default configuration uses simulation components for testing without physical hardware
- The system supports multiple Edge devices connected to one Backend
- Time-series data retention policies should be configured in InfluxDB for production use
- All timestamps use UTC timezone by default

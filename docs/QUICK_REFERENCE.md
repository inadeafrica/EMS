# Quick Reference

Fast lookup for common commands and configurations.

## Repository Organization

**Architecture**: Monorepo (all components in one repository)

```
Repository Structure:
├── UI (1 app)       → src/ui/
├── Edge (192 mods)  → src/edge/io.openems.edge.*
├── Backend (18 mods)→ src/backend/io.openems.backend.*
└── Common (5 mods)  → src/common/io.openems.common.*
```

📚 See [REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md) for detailed explanation

## Essential Commands

### Setup
```bash
git clone https://github.com/inadeafrica/Energy-Management-System.git
cd Energy-Management-System
make setup
make start
```

### Daily Operations
```bash
make start      # Start all services
make stop       # Stop all services
make restart    # Restart all services
make status     # Check service status
make logs       # View all logs
```

### Component-Specific Deployment
```bash
# Start individual components
make start-edge      # Start only Edge service
make start-backend   # Start Backend with databases
make start-ui        # Start UI with dependencies

# Stop individual components
make stop-edge       # Stop Edge service
make stop-backend    # Stop Backend service
make stop-ui         # Stop UI service

# Restart individual components
make restart-edge    # Restart Edge service
make restart-backend # Restart Backend service
make restart-ui      # Restart UI service
```

### Direct Docker Compose Commands
```bash
# Deploy specific services
docker compose up -d openems-edge                    # Edge only
docker compose up -d openems-backend postgres influxdb  # Backend stack
docker compose up -d openems-ui openems-backend      # UI + Backend

# Stop specific services
docker compose stop openems-edge
docker compose restart openems-backend
```

### Specific Service Logs
```bash
make logs-edge     # Edge device logs
make logs-backend  # Backend server logs
make logs-ui       # UI logs
```

### Maintenance
```bash
make backup    # Backup databases
make clean     # Remove all data (WARNING!)
make update    # Pull latest images
make test      # Run validation tests
```

## Access Points

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| OpenEMS UI | http://localhost:8080 | None (open access) |
| InfluxDB | http://localhost:8086 | admin / adminpassword |
| Edge API | http://localhost:8085 | - |
| Backend API | http://localhost:8084 | - |

## Port Reference

| Port | Service | Purpose |
|------|---------|---------|
| 8080 | OpenEMS UI | Web interface |
| 8084 | Backend | API server |
| 8085 | Edge | Device controller |
| 8086 | InfluxDB | Time-series database |
| 5432 | PostgreSQL | Configuration database |

## File Structure

```
Energy-Management-System/
├── docker-compose.yml      # Service definitions
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── Makefile              # Convenient commands
├── validate.sh           # Setup validation script
├── README.md             # Main documentation (in root)
├── GETTING_STARTED.md    # Quick start guide (in docs/)
├── ARCHITECTURE.md       # System architecture (in docs/)
├── EXAMPLES.md           # Usage examples (in docs/)
├── TROUBLESHOOTING.md    # Problem solving (in docs/)
├── CONTRIBUTING.md       # Contribution guide (in root)
├── LICENSE.md            # License information (in root)
└── config/               # Configuration files
    ├── edge/            # Edge device config
    └── backend/         # Backend server config
```

## Environment Variables

Key variables in `.env`:

```bash
# Timezone
TZ=UTC

# Database
POSTGRES_DB=openems
POSTGRES_USER=openems
POSTGRES_PASSWORD=openems

# InfluxDB
INFLUXDB_ADMIN_USER=admin
INFLUXDB_ADMIN_PASSWORD=adminpassword
INFLUXDB_TOKEN=openems-token-change-in-production

# Ports
UI_PORT=8080
BACKEND_API_PORT=8084
EDGE_API_PORT=8085
```

## Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f [service]

# Restart service
docker compose restart [service]

# Execute command in container
docker compose exec [service] [command]

# Check status
docker compose ps

# Remove everything
docker compose down -v
```

## Common InfluxDB Queries

### Recent Battery State of Charge
```flux
from(bucket: "energy_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "ess")
  |> filter(fn: (r) => r["_field"] == "Soc")
```

### Daily Energy Summary
```flux
from(bucket: "energy_data")
  |> range(start: -1d)
  |> filter(fn: (r) => r["_measurement"] == "consumption")
  |> aggregateWindow(every: 1d, fn: sum)
```

### Average Grid Power
```flux
from(bucket: "energy_data")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "grid")
  |> filter(fn: (r) => r["_field"] == "ActivePower")
  |> aggregateWindow(every: 1h, fn: mean)
```

## Troubleshooting Quick Fixes

### Services Won't Start
```bash
docker compose down -v
docker compose up -d
```

### UI Not Loading
```bash
docker compose restart openems-ui
# Clear browser cache (Ctrl+Shift+R)
```

### Database Connection Issues
```bash
docker compose restart postgres
sleep 30
docker compose restart openems-backend
```

### Check Logs for Errors
```bash
docker compose logs | grep -i error
```

## Health Checks

```bash
# Validate configuration
./validate.sh

# Check all services
make status

# Test endpoints
curl http://localhost:8080
curl http://localhost:8086/health
```

## Backup & Restore

### Quick Backup
```bash
make backup
# Saves to ./backups/
```

### Quick Restore
```bash
# Stop services
make stop

# Restore database
docker compose up -d postgres
sleep 10
cat backups/postgres_*.sql | docker compose exec -T postgres psql -U openems -d openems

# Start services
make start
```

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong InfluxDB token
- [ ] Enable firewall rules
- [ ] Use SSL/TLS in production
- [ ] Restrict API access
- [ ] Regular backups
- [ ] Update regularly

## Performance Tips

1. **Monitor resources**: `docker stats`
2. **Set memory limits** in docker-compose.yml
3. **Configure retention policies** in InfluxDB
4. **Aggregate old data** to save space
5. **Use SSD storage** for databases

## Common Configuration Patterns

### Simulation Mode (Default)
```json
{
  "things": {
    "simulator0": {
      "class": "io.openems.edge.simulator.datasource.csv.direct.SimulatorDatasourceCsvDirect"
    }
  }
}
```

### Real Hardware
```json
{
  "things": {
    "battery0": {
      "class": "io.openems.edge.battery.soltaro.BatterySoltaro",
      "properties": {
        "modbus.id": "modbus0",
        "modbusUnitId": 1
      }
    }
  }
}
```

## API Quick Reference

### REST API

```bash
# Get status
curl http://localhost:8084/api/v1/status

# Get devices
curl http://localhost:8084/api/v1/devices

# Get channel value
curl http://localhost:8084/api/v1/devices/{device}/channels/{channel}
```

### InfluxDB API

```bash
# Query data
curl -X POST http://localhost:8086/api/v2/query \
  -H "Authorization: Token openems-token-change-in-production" \
  -H "Content-Type: application/vnd.flux" \
  -d 'from(bucket:"energy_data") |> range(start:-1h)'
```

## Resource Requirements

### Minimum
- CPU: 2 cores
- RAM: 4 GB
- Disk: 10 GB

### Recommended
- CPU: 4 cores
- RAM: 8 GB
- Disk: 50 GB (SSD)

## Support & Community

- **Documentation**: [OpenEMS Docs](https://openems.github.io/openems.io/)
- **Community**: [OpenEMS Forum](https://community.openems.io/)
- **Source Code**: [GitHub](https://github.com/OpenEMS/openems)
- **Issues**: [GitHub Issues](https://github.com/inadeafrica/Energy-Management-System/issues)

## Version Information

Check versions:
```bash
docker --version
docker compose version
docker compose exec openems-edge java -version
```

## License

OpenEMS: Eclipse Public License 2.0 (EPL-2.0)

See [LICENSE.md](../LICENSE.md) for details.

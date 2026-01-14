# Getting Started Guide

This guide will help you get your Energy Management System up and running quickly.

## Step 1: Prerequisites Check

Before starting, ensure you have:

```bash
# Check Docker version (should be 20.10+)
docker --version

# Check Docker Compose version (should be 2.0+)
docker compose --version

# Check available disk space (need at least 10GB)
df -h

# Check available memory (need at least 4GB)
free -h
```

## Step 2: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/inadeafrica/Energy-Management-System.git
cd Energy-Management-System

# Create environment file
cp .env.example .env

# Review and edit environment variables (optional)
nano .env
```

## Step 3: Start Services

```bash
# Start all services in detached mode
docker compose up -d

# Check service status
docker compose ps

# You should see all services as "Up"
```

Expected output:
```
NAME                  STATUS
openems-edge          Up
openems-backend       Up
openems-ui            Up
openems-postgres      Up
openems-influxdb      Up
```

## Step 4: Wait for Initialization

The services need a few minutes to initialize:

```bash
# Watch the logs
docker compose logs -f

# Wait until you see messages like:
# "OpenEMS Edge started successfully"
# "OpenEMS Backend started successfully"
```

Press `Ctrl+C` to stop watching logs.

## Step 5: Access the Web Interface

Open your browser and navigate to:

**OpenEMS UI**: http://localhost:8080

You should see the OpenEMS dashboard with:
- Energy flow diagram
- Current power values
- Battery state of charge
- Grid connection status

## Step 6: Explore InfluxDB

**InfluxDB UI**: http://localhost:8086

Login with:
- Username: `admin`
- Password: `adminpassword`

Navigate to:
1. **Data Explorer** - Query and visualize energy data
2. **Dashboards** - Create custom dashboards
3. **Buckets** - View the `energy_data` bucket

## Step 7: Test the System

### View Simulated Data

The default configuration runs in simulation mode with:
- Simulated grid meter
- Simulated battery (10 kWh capacity, 5 kW power)
- Self-consumption controller

### Monitor Energy Flows

In the OpenEMS UI, observe:
1. Grid consumption (positive) or feed-in (negative)
2. Battery charging (positive) or discharging (negative)
3. State of charge percentage
4. Current power levels

### Query Historical Data

In InfluxDB Data Explorer, try this query:

```flux
from(bucket: "energy_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "ess")
  |> filter(fn: (r) => r["_field"] == "Soc")
```

This shows battery state of charge over the last hour.

## Step 8: Stopping the System

When you're done:

```bash
# Stop all services
docker compose down

# Or stop and remove all data
docker compose down -v
```

## Next Steps

- [Configure real hardware](HARDWARE_SETUP.md)
- [Customize the configuration](CONFIGURATION.md)
- [Add additional components](CUSTOMIZATION.md)

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are already in use
netstat -tuln | grep -E '8080|8084|8085|8086'

# Check Docker logs for errors
docker compose logs openems-edge
docker compose logs openems-backend
```

### Can't Access Web UI

1. Check if the service is running:
   ```bash
   docker compose ps openems-ui
   ```

2. Check firewall rules:
   ```bash
   # Allow port 8080
   sudo ufw allow 8080
   ```

3. Try accessing from the host:
   ```bash
   curl http://localhost:8080
   ```

### Database Connection Errors

```bash
# Restart the database
docker compose restart postgres

# Wait 30 seconds, then restart backend
docker compose restart openems-backend
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

## Getting Help

- Check [README.md](README.md) for detailed documentation
- Visit [OpenEMS Community Forum](https://community.openems.io/)
- Review logs: `docker compose logs -f`

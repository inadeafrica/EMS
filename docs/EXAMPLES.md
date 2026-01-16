# Usage Examples

This guide provides practical examples of using the Energy Management System.

## Example 1: Basic Monitoring

### Start the System

```bash
# Clone and set up
git clone https://github.com/inadeafrica/EMS.git
cd EMS
make setup

# Start services
make start

# Wait for services to be ready (2-3 minutes)
make logs | grep -i "started successfully"
```

### Access the Dashboard

1. Open browser to http://localhost:8080
2. You'll see the OpenEMS dashboard with:
   - Live energy flow diagram
   - Current power consumption/production
   - Battery state of charge
   - Grid connection status

### Monitor Real-time Data

The simulation will show:
- Grid consumption varying over time
- Battery charging/discharging
- Self-consumption optimization in action

## Example 2: Querying Energy Data

### Using InfluxDB

1. Access InfluxDB UI: http://localhost:8086
2. Login with admin/adminpassword
3. Go to "Data Explorer"

#### Query Battery State of Charge

```flux
from(bucket: "energy_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "ess")
  |> filter(fn: (r) => r["_field"] == "Soc")
  |> aggregateWindow(every: 1m, fn: mean)
```

#### Query Grid Power

```flux
from(bucket: "energy_data")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "grid")
  |> filter(fn: (r) => r["_field"] == "ActivePower")
  |> aggregateWindow(every: 15m, fn: mean)
```

#### Calculate Daily Energy Consumption

```flux
from(bucket: "energy_data")
  |> range(start: -1d)
  |> filter(fn: (r) => r["_measurement"] == "consumption")
  |> filter(fn: (r) => r["_field"] == "Energy")
  |> aggregateWindow(every: 1d, fn: sum)
```

## Example 3: Creating Custom Dashboards

### In InfluxDB

1. Go to "Dashboards" → "Create Dashboard"
2. Add cells with queries
3. Choose visualization types:
   - Line chart for power over time
   - Gauge for battery SoC
   - Single stat for current values

### Dashboard Layout Example

```
┌─────────────────────────────────────────────────┐
│ Current Status                                   │
├──────────────┬──────────────┬───────────────────┤
│ Grid Power   │ Battery SoC  │ Self-Consumption  │
│  1.5 kW      │    75%       │      85%          │
└──────────────┴──────────────┴───────────────────┘
┌─────────────────────────────────────────────────┐
│ Power Over Time (24h)                           │
│ [Line Chart]                                     │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Energy Today                                     │
│ [Bar Chart]                                      │
└─────────────────────────────────────────────────┘
```

## Example 4: Configuring a Solar System

### Edit Edge Configuration

Create `config/edge/config.json`:

```json
{
  "things": {
    "pvInverter0": {
      "alias": "Solar Inverter",
      "class": "io.openems.edge.meter.api.ElectricityMeter",
      "enabled": true,
      "properties": {
        "type": "PRODUCTION",
        "maxPower": 10000
      }
    },
    "ess0": {
      "alias": "Battery Storage",
      "class": "io.openems.edge.ess.api.ManagedSymmetricEss",
      "enabled": true,
      "properties": {
        "capacity": 13500,
        "maxApparentPower": 5000
      }
    },
    "gridMeter0": {
      "alias": "Grid Connection Point",
      "class": "io.openems.edge.meter.api.ElectricityMeter",
      "enabled": true,
      "properties": {
        "type": "GRID"
      }
    },
    "controller0": {
      "alias": "Self-Consumption Optimization",
      "class": "io.openems.edge.controller.ess.selfconsumption.EssSelfConsumption",
      "enabled": true,
      "properties": {
        "ess.id": "ess0",
        "meter.id": "gridMeter0"
      }
    }
  }
}
```

### Restart Edge

```bash
docker compose restart openems-edge
```

## Example 5: Setting Up Alerts

### Monitor Battery Low SoC

1. In InfluxDB, create a check:

```flux
from(bucket: "energy_data")
  |> range(start: -5m)
  |> filter(fn: (r) => r["_measurement"] == "ess")
  |> filter(fn: (r) => r["_field"] == "Soc")
  |> mean()
  |> yield(name: "mean")
```

2. Set threshold: Alert if < 20%
3. Configure notification (email, webhook, etc.)

## Example 6: Exporting Data

### Export to CSV

```bash
# Using InfluxDB CLI
docker compose exec influxdb influx query \
  'from(bucket:"energy_data")
   |> range(start:-24h)
   |> filter(fn: (r) => r["_measurement"] == "ess")' \
  --raw > energy_data.csv
```

### Export via API

```python
import requests
import json

url = "http://localhost:8086/api/v2/query"
headers = {
    "Authorization": "Token openems-token-change-in-production",
    "Content-Type": "application/vnd.flux"
}
query = """
from(bucket: "energy_data")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "ess")
"""

response = requests.post(url, headers=headers, data=query)
print(response.text)
```

## Example 7: Backup and Restore

### Create Backup

```bash
# Using Make command
make backup

# Or manually
mkdir -p backups
docker compose exec -T postgres pg_dump -U openems openems > backups/db_backup.sql
```

### Restore from Backup

```bash
# Stop services
make stop

# Restore database
docker compose up -d postgres
sleep 10
docker compose exec -T postgres psql -U openems -d openems < backups/db_backup.sql

# Start all services
make start
```

## Example 8: Monitoring Multiple Locations

### Scale the System

```yaml
# docker-compose.multi.yml
services:
  openems-edge-location1:
    image: openems/openems-edge:latest
    ports:
      - "8085:8085"
    # ... configuration for location 1

  openems-edge-location2:
    image: openems/openems-edge:latest
    ports:
      - "8086:8085"
    # ... configuration for location 2

  openems-backend:
    # Central backend manages both locations
```

Start with:
```bash
docker compose -f docker-compose.multi.yml up -d
```

## Example 9: Integration with External Systems

### REST API Example

```bash
# Get current system status
curl http://localhost:8084/api/v1/status

# Get device list
curl http://localhost:8084/api/v1/devices

# Get current power values
curl http://localhost:8084/api/v1/devices/ess0/channels/ActivePower
```

### WebSocket Example

```javascript
// Connect to real-time data stream
const ws = new WebSocket('ws://localhost:8084/websocket');

ws.onopen = () => {
  // Subscribe to specific channels
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['ess0/Soc', 'grid0/ActivePower']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time data:', data);
};
```

## Example 10: Performance Optimization

### Optimize Data Retention

```bash
# Connect to InfluxDB
docker compose exec influxdb influx

# Set retention policy (keep 30 days)
> CREATE RETENTION POLICY "30_days" ON "energy_data" DURATION 30d REPLICATION 1 DEFAULT
```

### Aggregate Old Data

```flux
// Downsample old data to reduce storage
from(bucket: "energy_data")
  |> range(start: -90d, stop: -30d)
  |> aggregateWindow(every: 1h, fn: mean)
  |> to(bucket: "energy_data_aggregated")
```

## Common Use Cases

### Residential

- Monitor solar production
- Optimize battery usage
- Track consumption patterns
- Reduce grid dependency

### Commercial

- Peak shaving
- Load balancing
- Demand response
- Energy cost optimization

### Industrial

- Multi-site monitoring
- Equipment efficiency
- Energy reporting
- Compliance tracking

## Tips and Best Practices

### 1. Regular Monitoring

```bash
# Check system health daily
make status
make logs | grep -i error
```

### 2. Periodic Backups

```bash
# Automate with cron
0 2 * * * cd /path/to/EMS && make backup
```

### 3. Update Regularly

```bash
# Pull latest images
make update

# Apply updates
make restart
```

### 4. Resource Monitoring

```bash
# Watch resource usage
docker stats
```

### 5. Security

```bash
# Change default passwords in .env
# Use strong tokens for InfluxDB
# Enable SSL/TLS for production
# Restrict network access with firewall
```

## Next Steps

- Explore [Advanced Configuration](CONFIGURATION.md)
- Read [Architecture Details](ARCHITECTURE.md)
- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- Join [OpenEMS Community](https://community.openems.io/)

# Troubleshooting Guide

Common issues and solutions for the Energy Management System.

## Table of Contents

- [Build Issues](#build-issues)
- [Docker Issues](#docker-issues)
- [Service Issues](#service-issues)
- [Network Issues](#network-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Data Issues](#data-issues)

## Build Issues

### Build Fails with Java Version Error

**Symptom**: Build fails with error about unsupported Java version or `class file has wrong version`

**Solution**: OpenEMS requires Java 21 or later

```bash
# Check your Java version
java -version

# Should show: openjdk version "21..." or higher

# If you have multiple Java versions, set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64  # Linux
export PATH=$JAVA_HOME/bin:$PATH

# Or use the build script which handles this automatically
./build.sh
```

**Common Java 21 locations**:
- Linux: `/usr/lib/jvm/temurin-21-jdk-amd64` or `/usr/lib/jvm/java-21-openjdk-amd64`
- macOS: `/opt/homebrew/opt/openjdk@21` or `/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home`
- Windows: `C:\Program Files\Eclipse Adoptium\jdk-21`

Download Java 21: https://adoptium.net/temurin/releases/?version=21

### Build Hangs or Runs Slowly

**Symptom**: Gradle build takes too long or appears to hang

**Solution 1**: Increase memory allocation (already configured)
```bash
# Check gradle.properties for:
org.gradle.jvmargs=-Xms512m -Xmx2048m
```

**Solution 2**: Use `--no-daemon` flag
```bash
cd src
./gradlew build --no-daemon
```

**Solution 3**: Stop existing Gradle daemons
```bash
./gradlew --stop
```

### Cannot Download Dependencies

**Symptom**: Build fails downloading dependencies from Maven Central

**Solution**: Check internet connection and try again
```bash
cd src
./gradlew build --refresh-dependencies
```

For detailed build instructions, see [BUILD_GUIDE.md](BUILD_GUIDE.md).

## Docker Issues

### Docker Daemon Not Running

**Symptom**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# On Linux
sudo systemctl start docker

# On macOS/Windows
# Start Docker Desktop application
```

### Permission Denied

**Symptom**: `Got permission denied while trying to connect to the Docker daemon socket`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

### Port Already in Use

**Symptom**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution 1**: Stop conflicting service
```bash
# Find process using the port
sudo lsof -i :8080

# Stop the process
sudo kill -9 <PID>
```

**Solution 2**: Change port in docker-compose.yml
```yaml
services:
  openems-ui:
    ports:
      - "8081:80"  # Changed from 8080 to 8081
```

### Out of Disk Space

**Symptom**: `no space left on device`

**Solution**:
```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Service Issues

### Services Not Starting

**Symptom**: Services show as "Restarting" or "Exited"

**Check logs**:
```bash
docker compose logs openems-edge
docker compose logs openems-backend
docker compose logs openems-ui
```

**Common causes**:
1. Configuration errors
2. Missing dependencies
3. Port conflicts
4. Database not ready

**Solution**:
```bash
# Restart all services
docker compose restart

# Or recreate services
docker compose down
docker compose up -d
```

### Edge Service Fails to Start

**Symptom**: `openems-edge` container exits immediately

**Check logs**:
```bash
docker compose logs openems-edge
```

**Common issues**:
- Invalid component configuration
- Missing device drivers
- Java memory issues

**Solution**:
```bash
# Check configuration via UI at http://localhost:8080
# Navigate to Settings → Components to verify configuration

# Check Java errors in logs
docker compose logs openems-edge | grep -i error

# Increase memory if needed
# Add to docker-compose.yml under openems-edge:
environment:
  - JAVA_OPTS=-Xmx2g
```

### Backend Service Fails

**Symptom**: `openems-backend` container exits or restarts

**Check database connection**:
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Test database connection
docker compose exec postgres psql -U openems -d openems -c "SELECT 1;"
```

**Solution**:
```bash
# Restart PostgreSQL first
docker compose restart postgres

# Wait 30 seconds
sleep 30

# Restart backend
docker compose restart openems-backend
```

### UI Not Loading

**Symptom**: Blank page or 502 Bad Gateway

**Check services**:
```bash
docker compose ps
```

**Solution 1**: Ensure all services are running
```bash
docker compose up -d
docker compose ps | grep Up
```

**Solution 2**: Clear browser cache
- Press Ctrl+Shift+R (hard refresh)
- Clear browser cache and cookies
- Try incognito/private mode

**Solution 3**: Check logs
```bash
docker compose logs openems-ui
```

## Network Issues

### Cannot Access UI from External Network

**Symptom**: UI works on localhost but not from other machines

**Solution 1**: Check firewall
```bash
# Allow port 8080
sudo ufw allow 8080/tcp

# Or disable firewall temporarily (not recommended for production)
sudo ufw disable
```

**Solution 2**: Bind to all interfaces
```yaml
# In docker-compose.yml
ports:
  - "0.0.0.0:8080:80"
```

### Services Cannot Communicate

**Symptom**: Backend cannot connect to PostgreSQL

**Check network**:
```bash
docker network ls
docker network inspect energy-management-system_openems-network
```

**Solution**:
```bash
# Recreate network
docker compose down
docker compose up -d
```

## Database Issues

### PostgreSQL Connection Failed

**Symptom**: `FATAL: password authentication failed`

**Solution**:
```bash
# Reset database
docker compose down -v
docker compose up -d postgres

# Wait for initialization
sleep 30

# Start other services
docker compose up -d
```

### InfluxDB Not Accessible

**Symptom**: Cannot access InfluxDB UI at port 8086

**Check service**:
```bash
docker compose ps influxdb
docker compose logs influxdb
```

**Solution**:
```bash
# Restart InfluxDB
docker compose restart influxdb

# Check health
curl http://localhost:8086/health
```

### Database Data Lost

**Symptom**: Data disappears after restart

**Check volumes**:
```bash
docker volume ls | grep openems
```

**Solution**: Ensure volumes are defined in docker-compose.yml
```yaml
volumes:
  postgres-data:
  influxdb-data:
```

### Database Corruption

**Symptom**: Database errors in logs

**Solution**:
```bash
# Backup first (if possible)
docker compose exec postgres pg_dump -U openems openems > backup.sql

# Remove corrupted data
docker compose down -v

# Restart fresh
docker compose up -d

# Restore backup (if available)
docker compose exec -T postgres psql -U openems -d openems < backup.sql
```

## Performance Issues

### Slow Response Times

**Check resources**:
```bash
docker stats
```

**Solution 1**: Increase container resources
```yaml
# In docker-compose.yml
services:
  openems-backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

**Solution 2**: Optimize queries
- Reduce data retention period
- Aggregate historical data
- Use proper indexes

### High CPU Usage

**Check which service**:
```bash
docker stats --no-stream
```

**Common causes**:
- Too many devices
- Frequent polling
- Complex calculations

**Solution**:
```bash
# Reduce polling frequency in config
# Optimize control algorithms
# Scale horizontally (multiple instances)
```

### High Memory Usage

**Check memory**:
```bash
docker stats --no-stream | grep -E 'openems|postgres|influx'
```

**Solution**:
```bash
# Set memory limits
docker compose down
# Edit docker-compose.yml to add memory limits
docker compose up -d
```

## Data Issues

### No Data Displayed

**Symptom**: UI shows no data or "No data available"

**Check data flow**:
```bash
# Check if Edge is collecting data
docker compose logs openems-edge | grep -i data

# Check if Backend is receiving data
docker compose logs openems-backend | grep -i data

# Check InfluxDB
docker compose exec influxdb influx query 'from(bucket:"energy_data") |> range(start:-1h) |> limit(n:1)'
```

**Solution**:
```bash
# Restart Edge to start data collection
docker compose restart openems-edge

# Verify components are configured in UI
# Access http://localhost:8080 → Settings → Components
```

### Incorrect Data

**Symptom**: Data values seem wrong

**Check configuration**:
```bash
# Review Edge configuration via UI
# Access http://localhost:8080 → Settings → Components
# Or check logs for configuration errors
docker compose logs openems-edge | grep -i error
```

**Common issues**:
- Wrong unit conversions
- Incorrect device mapping
- Simulation vs real hardware mismatch

### Historical Data Missing

**Check InfluxDB**:
```bash
# Access InfluxDB
docker compose exec influxdb influx

# List buckets
> show buckets

# Query data
> from(bucket:"energy_data") |> range(start:-24h) |> limit(n:10)
```

**Solution**:
```bash
# Check retention policy
# Ensure data is being written
# Verify Backend-InfluxDB connection
```

## Getting More Help

If issues persist:

1. **Check logs**: `docker compose logs -f`
2. **Validate setup**: `./validate.sh`
3. **Restart everything**: `docker compose down && docker compose up -d`
4. **Fresh start**: `docker compose down -v && docker compose up -d`

5. **Community support**:
   - [OpenEMS Community Forum](https://community.openems.io/)
   - [OpenEMS GitHub Issues](https://github.com/OpenEMS/openems/issues)

6. **Documentation**:
   - [OpenEMS Documentation](https://openems.github.io/openems.io/)
   - This repository's [README.md](../README.md)

## Debug Mode

Enable debug logging:

```yaml
# In docker-compose.yml
services:
  openems-edge:
    environment:
      - LOG_LEVEL=DEBUG
```

Then check detailed logs:
```bash
docker compose restart openems-edge
docker compose logs -f openems-edge
```

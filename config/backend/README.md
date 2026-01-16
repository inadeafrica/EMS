# OpenEMS Backend Configuration

This directory is for OpenEMS Backend configuration files.

## Important Note

OpenEMS uses **Apache Felix OSGi configuration format** (`.config` files), not JSON files. The configuration is stored in `.config` files using Java properties format.

## How Configuration Works

1. **Default Configuration**: When you start the OpenEMS Backend container for the first time, it automatically creates default configuration files in the Docker volume `/var/opt/openems/config`.

2. **Viewing Configuration**: To see the current configuration:
   ```bash
   docker exec openems-backend ls -la /var/opt/openems/config
   ```

3. **Configuration is automatic**: The Backend is configured via environment variables in docker-compose.yml:
   - Database connection (PostgreSQL)
   - InfluxDB connection
   - API settings

## Metadata Configuration

The Backend also uses a `metadata.json` file for Edge device registration. This is automatically created with default demo edges.

## Learn More

- [OpenEMS Documentation](https://openems.github.io/openems.io/)
- [OpenEMS Backend Documentation](https://openems.github.io/openems.io/openems/latest/backend/index.html)
- Main project [README.md](../../README.md)

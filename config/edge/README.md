# OpenEMS Edge Configuration

This directory is for OpenEMS Edge configuration files.

## Important Note

OpenEMS uses **Apache Felix OSGi configuration format** (`.config` files), not JSON files. The configuration is stored in `.config` files using Java properties format.

## How Configuration Works

1. **Default Configuration**: When you start the OpenEMS Edge container for the first time, it automatically creates default configuration files in the Docker volume `/var/opt/openems/config`.

2. **Viewing Configuration**: To see the current configuration:
   ```bash
   docker exec openems-edge ls -la /var/opt/openems/config
   ```

3. **Customizing Configuration**: There are two ways to customize:

   ### Option A: Use the Web UI (Recommended)
   - Access the OpenEMS UI at http://localhost:8080
   - Go to Settings → Components
   - Add and configure components through the interface
   - Configuration is automatically saved to `.config` files

   ### Option B: Manual Configuration Files
   - Copy example files from this directory to create custom configs
   - Mount them in docker-compose.yml or copy into the running container
   - Restart the Edge service to apply changes

## Configuration File Format

OpenEMS configuration files use Apache Felix format:

```
:org.apache.felix.configadmin.revision:=L"1"
alias="Grid Meter"
enabled=B"true"
id="meter0"
port=I"502"
service.factoryPid="Simulator.GridMeter.Acting"
service.pid="Simulator.GridMeter.Acting.meter0"
```

## Example Components

See the `.example` files in this directory for common component configurations:
- Grid meters
- Battery systems
- Controllers
- Data sources

## Learn More

- [OpenEMS Documentation](https://openems.github.io/openems.io/)
- [OpenEMS Component Configuration](https://openems.github.io/openems.io/openems/latest/components/index.html)
- Main project [README.md](../../README.md)

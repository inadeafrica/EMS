# Energy Management System

An open-source Energy Management System built on **OpenEMS** (Open Energy Management System), an award-winning platform for managing renewable energy sources, battery storage, EV charging, and local grid interaction.

**This repository includes the complete OpenEMS source code** in the `src/` directory, allowing you to customize and extend the platform for your specific needs.

## 🎯 Quick Answers

**❓ Does this have a user interface?**  
✅ **YES!** Modern web UI with Angular/Ionic - real-time monitoring, analytics, and control.

**❓ Does this have mobile apps?**  
✅ **YES!** Native **Android** and **iOS** apps built with Capacitor, plus PWA support.

**❓ Is this multi-tenant?**  
✅ **YES!** Supports unlimited users and Edge devices with role-based access control.

👉 **[See detailed answers](docs/QUICK_ANSWERS.md)** | **[Complete UI Guide](docs/UI_GUIDE.md)**

## Repository Structure

This project uses a **monorepo architecture** - all components (UI, Edge, Backend) are in a single repository organized into logical folders. For details about this design choice and alternatives, see [REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md).

```
EMS/
├── src/                    # Complete OpenEMS source code (Java, TypeScript)
│   ├── edge/               # Edge component (organized)
│   │   └── io.openems.edge.* (192 Java modules)
│   ├── backend/            # Backend component (organized)
│   │   └── io.openems.backend.* (18 Java modules)
│   ├── common/             # Shared components (organized)
│   │   └── io.openems.common.* (5 shared modules)
│   ├── ui/                 # Web UI (Angular)
│   └── README.md           # Build and development guide
├── config/                 # Runtime configuration
│   ├── edge/               # Edge configuration
│   └── backend/            # Backend configuration
├── docker-compose.yml      # Docker orchestration
├── Makefile               # Convenience commands
└── Documentation files     # Comprehensive guides
```

## Features

- **Real-time Energy Monitoring**: Track energy consumption, production, and storage in real-time
- **Battery Management**: Optimize battery charging and discharging
- **Self-Consumption Optimization**: Maximize use of self-generated energy
- **Grid Interaction**: Manage energy flow between your system and the grid
- **Web-based UI**: Modern, responsive interface for monitoring and control
- **Mobile Apps**: Native Android and iOS applications with offline support
- **Multi-Tenancy**: Manage multiple sites and users with role-based access
- **Time-series Data Storage**: Historical data analysis with InfluxDB
- **Modular Architecture**: Easily extend with additional components
- **Simulation Mode**: Test configurations without physical hardware
- **Full Source Code**: Customize and build your own version

## Technology Stack

- **OpenEMS Edge**: Edge device controller for real-time management (Java)
- **OpenEMS Backend**: Central management server (Java/Spring Boot)
- **OpenEMS UI**: Web-based user interface (Angular/TypeScript)
- **PostgreSQL**: Relational database for configuration and metadata
- **InfluxDB**: Time-series database for energy data
- **Docker**: Containerized deployment

## Prerequisites

### For Docker Deployment (Pre-built Images)
- **Docker Desktop** (for Windows/macOS) or **Docker Engine** (for Linux)
  - Version 20.10 or higher
  - **Windows**: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  - **macOS**: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
  - **Linux**: [Install Docker Engine](https://docs.docker.com/engine/install/)
- Docker Compose (version 2.0 or higher, included with Docker Desktop)
- At least 4GB RAM
- 10GB free disk space

**Important for Windows/macOS**: Make sure Docker Desktop is running before executing `docker compose` commands. Look for the Docker icon in your system tray (Windows) or menu bar (macOS).

### For Building from Source
- Java Development Kit (JDK) 21 or later
- Gradle (included via wrapper)
- Node.js and npm (for UI)
- 20GB free disk space

## Quick Start (Docker Deployment)

1. **Clone the repository**
   ```bash
   git clone https://github.com/inadeafrica/EMS.git
   cd EMS
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your preferred settings
   ```

3. **Start the system**
   ```bash
   docker compose up -d
   ```
   
   **Troubleshooting**: If you get an error about unable to connect to Docker:
   - **Windows/macOS**: Make sure Docker Desktop is running (check system tray/menu bar)
   - **Linux**: Start Docker daemon with `sudo systemctl start docker`
   - See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md#docker-issues) for detailed solutions

4. **Access the web interface**
   
   Open your browser and navigate to:
   - OpenEMS UI: http://localhost:8080
   - InfluxDB UI: http://localhost:8086
   
   Default credentials for InfluxDB:
   - Username: admin
   - Password: adminpassword

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    OpenEMS UI (Port 8080)                │
│              Web Interface for Monitoring                │
└─────────────┬──────────────────────┬────────────────────┘
              │                      │
              ▼                      ▼
┌──────────────────────┐   ┌──────────────────────┐
│  OpenEMS Edge        │   │  OpenEMS Backend     │
│  (Port 8085)         │◄──┤  (Port 8084)         │
│  Edge Controller     │   │  Central Server      │
└──────────────────────┘   └──────────┬───────────┘
                                      │
                        ┌─────────────┴──────────────┐
                        ▼                            ▼
              ┌────────────────┐         ┌──────────────────┐
              │   PostgreSQL   │         │    InfluxDB      │
              │   (Port 5432)  │         │   (Port 8086)    │
              │   Config DB    │         │ Time-series Data │
              └────────────────┘         └──────────────────┘
```

## Configuration

OpenEMS uses the OSGi Configuration Admin Service for component configuration. Configuration is managed through the web-based user interface, not by manually editing files.

### Configuring via OpenEMS UI

1. **Access the UI**: Open http://localhost:8080 in your browser
2. **Navigate to Settings**: Click on the Edge device, then go to Settings
3. **Install Components**: Add and configure components like:
   - Energy sources (solar inverters, grid meters)
   - Storage systems (batteries, ESS)
   - Controllers (self-consumption optimization, peak shaving)
   - Meters and sensors

The UI provides a guided interface for:
- Selecting component types from available factories
- Configuring component-specific parameters
- Enabling/disabling components
- Managing component relationships

### Advanced Configuration

For advanced users, configuration can also be managed via:

- **Apache Felix Web Console**: Access at http://localhost:8085/system/console/configMgr
- **JSON-RPC API**: Programmatic configuration using `createComponentConfig` and `updateComponentConfig` methods

### Configuration Storage

OpenEMS automatically stores configuration in the `config/` directories (mounted to `/etc/openems` in containers). These files are managed by OSGi and should not be manually edited unless you understand the OSGi Configuration Admin format.

## Usage

### Starting the System

```bash
docker compose up -d
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f openems-edge
docker compose logs -f openems-backend
docker compose logs -f openems-ui
```

### Stopping the System

```bash
docker compose down
```

### Stopping and Removing Data

```bash
docker compose down -v
```

## Monitoring Energy Data

1. Access the OpenEMS UI at http://localhost:8080
2. View real-time energy flows
3. Check battery state of charge
4. Monitor grid consumption/feed-in
5. Review historical data and trends

## Data Visualization with InfluxDB

1. Access InfluxDB UI at http://localhost:8086
2. Login with credentials (admin/adminpassword)
3. Navigate to Data Explorer
4. Query energy data from the `energy_data` bucket
5. Create custom dashboards

Example InfluxDB query:
```flux
from(bucket: "energy_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "energy")
  |> filter(fn: (r) => r["_field"] == "power")
```

## Building from Source

To customize and build your own version of OpenEMS:

### Prerequisites
- **Java 21 or later** is required for building OpenEMS
- Check your Java version: `java -version`
- If Java 21 is not your default, you may need to set `JAVA_HOME`:
  ```bash
  export JAVA_HOME=/path/to/java-21
  export PATH=$JAVA_HOME/bin:$PATH
  ```

### Quick Build
Use the provided build script:
```bash
./build.sh
```

This script will:
- Automatically detect and use Java 21
- Clean previous builds
- Build all modules (excluding tests for faster builds)

### Manual Build

1. **Navigate to the source directory**
   ```bash
   cd src
   ```

2. **Build the project**
   ```bash
   # Build all modules (with Java 21)
   ./gradlew build
   
   # Build without tests (faster)
   ./gradlew build -x test
   
   # Build UI
   cd ui
   npm install
   npm run build
   ```

3. **Run in development mode**
   ```bash
   # Run Edge
   ./gradlew :io.openems.edge.application:runEdge
   
   # Run Backend
   ./gradlew :io.openems.backend.application:runBackend
   ```

For detailed build instructions, see [`src/README.md`](src/README.md).

## Customization

With the full source code included, you can:

- Add custom device drivers for specific hardware
- Implement custom control algorithms
- Modify the UI to match your branding
- Integrate with proprietary systems
- Add new energy management strategies
- Extend the API with custom endpoints

See the [OpenEMS Developer Documentation](https://openems.github.io/openems.io/openems/latest/development/overview.html) for guidance.

## Troubleshooting

### Services Not Starting

Check Docker logs:
```bash
docker compose logs
```

### Port Conflicts

If ports are already in use, modify the port mappings in `docker compose.yml` or `.env` file.

### Database Connection Issues

Ensure PostgreSQL is running:
```bash
docker compose ps postgres
```

Reset the database:
```bash
docker compose down -v
docker compose up -d
```

## Development

### Building Custom Components

OpenEMS supports custom components. Refer to the [OpenEMS documentation](https://openems.github.io/openems.io/openems/latest/introduction.html) for development guides.

### Running in Simulation Mode

The default Docker deployment includes simulated components for testing without physical hardware. To switch to real hardware:

1. Access the OpenEMS UI at http://localhost:8080
2. Navigate to Settings > Components
3. Remove or disable simulator components
4. Add real device drivers for your hardware (inverters, batteries, meters)
5. Configure device-specific parameters (IP addresses, Modbus settings, etc.)
6. Save and restart the Edge service if needed

Refer to the [OpenEMS documentation](https://openems.github.io/openems.io/openems/latest/introduction.html) for specific device driver configuration.

## Production Deployment

For production deployment:

1. **Change default passwords** in `.env` file
   ```bash
   cp .env.example .env
   # Edit .env and change all passwords and tokens
   ```

2. **Use secure tokens** for InfluxDB
   ```bash
   # Generate a strong token
   openssl rand -base64 32
   # Add to .env as INFLUXDB_TOKEN
   ```

3. **Enable SSL/TLS** for web interfaces
4. **Set up backups** for databases
5. **Configure firewall rules** to restrict access
6. **Use persistent volumes** for data storage
7. **Set up monitoring and alerting**

## Resources

### Documentation

- [UI_GUIDE.md](docs/UI_GUIDE.md) - **Complete UI guide, mobile apps, and multi-tenancy features**
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed system architecture and component descriptions
- [REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md) - Repository organization explanation (monorepo vs. multi-repo)
- [GETTING_STARTED.md](docs/GETTING_STARTED.md) - Step-by-step setup guide
- [EXAMPLES.md](docs/EXAMPLES.md) - Practical usage examples
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [SECURITY.md](SECURITY.md) - Security best practices

### OpenEMS Resources

- [OpenEMS Official Website](https://openems.io/)
- [OpenEMS Documentation](https://openems.github.io/openems.io/openems/latest/introduction.html)
- [OpenEMS GitHub Repository](https://github.com/OpenEMS/openems)
- [OpenEMS Community Forum](https://community.openems.io/)

## License

This project uses OpenEMS, which is licensed under the Eclipse Public License 2.0 (EPL-2.0).

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Check the [OpenEMS Community Forum](https://community.openems.io/)
- Review [OpenEMS Documentation](https://openems.github.io/openems.io/)
- Open an issue in this repository

## Acknowledgments

This project is built on [OpenEMS](https://openems.io/), an award-winning open-source Energy Management System developed by FENECON and the OpenEMS Association.
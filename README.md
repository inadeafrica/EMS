# Energy Management System

An open-source Energy Management System built on **OpenEMS** (Open Energy Management System), an award-winning platform for managing renewable energy sources, battery storage, EV charging, and local grid interaction.

**This repository includes the complete OpenEMS source code** in the `src/` directory, allowing you to customize and extend the platform for your specific needs.

## Repository Structure

This project uses a **monorepo architecture** - all components (UI, Edge, Backend) are in a single repository organized into logical folders. For details about this design choice and alternatives, see [REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md).

```
Energy-Management-System/
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
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB RAM
- 10GB free disk space

### For Building from Source
- Java Development Kit (JDK) 21 or later
- Gradle (included via wrapper)
- Node.js and npm (for UI)
- 20GB free disk space

## Quick Start (Docker Deployment)

1. **Clone the repository**
   ```bash
   git clone https://github.com/inadeafrica/Energy-Management-System.git
   cd Energy-Management-System
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

### Edge Configuration

The Edge device configuration is located in `config/edge/config.json.example`. Copy and modify it:

```bash
cp config/edge/config.json.example config/edge/config.json
```

This file defines:
- Energy sources (solar, grid, etc.)
- Storage systems (batteries)
- Controllers (self-consumption, etc.)
- Meters and sensors

### Backend Configuration

The Backend configuration is located in `config/backend/config.json.example`. Copy and modify it:

```bash
cp config/backend/config.json.example config/backend/config.json
```

This file defines:
- Database connections
- InfluxDB settings
- API configuration
- Logging levels

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

The default configuration includes simulated components for testing. To use real hardware:

1. Modify `config/edge/config.json`
2. Replace simulator components with real device drivers
3. Configure device-specific parameters
4. Restart the Edge service

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
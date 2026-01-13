# System Architecture

This document describes the architecture of the Energy Management System.

## Overview

The system consists of five main components running as Docker containers:

```
┌──────────────────────────────────────────────────────────────┐
│                        User Browser                           │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTP/WebSocket
               ▼
┌──────────────────────────────────────────────────────────────┐
│                    OpenEMS UI Container                       │
│                      (nginx, port 8080)                       │
└──────────────┬──────────────────────┬────────────────────────┘
               │ REST/WS              │ REST/WS
               ▼                      ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  OpenEMS Edge Container │   │ OpenEMS Backend         │
│  (Java, port 8085)      │   │ Container               │
│                         │◄──┤ (Java, port 8084)       │
│  - Device Control       │   │                         │
│  - Real-time Logic      │   │ - Central Management    │
│  - Data Collection      │   │ - API Server            │
│  - Controllers          │   │ - Data Aggregation      │
└─────────────────────────┘   └──────────┬──────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │                                 │
                        ▼                                 ▼
              ┌──────────────────┐           ┌──────────────────┐
              │   PostgreSQL     │           │    InfluxDB      │
              │   Container      │           │    Container     │
              │   (port 5432)    │           │   (port 8086)    │
              │                  │           │                  │
              │ - Configuration  │           │ - Time-series    │
              │ - Metadata       │           │ - Energy Data    │
              │ - User Data      │           │ - Measurements   │
              └──────────────────┘           └──────────────────┘
```

## Components

### 1. OpenEMS UI (Port 8080)

**Technology**: Angular, TypeScript, nginx

**Purpose**: Web-based user interface for monitoring and control

**Key Features**:
- Real-time energy flow visualization
- Dashboard with live data
- Configuration interface
- Historical data charts
- Alert notifications

**Data Flow**:
- Receives live data from Edge via WebSocket
- Fetches historical data from Backend REST API
- Sends configuration changes to Edge/Backend

### 2. OpenEMS Edge (Port 8085)

**Technology**: Java, OSGi framework, Apache Felix

**Purpose**: Edge device controller for real-time energy management

**Key Features**:
- Device driver integration (inverters, batteries, meters)
- Real-time control algorithms
- Data acquisition and preprocessing
- Local decision making
- Simulation support

**Components**:
- **Simulators**: Virtual devices for testing
- **Meters**: Grid, production, consumption meters
- **ESS (Energy Storage System)**: Battery management
- **Controllers**: Self-consumption, peak shaving, etc.
- **Channels**: Data points (power, voltage, current, etc.)

**Data Flow**:
- Reads from physical devices or simulators
- Executes control logic every cycle (typically 1 second)
- Sends data to Backend for storage
- Responds to UI requests

### 3. OpenEMS Backend (Port 8084)

**Technology**: Java, Spring Boot

**Purpose**: Central management server

**Key Features**:
- Multi-edge management
- Data aggregation and storage
- REST API for external integration
- User authentication and authorization
- Alert management
- Reporting

**Data Flow**:
- Receives real-time data from Edge devices
- Stores configuration in PostgreSQL
- Stores time-series data in InfluxDB
- Provides data to UI
- Exposes REST API for third-party integration

### 4. PostgreSQL (Port 5432)

**Technology**: PostgreSQL 15

**Purpose**: Relational database for configuration and metadata

**Stored Data**:
- System configuration
- User accounts and permissions
- Edge device registry
- Component metadata
- Alert rules

**Why PostgreSQL**:
- ACID compliance for configuration data
- Relational data model fits configuration structure
- Mature and reliable
- Good performance for metadata queries

### 5. InfluxDB (Port 8086)

**Technology**: InfluxDB 2.7

**Purpose**: Time-series database for energy data

**Stored Data**:
- Energy measurements (power, energy, voltage, current)
- State of charge
- Temperature readings
- Efficiency metrics
- Performance statistics

**Why InfluxDB**:
- Optimized for time-series data
- Efficient storage with compression
- Fast queries for time ranges
- Built-in retention policies
- Flux query language for analysis

## Data Flow

### Real-time Data Flow

1. **Collection** (every second):
   - Edge reads from devices/simulators
   - Measures: power, voltage, current, SoC, etc.

2. **Processing**:
   - Edge executes control logic
   - Calculates derived values
   - Makes control decisions

3. **Transmission**:
   - Edge sends to Backend via WebSocket
   - Backend receives and validates

4. **Storage**:
   - Backend writes to InfluxDB
   - Time-series data stored efficiently

5. **Display**:
   - UI subscribes to real-time data
   - WebSocket pushes updates to browser
   - Dashboard updates every second

### Historical Data Flow

1. **Query Request**:
   - User requests historical data in UI
   - UI sends query to Backend

2. **Data Retrieval**:
   - Backend queries InfluxDB
   - Aggregates data as needed (avg, sum, etc.)

3. **Response**:
   - Backend sends data to UI
   - UI renders charts and tables

## Communication Protocols

### REST API

- **Edge API** (Port 8085): Configuration and control
- **Backend API** (Port 8084): Data access and management
- **InfluxDB API** (Port 8086): Direct time-series queries

### WebSocket

- **Real-time Data**: Edge ↔ Backend ↔ UI
- **Live Updates**: Push notifications
- **Bidirectional**: Commands and data

## Network Architecture

### Internal Network

All containers communicate via Docker bridge network `openems-network`:

- DNS resolution: containers can use service names
- Isolated from host network
- Low latency communication

### External Access

Exposed ports for external access:
- `8080`: Web UI (public)
- `8084`: Backend API (can be restricted)
- `8085`: Edge API (should be restricted)
- `8086`: InfluxDB UI/API (can be restricted)

## Scalability

### Horizontal Scaling

- **Multiple Edge Devices**: One Backend can manage many Edge devices
- **Load Balancing**: UI can be replicated with load balancer
- **Database Replication**: PostgreSQL and InfluxDB support clustering

### Vertical Scaling

- **Edge**: Increase CPU for faster control cycles
- **Backend**: Increase memory for data caching
- **InfluxDB**: Increase storage for longer retention

## Security

### Authentication

- Backend authenticates Edge devices
- UI requires user login (when configured)
- InfluxDB token-based authentication

### Network Security

- All internal communication via private network
- TLS/SSL recommended for production
- Firewall rules for port access

### Data Security

- Encrypted communication channels
- Database access restricted to Backend
- Secure credential storage

## Performance

### Latency

- **Edge Control Cycle**: 1 second
- **Data Transmission**: Near real-time (< 2 seconds)
- **UI Updates**: 1-2 seconds
- **Historical Queries**: Depends on time range and aggregation

### Throughput

- **Edge**: Handles 100+ data points per second
- **Backend**: Manages 10+ Edge devices
- **InfluxDB**: Millions of data points per day

## Monitoring

### Health Checks

Docker Compose can be configured with health checks:
- Check if services are responding
- Automatic restart on failure

### Logs

Each component logs to stdout:
```bash
docker-compose logs -f [service_name]
```

### Metrics

- InfluxDB stores system metrics
- Monitor disk usage, memory, CPU
- Alert on anomalies

## Deployment Options

### Development

- All containers on single host
- Minimal resources
- Default ports

### Production

- Separate hosts for services
- Load balancing for UI
- Database clustering
- Backup and disaster recovery
- SSL/TLS encryption
- Monitoring and alerting

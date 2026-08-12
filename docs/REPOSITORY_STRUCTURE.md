# Repository Structure Guide

## Question: Multiple Repos or Grouped Folders?

Based on the architecture described in [ARCHITECTURE.md](ARCHITECTURE.md), this document clarifies the repository organization strategy for the Energy Management System.

## Current Structure

The system uses a **monorepo approach** with all source code organized in a single repository:

```
EMS/
├── src/
│   ├── io.openems.edge.*      (192 Edge modules, flat under src/)
│   ├── io.openems.backend.*   (18 Backend modules, flat under src/)
│   ├── io.openems.common.*, io.openems.shared.*, io.openems.wrapper, io.openems.oem.* (5 modules, flat under src/)
│   ├── cnf/                   (bnd workspace configuration)
│   └── ui/                    (Angular web application)
├── config/
│   ├── edge/
│   └── backend/
└── [documentation files]
```

**Structure Implemented**: The repository follows **Option A** (Monorepo), with all `io.openems.*` bundle modules kept as **flat, direct children of `src/`**.

> **Why flat and not grouped into `edge/`, `backend/`, `common/` subfolders?** This project's Java/OSGi build uses the [bnd](https://bnd.bio/) Gradle "workspace" plugin (`biz.aQute.bnd.workspace`), which locates each bundle project by scanning the direct children of the workspace root (the directory containing `cnf/`) — it does not follow Gradle's own `projectDir` overrides. Grouping bundles into subfolders (as previously attempted) makes bnd unable to find any of them, silently disabling compilation for every module (`./gradlew build` "succeeds" but does nothing). Keeping every `io.openems.*` module as a direct sibling of `cnf/` is a hard requirement of the build tooling, not just a style preference.

## Architecture Components

According to the system architecture, there are **three main components**:

### 1. OpenEMS UI (Port 8080)
- **Technology**: Angular, TypeScript, nginx
- **Location**: `src/ui/`
- **Purpose**: Web-based user interface

### 2. OpenEMS Edge (Port 8085)
- **Technology**: Java, OSGi framework
- **Location**: `src/io.openems.edge.*` (192 modules)
- **Purpose**: Edge device controller for real-time energy management

### 3. OpenEMS Backend (Port 8084)
- **Technology**: Java, Spring Boot
- **Location**: `src/io.openems.backend.*` (18 modules)
- **Purpose**: Central management server

## Organizational Options

### Option A: Monorepo, Flat Bundle Layout ✅ **IMPLEMENTED**

**Implemented Structure:**
```
EMS/
├── src/
│   ├── io.openems.edge.*      [All Edge modules, flat under src/]
│   ├── io.openems.backend.*   [All Backend modules, flat under src/]
│   ├── io.openems.common.*, io.openems.shared.*, ... [Shared modules, flat under src/]
│   ├── cnf/                   [bnd workspace configuration]
│   └── ui/
│       └── [Angular application]
├── config/
├── docs/
└── docker-compose.yml
```

The bundles are kept flat (not grouped into `edge/`/`backend/`/`common/` subfolders) because the bnd Gradle workspace plugin requires every module to be a direct child of `src/`, as explained above.

**Advantages:**
- ✅ Single source of truth
- ✅ Easier to maintain dependencies between components
- ✅ Simpler CI/CD pipeline
- ✅ Atomic commits across all components
- ✅ Single issue tracker
- ✅ Easier to ensure version compatibility
- ✅ Reduced overhead (one repo to clone/manage)
- ✅ **Clear organization by component type**

**Disadvantages:**
- ❌ Larger repository size
- ❌ All developers have access to all code
- ❌ Longer build times if building everything

**When to use:**
- Components are tightly coupled
- Same team works on multiple components
- Need coordinated releases
- Development and deployment happen together

### Option B: Multiple Separate Repositories

**Structure:**
```
openems-ui/              (separate repo)
openems-edge/            (separate repo)
openems-backend/         (separate repo)
openems-common/          (separate repo)
openems-deployment/      (Docker configs, separate repo)
```

**Advantages:**
- ✅ Clear separation of concerns
- ✅ Independent versioning and releases
- ✅ Smaller, focused repositories
- ✅ Team-specific access control
- ✅ Independent CI/CD pipelines
- ✅ Faster clone and build times per component

**Disadvantages:**
- ❌ Complex dependency management
- ❌ Difficult to make atomic changes across components
- ❌ Multiple PRs needed for related changes
- ❌ Version compatibility challenges
- ❌ More complex setup for developers
- ❌ Coordination overhead between repos

**When to use:**
- Components are loosely coupled
- Different teams own different components
- Components have different release cycles
- Need strict access control per component

### Option C: Hybrid Approach

**Structure:**
```
EMS/ (main repo)
├── ui/           -> submodule to openems-ui repo
├── edge/         -> submodule to openems-edge repo
├── backend/      -> submodule to openems-backend repo
├── common/       -> submodule to openems-common repo
└── docker-compose.yml
```

**Advantages:**
- ✅ Combines benefits of both approaches
- ✅ Components can be developed independently
- ✅ Main repo provides integration point

**Disadvantages:**
- ❌ Added complexity of git submodules
- ❌ Submodule management overhead
- ❌ Learning curve for developers

## Recommendation for This Project

### ✅ **Recommended: Option A - Monorepo, Flat Bundle Layout**

**Rationale:**

1. **Current State**: The project already uses a monorepo (all code in `src/`)
2. **Tight Integration**: The three components (UI, Edge, Backend) are tightly integrated and communicate via REST/WebSocket
3. **Coordinated Releases**: All components need to be version-compatible
4. **Shared Dependencies**: Common modules are used across components
5. **Single Team**: Appears to be managed by a single team/organization
6. **Deployment Together**: Docker Compose deploys all components together

**Implementation:**

```
EMS/
├── src/
│   ├── ui/                              (Angular application)
│   │
│   ├── io.openems.edge.application/     (Edge modules, flat under src/)
│   ├── io.openems.edge.battery.*/
│   ├── io.openems.edge.controller.*/
│   ├── io.openems.edge.ess.*/
│   ├── [190+ other edge modules]
│   │
│   ├── io.openems.backend.application/  (Backend modules, flat under src/)
│   ├── io.openems.backend.core/
│   ├── io.openems.backend.timedata.*/
│   ├── [15+ other backend modules]
│   │
│   ├── io.openems.common/               (Shared modules, flat under src/)
│   ├── io.openems.common.bridge.http/
│   │
│   └── cnf/                             (bnd workspace configuration)
│
├── config/
│   ├── edge/
│   └── backend/
│
├── docs/
│   └── [All documentation]
│
└── docker-compose.yml
```

**Note on grouping bundles into `edge/`/`backend/`/`common/` subfolders:** this was tried previously and reverted, because it silently breaks the build. The `biz.aQute.bnd.workspace` Gradle plugin discovers bundle projects by scanning the direct children of `src/` (the bnd workspace root) — it has no concept of Gradle's `projectDir` overrides. Nesting a bundle one level deeper makes bnd unable to locate it, so every module quietly loses its compile/assemble/test tasks while `./gradlew build` still reports success (it's only building the otherwise-empty root project). If closer visual grouping is wanted later, it needs to happen outside the bnd workspace scan path — e.g. an IDE working-set/filter, not a directory move — never a physical relocation of the `io.openems.*` module folders.

## Current Answer to Your Question

**Q: Based on the Architecture, it appears that we'll have to create multiple repos or grouped folders for each of the UI, Edge and Backend. Correct?**

**A: You have two valid options:**

1. **Keep the current monorepo structure** (Recommended)
   - All code stays in one repository
   - Optionally organize better with grouped folders within `src/`
   - This is already what you have and it works well for this type of system

2. **Create multiple repositories** (Alternative)
   - Create separate repos for UI, Edge, Backend
   - More complex but provides independent versioning
   - Requires more coordination overhead

**The answer is NOT that you "have to" do either one** - it's a design choice based on your team structure, workflow, and preferences. For this project, the monorepo approach (what you currently have) is recommended because:
- Components are tightly integrated
- Same team likely works on all components  
- Coordinated releases are needed
- Current structure already supports this

## Independent Component Deployment

One of the common questions about monorepo structure is: **"How can I deploy individual components without deploying everything?"**

Even in a monorepo, you can deploy components independently. Here are the strategies:

### Strategy 1: Docker Compose Service Selection

Deploy only specific services using Docker Compose:

```bash
# Deploy only Edge component
docker compose up -d openems-edge

# Deploy only Backend and its dependencies
docker compose up -d openems-backend postgres influxdb

# Deploy only UI and its dependencies
docker compose up -d openems-ui openems-backend postgres

# Deploy Edge and Backend without UI
docker compose up -d openems-edge openems-backend postgres influxdb
```

**Stop specific services:**
```bash
# Stop only Edge
docker compose stop openems-edge

# Restart only Backend
docker compose restart openems-backend
```

### Strategy 2: Multiple Docker Compose Files

Create separate compose files for different deployment scenarios:

**docker-compose.edge.yml** (Edge only):
```yaml
services:
  openems-edge:
    image: openems/edge:latest
    # ... edge configuration
```

**docker-compose.backend.yml** (Backend only):
```yaml
services:
  openems-backend:
    image: openems/backend:latest
    # ... backend configuration
  postgres:
    # ... postgres configuration
  influxdb:
    # ... influxdb configuration
```

Deploy using:
```bash
# Deploy only Edge
docker compose -f docker-compose.edge.yml up -d

# Deploy only Backend
docker compose -f docker-compose.backend.yml up -d
```

### Strategy 3: Build-Specific Docker Images

Build Docker images for specific components from the monorepo:

```bash
# Build only Edge image
cd src
docker build -f Dockerfile.edge -t my-org/edge:latest .

# Build only Backend image
docker build -f Dockerfile.backend -t my-org/backend:latest .

# Build only UI image
cd ui
docker build -t my-org/ui:latest .
```

**Create component-specific Dockerfiles:**

**Dockerfile.edge**:
```dockerfile
FROM gradle:8-jdk21 AS builder
WORKDIR /build
COPY io.openems.edge.* ./
COPY io.openems.common* ./
RUN gradle :io.openems.edge.application:build

FROM eclipse-temurin:21-jre
COPY --from=builder /build/io.openems.edge.application/generated/*.jar /app/
CMD ["java", "-jar", "/app/openems-edge.jar"]
```

### Strategy 4: Selective Build and Deploy with Makefile

Add component-specific targets to the Makefile:

```makefile
# Deploy only Edge
start-edge:
	docker compose up -d openems-edge
	@echo "✓ Edge service started"

# Deploy only Backend with dependencies
start-backend:
	docker compose up -d openems-backend postgres influxdb
	@echo "✓ Backend services started"

# Deploy only UI with dependencies
start-ui:
	docker compose up -d openems-ui openems-backend postgres
	@echo "✓ UI services started"

# Build only Edge from source
build-edge:
	cd src && ./gradlew :io.openems.edge.application:build
	@echo "✓ Edge built"

# Build only Backend from source
build-backend:
	cd src && ./gradlew :io.openems.backend.application:build
	@echo "✓ Backend built"

# Build only UI from source
build-ui:
	cd src/ui && npm install && npm run build
	@echo "✓ UI built"
```

Usage:
```bash
make start-edge      # Deploy only Edge
make start-backend   # Deploy only Backend stack
make build-edge      # Build only Edge from source
```

### Strategy 5: CI/CD Pipeline with Path-Based Triggers

Configure CI/CD to build/deploy only changed components:

**GitHub Actions example** (.github/workflows/deploy.yml):
```yaml
name: Selective Deploy

on:
  push:
    paths:
      - 'src/io.openems.edge.**'
      - 'src/io.openems.backend.**'
      - 'src/ui/**'

jobs:
  deploy-edge:
    if: contains(github.event.head_commit.modified, 'io.openems.edge')
    runs-on: ubuntu-latest
    steps:
      - name: Build and Deploy Edge
        run: |
          # Build Edge component
          # Deploy Edge component

  deploy-backend:
    if: contains(github.event.head_commit.modified, 'io.openems.backend')
    runs-on: ubuntu-latest
    steps:
      - name: Build and Deploy Backend
        run: |
          # Build Backend component
          # Deploy Backend component

  deploy-ui:
    if: contains(github.event.head_commit.modified, 'src/ui')
    runs-on: ubuntu-latest
    steps:
      - name: Build and Deploy UI
        run: |
          # Build UI component
          # Deploy UI component
```

### Strategy 6: Gradle Selective Build

The monorepo uses Gradle, which supports building specific modules:

```bash
# Build only Edge modules
cd src
./gradlew :io.openems.edge.application:build

# Build only Backend modules
./gradlew :io.openems.backend.application:build

# Build specific Edge controller
./gradlew :io.openems.edge.controller.ess.cycle:build

# Build all Edge modules
./gradlew tasks --all | grep "io.openems.edge" | xargs ./gradlew
```

### Summary: Independent Deployment in Monorepo

| Deployment Need | Solution |
|----------------|----------|
| Deploy single service | `docker compose up -d [service-name]` |
| Deploy service group | Create separate compose files |
| Build specific component | Use Gradle selective build |
| CI/CD selective deploy | Path-based pipeline triggers |
| Production isolation | Build component-specific images |
| Development workflow | Makefile component targets |

**Key Insight**: Monorepo does NOT mean "deploy everything together." You have full control over:
- What to build (Gradle selective builds)
- What to deploy (Docker Compose service selection)
- When to deploy (CI/CD path triggers)
- Where to deploy (Component-specific images)

The monorepo structure **enables** independent deployment while maintaining the benefits of unified source control and coordinated releases when needed.

## Best Practices

Regardless of which option you choose:

### For Monorepo:
- Use clear folder structure
- Document component boundaries
- Use build tools that support monorepos (Gradle multi-project, npm workspaces)
- Implement proper CI/CD for selective builds
- Use code owners for component-specific reviews
- **Create component-specific deployment scripts**
- **Use Docker Compose service selection for independent deployment**

### For Multiple Repos:
- Define clear APIs between components
- Use semantic versioning strictly
- Automate dependency updates
- Document integration points
- Create comprehensive API documentation
- Use a deployment repo for orchestration

## References

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system architecture
- [README.md](../README.md) - Project overview and setup
- [OpenEMS Documentation](https://openems.github.io/openems.io/) - Upstream project docs

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-14 | Continue with monorepo | System components tightly integrated, same team, coordinated releases needed |
| 2026-08-12 | Reverted `edge/`/`backend/`/`common/` subfolder grouping; bundles kept flat under `src/` | Grouping broke the bnd Gradle workspace's project discovery, silently disabling compilation for every `io.openems.*` module |

## Conclusion

The current monorepo structure is appropriate for this Energy Management System. The three architectural components (UI, Edge, Backend) can coexist in a single repository. There is **no requirement** to create multiple repositories unless your team structure or development workflow specifically benefits from that approach. Within `src/`, the `io.openems.*` bundle modules must stay flat (direct children of `src/`) — this is a hard constraint of the bnd Gradle workspace tooling, not a style choice.

**Current Status**: ✅ Monorepo with all components in `src/`, bundles flat per the bnd workspace requirement - **This works well for this project**

**Recommendation**: Keep the monorepo and the flat bundle layout. Do not move `io.openems.*` module folders into subdirectories.

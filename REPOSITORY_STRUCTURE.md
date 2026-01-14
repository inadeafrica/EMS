# Repository Structure Guide

## Question: Multiple Repos or Grouped Folders?

Based on the architecture described in [ARCHITECTURE.md](ARCHITECTURE.md), this document clarifies the repository organization strategy for the Energy Management System.

## Current Structure

The system currently uses a **monorepo approach** with all source code in a single repository:

```
Energy-Management-System/
├── src/
│   ├── io.openems.edge.*      (192 Edge modules)
│   ├── io.openems.backend.*   (18 Backend modules)
│   ├── io.openems.common.*    (2 Common modules)
│   └── ui/                    (1 UI application)
├── config/
│   ├── edge/
│   └── backend/
└── [documentation files]
```

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

### Option A: Monorepo with Grouped Folders (Recommended)

**Structure:**
```
Energy-Management-System/
├── ui/
│   └── [Angular application]
├── edge/
│   └── [All Edge modules: io.openems.edge.*]
├── backend/
│   └── [All Backend modules: io.openems.backend.*]
├── common/
│   └── [Shared modules: io.openems.common.*]
├── config/
├── docs/
└── docker-compose.yml
```

**Advantages:**
- ✅ Single source of truth
- ✅ Easier to maintain dependencies between components
- ✅ Simpler CI/CD pipeline
- ✅ Atomic commits across all components
- ✅ Single issue tracker
- ✅ Easier to ensure version compatibility
- ✅ Reduced overhead (one repo to clone/manage)

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
Energy-Management-System/ (main repo)
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

### ✅ **Recommended: Option A - Monorepo with Grouped Folders**

**Rationale:**

1. **Current State**: The project already uses a monorepo (all code in `src/`)
2. **Tight Integration**: The three components (UI, Edge, Backend) are tightly integrated and communicate via REST/WebSocket
3. **Coordinated Releases**: All components need to be version-compatible
4. **Shared Dependencies**: Common modules are used across components
5. **Single Team**: Appears to be managed by a single team/organization
6. **Deployment Together**: Docker Compose deploys all components together

**Implementation Plan:**

The current structure is already a monorepo, but organizing it better would improve clarity:

```
Energy-Management-System/
├── src/
│   ├── ui/                              (Already organized)
│   │   └── [Angular application]
│   │
│   ├── edge/                            (New organization)
│   │   ├── io.openems.edge.application/
│   │   ├── io.openems.edge.battery.*/
│   │   ├── io.openems.edge.controller.*/
│   │   ├── io.openems.edge.ess.*/
│   │   └── [190+ other edge modules]
│   │
│   ├── backend/                         (New organization)
│   │   ├── io.openems.backend.application/
│   │   ├── io.openems.backend.core/
│   │   ├── io.openems.backend.timedata.*/
│   │   └── [15+ other backend modules]
│   │
│   └── common/                          (New organization)
│       ├── io.openems.common/
│       └── io.openems.common.bridge.http/
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

## Migration Strategy

If you decide to reorganize the current structure:

### Phase 1: Documentation Update (Minimal Risk)
1. Update ARCHITECTURE.md to clarify the monorepo structure
2. Add this REPOSITORY_STRUCTURE.md document
3. Update README.md to reference the structure

### Phase 2: Logical Organization (Optional)
1. Move components into organized folders within `src/`
2. Update build configuration (Gradle, etc.)
3. Update Docker build contexts
4. Update documentation references

### Phase 3: Validation
1. Verify all builds work
2. Test Docker Compose deployment
3. Validate CI/CD pipelines

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

## Best Practices

Regardless of which option you choose:

### For Monorepo:
- Use clear folder structure
- Document component boundaries
- Use build tools that support monorepos (Gradle multi-project, npm workspaces)
- Implement proper CI/CD for selective builds
- Use code owners for component-specific reviews

### For Multiple Repos:
- Define clear APIs between components
- Use semantic versioning strictly
- Automate dependency updates
- Document integration points
- Create comprehensive API documentation
- Use a deployment repo for orchestration

## References

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system architecture
- [README.md](README.md) - Project overview and setup
- [OpenEMS Documentation](https://openems.github.io/openems.io/) - Upstream project docs

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-14 | Continue with monorepo | System components tightly integrated, same team, coordinated releases needed |

## Conclusion

The current monorepo structure is appropriate for this Energy Management System. The three architectural components (UI, Edge, Backend) can coexist in a single repository with organized folders. There is **no requirement** to create multiple repositories unless your team structure or development workflow specifically benefits from that approach.

**Current Status**: ✅ Monorepo with all components in `src/` - **This works well for this project**

**Recommendation**: Keep the monorepo, optionally improve folder organization for better clarity.

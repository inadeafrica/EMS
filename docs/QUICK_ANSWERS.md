# Quick Answers: UI, Mobile Apps, and Multi-Tenancy

This document provides direct answers to common questions about OpenEMS UI, mobile applications, and multi-tenancy support.

---

## Question 1: What UI and functionalities does this app have?

### User Interface

OpenEMS has a **modern web-based UI** built with:
- **Angular 20.3.x** (frontend framework)
- **Ionic 8.7.x** (mobile-ready components)
- **Chart.js** (data visualization)
- **Responsive design** (works on desktop, tablet, mobile)

### Main Screens and Functionalities

#### 1. **Overview Dashboard**
- View all connected Edge devices
- Quick status overview (online/offline)
- Energy production/consumption summary
- Battery state of charge
- System alerts
- Filter and search devices

#### 2. **Live Monitoring** 
Real-time energy monitoring with:
- **Energy Flow Diagram**: Visual sankey diagram showing energy flows between:
  - Solar/PV production
  - Grid connection (import/export)
  - Battery storage (charge/discharge)
  - House consumption
  
- **Storage View**: Battery management
  - State of charge (%)
  - Current power (W)
  - Voltage, current, temperature
  - Charge/discharge status
  
- **Controllers**: Configure and monitor:
  - Self-consumption optimization
  - Peak shaving
  - EV charging stations (EVCS/EVSE)
  - Heat pump control
  - Grid feed-in management
  - Time-based scheduling

#### 3. **History & Analytics**
Historical data visualization:
- Energy production over time
- Consumption patterns
- Battery usage analysis
- Grid import/export statistics
- Custom date range selection
- Multiple chart types (line, bar, stacked)
- Data export (CSV, PNG)
- Zoom and pan capabilities

#### 4. **Settings & Configuration**
System configuration:
- Component management (add/remove/configure)
- Controller settings
- Network configuration
- Alert rules and notifications
- User profile
- System logs
- Channel inspector (for debugging)
- JSON-RPC test tool

#### 5. **Information**
- System version info
- Component versions
- License information
- Changelog
- About dialog

### Key Features

✅ **Real-time Updates**: Data refreshes every 1 second via WebSocket
✅ **Multi-language**: English, German (extensible to others)
✅ **Dark/Light Themes**: Customizable appearance
✅ **Offline Support**: PWA enables offline viewing of cached data
✅ **Data Export**: Export historical data as CSV or charts as PNG
✅ **Responsive**: Adapts to any screen size
✅ **Role-based Access**: Different views for Admin, Owner, Installer, Guest

---

## Question 2: Does this code have an Android app for OpenEMS?

### **YES! OpenEMS has both Android AND iOS apps!** 📱

The UI is built with **Ionic Framework** and **Capacitor**, which creates **native mobile applications** for both platforms.

### Mobile App Details

**Location**: `/src/ui/android/` (Android) and `/src/ui/ios/` (iOS)

**Technology**:
- **Capacitor 7.4.x**: Native app wrapper
- **Ionic 8.7.x**: Mobile UI framework
- Same Angular codebase as web version
- Native device features access

### Native Mobile Features

The mobile apps include:

✅ **Native Splash Screen**: Branded startup screen
✅ **Secure Storage**: Credentials stored in device keychain
✅ **File System Access**: Save and open reports/exports
✅ **Offline Mode**: View cached data without internet
✅ **Push Notifications**: Real-time alerts (configurable)
✅ **Native File Opener**: Open exports with device apps
✅ **Biometric Auth**: Fingerprint/Face ID support (configurable)

### Building the Android App

Quick build instructions:

```bash
# 1. Navigate to UI directory
cd src/ui

# 2. Install dependencies
npm install

# 3. Build for Android
NODE_ENV=openems ionic cap build android -c "openems,openems-backend-deploy-app"

# 4. Build release APK
cd android
./gradlew assembleRelease

# 5. Install on device
./gradlew installRelease
```

### Building the iOS App

Quick build instructions:

```bash
# 1. Navigate to UI directory
cd src/ui

# 2. Build for iOS
NODE_ENV=openems ionic cap build ios -c "openems,openems-backend-deploy-app"

# 3. Open in Xcode
ionic cap open ios

# 4. Build and run from Xcode
# (Configure signing, then click Run)
```

### Distribution

**Android**:
- Google Play Store (`.aab` bundle)
- Direct installation (`.apk` file)
- Internal testing

**iOS**:
- Apple App Store
- TestFlight (beta testing)
- Enterprise distribution

### Progressive Web App (PWA)

In addition to native apps, the UI can be **installed as a PWA**:
- Works on all modern browsers
- Install from browser menu
- Offline capability
- Home screen icon
- No app store needed

**Conclusion**: Yes, OpenEMS has full native mobile apps for both Android and iOS, plus PWA support!

---

## Question 3: Is this multi-tenanted?

### **YES! OpenEMS is fully multi-tenanted!** 🏢

The Backend component is designed to support multiple users and multiple Edge devices, making it inherently multi-tenant.

### Multi-Tenancy Architecture

```
OpenEMS Backend (Central Server)
├── Multiple Users (with roles)
├── Multiple Edge Devices (unlimited)
├── User-Edge Access Control
└── Data Isolation per Edge
```

### Multi-Tenancy Features

#### 1. **Multiple Edge Devices**
- Backend can manage **unlimited Edge installations**
- Each Edge has unique identifier
- Independent configuration per Edge
- Centralized monitoring dashboard

#### 2. **Multiple Users**
- Unlimited user accounts
- User registration and authentication
- Session management
- Password management

#### 3. **Role-Based Access Control (RBAC)**

Four permission levels:

| Role | Description | Access |
|------|-------------|--------|
| **Admin** | Full system access | All features, system config, user management |
| **Owner** | System owner | Monitor, configure controllers, view data |
| **Installer** | Service technician | Monitor, diagnose, limited config |
| **Guest** | Read-only | View live data and history only |

#### 4. **User-Edge Associations**
- Users assigned to specific Edge devices
- One user can access multiple Edges
- One Edge can have multiple users
- Flexible access control

#### 5. **Data Isolation**
- Each Edge's data stored separately
- Tagged with Edge ID in InfluxDB
- Backend enforces access control
- No cross-tenant data leakage

### Metadata Implementations

OpenEMS supports different metadata backends for user/edge management:

1. **File-based** (`metadata.file`): Simple file storage for small deployments
2. **Odoo ERP** (`metadata.odoo`): Enterprise integration for large-scale multi-tenancy
3. **Dummy** (`metadata.dummy`): In-memory for testing

### Enterprise Multi-Tenancy (Odoo Integration)

For large-scale deployments, OpenEMS integrates with **Odoo ERP**:

**Features**:
- Customer/tenant management
- Billing and invoicing
- Contract management
- Service level agreements (SLA)
- Support ticket system
- Advanced user hierarchies
- Multi-company support

**Use Case**: Energy service providers managing hundreds or thousands of customer sites

### Real-World Multi-Tenancy Scenarios

#### Scenario 1: Residential Solar Installer
- **Setup**: 50+ homeowner customers
- **Edges**: One per home (50+ devices)
- **Users**: Homeowners (view own) + Installer team (view all)
- **Use Case**: Installer monitors all installations, homeowners see only their system

#### Scenario 2: Commercial Building Management
- **Setup**: Office building with multiple tenants
- **Edges**: One per floor or tenant space
- **Users**: Building manager (all) + Individual tenants (own space only)
- **Use Case**: Centralized energy management with tenant-level access

#### Scenario 3: Energy Service Provider
- **Setup**: Energy company with 500+ customers
- **Edges**: 500+ installations
- **Users**: Customers + Support team + Management
- **Use Case**: Full enterprise EMS platform with Odoo integration

#### Scenario 4: Multi-Site Organization
- **Setup**: Corporation with multiple facilities
- **Edges**: One per location (factories, warehouses, offices)
- **Users**: Corporate energy manager + Local operators
- **Use Case**: Enterprise energy management across all facilities

### How It Works

1. **Edge Registration**:
   - Edge device contacts Backend
   - Backend authenticates and registers Edge
   - Unique Edge ID assigned

2. **User Access**:
   - User logs into UI
   - Backend authenticates user
   - Backend returns list of Edges user can access
   - User selects Edge to monitor

3. **Data Security**:
   - All queries filtered by user permissions
   - Each Edge's data isolated
   - No unauthorized access possible

### Permission Matrix

| Feature | Admin | Owner | Installer | Guest |
|---------|-------|-------|-----------|-------|
| Live Monitoring | ✅ | ✅ | ✅ | ✅ |
| History Charts | ✅ | ✅ | ✅ | ✅ |
| Controller Config | ✅ | ✅ | ✅ | ❌ |
| Component Management | ✅ | ✅ | ✅ | ❌ |
| System Settings | ✅ | ⚠️ Limited | ⚠️ Limited | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| System Execute | ✅ | ❌ | ❌ | ❌ |

**Conclusion**: Yes, OpenEMS is fully multi-tenanted with support for unlimited users, unlimited Edge devices, role-based access control, and enterprise-grade features!

---

## Summary

### Quick Answers

**Q: What UI and functionalities?**  
**A:** Modern web UI with Angular/Ionic, featuring:
- Live energy monitoring (real-time sankey diagrams)
- Historical analytics with charts
- Controller configuration
- System settings and management
- Responsive design for all devices

**Q: Does it have an Android app?**  
**A:** YES! Native Android and iOS apps via Capacitor, plus PWA support. Full build instructions included.

**Q: Is it multi-tenanted?**  
**A:** YES! Fully multi-tenanted with:
- Unlimited users and Edge devices
- Role-based access control (Admin, Owner, Installer, Guest)
- Data isolation per Edge
- Enterprise-ready with Odoo integration

---

## For More Details

See the complete **[UI_GUIDE.md](UI_GUIDE.md)** (950+ lines) for:
- Detailed UI walkthrough with all screens
- Complete Android/iOS build instructions
- In-depth multi-tenancy architecture
- User roles and permissions
- Mobile app debugging
- Troubleshooting
- Best practices

---

**Last Updated**: 2026-01-16  
**OpenEMS Version**: 2026.2.0-SNAPSHOT

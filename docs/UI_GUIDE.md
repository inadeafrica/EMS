# OpenEMS UI and Mobile App Guide

This guide provides a comprehensive overview of the OpenEMS User Interface (UI), its functionalities, mobile app capabilities, and multi-tenancy features.

## Table of Contents

- [UI Overview](#ui-overview)
- [UI Architecture](#ui-architecture)
- [Main Features and Screens](#main-features-and-screens)
- [Android and iOS Mobile Apps](#android-and-ios-mobile-apps)
- [Multi-Tenancy Support](#multi-tenancy-support)
- [User Roles and Permissions](#user-roles-and-permissions)

---

## UI Overview

The OpenEMS UI is a modern, responsive web application built with **Angular** and **Ionic Framework**. It provides real-time monitoring and control capabilities for energy management systems.

### Technology Stack

- **Frontend Framework**: Angular 20.3.x
- **Mobile Framework**: Ionic 8.7.x
- **Charting Library**: Chart.js 4.5.x with ng2-charts
- **Real-time Communication**: WebSocket
- **API Communication**: REST API
- **State Management**: NgRx Store
- **Internationalization**: ngx-translate (supports multiple languages)
- **Progressive Web App (PWA)**: Service Worker support for offline capability

### Key Characteristics

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data updates via WebSocket connections
- **Offline Support**: PWA capabilities allow basic functionality without internet
- **Multi-language Support**: Currently supports English and German, extensible to other languages
- **Dark/Light Themes**: Theme customization support

---

## UI Architecture

The UI communicates with two main backend components:

```
┌─────────────────────────────────────────────┐
│         User Browser / Mobile App           │
│         (OpenEMS UI - Angular/Ionic)        │
└────────────┬──────────────┬─────────────────┘
             │              │
             │ REST/WS      │ REST/WS
             │              │
             ▼              ▼
┌──────────────────┐  ┌──────────────────┐
│  OpenEMS Edge    │  │ OpenEMS Backend  │
│  Port 8085       │◄─┤  Port 8084       │
│                  │  │                  │
│ - Live Data      │  │ - Historical Data│
│ - Configuration  │  │ - User Auth      │
│ - Control        │  │ - Multi-Edge     │
└──────────────────┘  └──────────────────┘
```

### Two Deployment Modes

1. **Edge Mode**: UI connects directly to OpenEMS Edge
   - Direct connection to edge device
   - Real-time monitoring and control
   - No backend required for basic functionality

2. **Backend Mode**: UI connects to OpenEMS Backend
   - Centralized management
   - Multi-edge support
   - User authentication and authorization
   - Historical data access

---

## Main Features and Screens

### 1. Login Screen

**Location**: `/login`

**Features**:
- User authentication
- Edge/Backend selection
- Remember login credentials
- Language selection

### 2. Overview Dashboard

**Location**: `/overview`

**Features**:
- List of all connected Edge devices
- Quick status view of each system
- Energy production/consumption summary
- Battery state of charge
- Grid connection status
- System alerts and notifications
- Filter and search capabilities

**Key Information Displayed**:
- Edge device name and ID
- Current power flow
- Battery level
- System state (online/offline)
- Recent alerts

### 3. Live Monitoring

**Location**: `/edge/{edgeId}/live`

**Features**:
- **Energy Monitor**: Real-time energy flow visualization
  - Solar/PV production
  - Grid consumption/feed-in
  - Battery charging/discharging
  - House consumption
  - Interactive sankey diagram showing energy flows

- **Storage View**: Battery management
  - State of charge (SoC)
  - Current power
  - Voltage and current
  - Temperature
  - Charge/discharge history

- **Controllers**: Real-time controller status and configuration
  - Self-consumption optimization
  - Peak shaving
  - Electric vehicle charging (EVCS/EVSE)
  - Heat pump control
  - Grid feed-in management
  - Time-based controllers

- **Multiple Components**: When system has multiple devices
  - Multiple batteries
  - Multiple inverters
  - Multiple meters

**Real-time Metrics**:
- Power (W/kW)
- Energy (Wh/kWh)
- Voltage (V)
- Current (A)
- Frequency (Hz)
- State of Charge (%)
- Temperature (°C)

### 4. History and Analytics

**Location**: `/edge/{edgeId}/history`

**Features**:
- Historical data visualization
- Custom date range selection
- Multiple chart types
- Data export capabilities
- Energy balance reports

**Available Charts**:
- **Self-Consumption**: Production vs. consumption analysis
- **Grid Meter**: Grid import/export over time
- **Storage**: Battery charging patterns
- **Production**: Solar/renewable energy production
- **Consumption**: Energy consumption patterns
- **Controller-specific charts**: 
  - Peak shaving performance
  - EV charging sessions
  - Heat pump operation

**Chart Features**:
- Zoom and pan
- Data aggregation (minute, hour, day, month)
- Multiple data series comparison
- Export to CSV/PNG
- Annotation support

### 5. Settings and Configuration

**Location**: `/edge/{edgeId}/settings`

**Features**:

#### System Settings
- System information (version, uptime)
- Network configuration
- System log viewer
- System execute commands

#### Component Management
- Add/remove/configure components
- Component properties editor
- Factory reset
- Component debugging

#### Controller Configuration
- Configure optimization algorithms
- Set control parameters
- Schedule management
- Priority settings

#### Alerting
- Configure alert rules
- Email/notification settings
- Alert thresholds
- Alert history

#### Channel Inspector
- View all available data channels
- Real-time channel values
- Channel metadata
- Debugging tool for developers

#### JSON-RPC Test
- Test API requests
- Debug communication
- Developer tool

#### Network Settings
- IP configuration
- Network interfaces
- Connection status

#### Profile Management
- User profile information
- Password change
- Preferences

#### App Settings (Mobile)
- Push notifications
- Offline mode
- Cache management

### 6. Information Screen

**Location**: `/edge/{edgeId}/info`

**Features**:
- System version information
- OpenEMS version
- Component versions
- License information
- About dialog
- Changelog viewer

---

## Android and iOS Mobile Apps

### Yes, OpenEMS Has Native Mobile Apps!

The OpenEMS UI is built with **Ionic Framework** and **Capacitor**, which allows it to be packaged as native mobile applications for both **Android** and **iOS**.

### Mobile App Architecture

```
┌─────────────────────────────────────┐
│     OpenEMS UI (Angular/Ionic)      │
│          Web Application            │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Capacitor Runtime           │
│  (Native Bridge Layer)              │
└─────────────┬───────────────────────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
┌─────────┐      ┌──────────┐
│ Android │      │   iOS    │
│  App    │      │   App    │
└─────────┘      └──────────┘
```

### Mobile-Specific Features

1. **Native Splash Screen**: Custom splash screen on app launch
2. **File System Access**: Save and open files (reports, exports)
3. **Secure Storage**: Store credentials securely in device keychain
4. **Push Notifications**: Real-time alerts (when configured)
5. **Offline Mode**: Continue viewing cached data without internet
6. **Native File Opener**: Open exported files with native apps
7. **Biometric Authentication**: Fingerprint/Face ID support (when configured)

### Building Android App

The Android app is located in `/src/ui/android/` directory.

#### Prerequisites
- Android Studio
- JDK 21 or later
- Gradle
- Node.js and npm

#### Build Steps

1. **Configure Capacitor** for your theme:
   ```typescript
   // Edit capacitor.config.ts
   const config: CapacitorConfig = {
     appId: 'io.openems.app',
     appName: 'OpenEMS',
     webDir: 'target',
     // ... other config
   };
   ```

2. **Build the web app**:
   ```bash
   cd src/ui
   npm install
   NODE_ENV=openems ionic cap build android -c "openems,openems-backend-deploy-app"
   ```

3. **Generate app assets** (icons and splash screens):
   ```bash
   npx @capacitor/assets generate --logoSplashScale 0.3 --pwaManifestPath src/manifest.webmanifest
   ```

4. **Build Android app**:
   ```bash
   cd android
   ./gradlew assembleRelease
   # or
   ./gradlew bundleRelease  # For Google Play Store
   ```

5. **Install on device**:
   ```bash
   ./gradlew installRelease
   ```

#### Android-Specific Files
- `android/app/build.gradle`: App configuration
- `android/app/src/main/`: Main variant resources
- `android/app/src/{theme}/`: Theme-specific resources
- `android/app/src/{theme}/res/`: Android resources (icons, strings, colors)
- `android/app/src/{theme}/res/xml/file_paths.xml`: File provider paths

### Building iOS App

The iOS app is located in `/src/ui/ios/` directory.

#### Prerequisites
- macOS
- Xcode 14 or later
- CocoaPods
- Node.js and npm

#### Build Steps

1. **Build the web app**:
   ```bash
   cd src/ui
   npm install
   NODE_ENV=openems ionic cap build ios -c "openems,openems-backend-deploy-app"
   ```

2. **Open in Xcode**:
   ```bash
   ionic cap open ios
   ```

3. **Configure signing** in Xcode:
   - Select project in navigator
   - Choose target
   - Set team and bundle identifier
   - Configure provisioning profile

4. **Build and run**:
   - Select device/simulator
   - Click Run button in Xcode
   - Or use command line: `xcodebuild`

### Mobile App Debugging

#### Android Debugging
```bash
# List available devices
npx native-run android --list --json

# Run with live reload
ionic cap run android -l --external

# View logs
adb logcat

# Open in Android Studio for debugging
ionic cap open android
```

#### iOS Debugging
```bash
# Run with live reload
ionic cap run ios -l --external

# Open in Xcode
ionic cap open ios

# View logs in Xcode Console
```

### Mobile App Distribution

#### Android
- **Google Play Store**: Use `gradlew bundleRelease` to create `.aab` file
- **Direct APK**: Use `gradlew assembleRelease` to create `.apk` file
- **Internal Testing**: Use Google Play Console internal testing track

#### iOS
- **App Store**: Archive and upload via Xcode
- **TestFlight**: Beta testing through App Store Connect
- **Enterprise Distribution**: For internal organization distribution

### PWA (Progressive Web App)

In addition to native apps, OpenEMS UI can be installed as a PWA:

**Features**:
- Install from browser (Chrome, Edge, Safari)
- Works offline with cached data
- Home screen icon
- Full-screen experience
- Automatic updates

**Installation**:
1. Visit OpenEMS UI in browser
2. Click "Install" prompt or browser menu
3. Add to home screen
4. Launch like a native app

---

## Multi-Tenancy Support

### Yes, OpenEMS Supports Multi-Tenancy!

OpenEMS Backend is designed to support **multiple Edge devices** and **multiple users**, making it inherently multi-tenant.

### Multi-Tenancy Architecture

```
┌──────────────────────────────────────────────┐
│         OpenEMS Backend (Central)            │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │      User Management                │   │
│  │  - Multiple Users                   │   │
│  │  - Roles & Permissions             │   │
│  │  - Authentication                   │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │      Edge Management                │   │
│  │  - Multiple Edge Devices           │   │
│  │  - Edge Registration               │   │
│  │  - Edge-User Associations          │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │      Data Isolation                 │   │
│  │  - Per-Edge Data Storage           │   │
│  │  - User Access Control             │   │
│  │  - Secure Data Separation          │   │
│  └─────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ Edge 1  │    │ Edge 2  │    │ Edge N  │
   │ (Site A)│    │ (Site B)│    │(Site N) │
   └─────────┘    └─────────┘    └─────────┘
```

### Multi-Tenancy Features

#### 1. Multiple Edge Devices
- Backend can manage **unlimited Edge devices**
- Each Edge has unique identifier
- Independent configuration per Edge
- Centralized monitoring of all Edges

#### 2. User Management
- Multiple user accounts
- User registration and authentication
- Password management
- Session management

#### 3. Access Control
- Users can be assigned to specific Edges
- Role-based access control (RBAC)
- Different permission levels per Edge
- Data isolation between users/tenants

#### 4. Metadata Management

Backend includes multiple metadata implementations:

**Available Metadata Backends**:
- `io.openems.backend.metadata.file`: File-based user/edge data
- `io.openems.backend.metadata.dummy`: In-memory for testing
- `io.openems.backend.metadata.odoo`: Integration with Odoo ERP for enterprise multi-tenancy

#### 5. Enterprise Multi-Tenancy (Odoo Integration)

For large-scale deployments, OpenEMS integrates with **Odoo ERP**:

**Features**:
- Customer/tenant management
- Billing and invoicing
- Contract management
- Service level agreements (SLA)
- Support ticket system
- Advanced user hierarchies
- Multi-company support

**Use Case**: Energy service providers managing hundreds/thousands of customer sites

### How Multi-Tenancy Works

#### Edge Registration
1. Edge device contacts Backend
2. Backend authenticates Edge
3. Edge registered with unique ID
4. Edge-User associations created

#### User Access
1. User logs into UI
2. UI authenticates with Backend
3. Backend returns list of accessible Edges
4. User selects Edge to monitor
5. Backend enforces access control

#### Data Isolation
- Each Edge's data stored separately in InfluxDB
- Tagged with Edge ID
- Backend filters queries by user permissions
- No cross-tenant data leakage

### Multi-Tenancy Scenarios

#### Scenario 1: Residential Solar Installer
- **Tenants**: Multiple homeowners
- **Edges**: One per home
- **Users**: Homeowners + installer technicians
- **Use Case**: Installer monitors all systems, homeowners see only their own

#### Scenario 2: Commercial Building Management
- **Tenants**: Multiple office tenants in building
- **Edges**: One per floor or tenant space
- **Users**: Building manager + individual tenants
- **Use Case**: Manager sees whole building, tenants see their space

#### Scenario 3: Energy Service Provider
- **Tenants**: Hundreds of customers
- **Edges**: Thousands of installations
- **Users**: Customers + service technicians + support team
- **Use Case**: Full enterprise EMS platform with Odoo integration

#### Scenario 4: Multi-Site Organization
- **Tenants**: Single organization, multiple locations
- **Edges**: One per site (factory, warehouse, office)
- **Users**: Central management + local operators
- **Use Case**: Corporate energy management across facilities

---

## User Roles and Permissions

### Permission Levels

OpenEMS implements role-based access control with different permission levels:

#### 1. Admin
**Capabilities**:
- Full system access
- Configure all components
- Manage users
- System settings
- Execute system commands
- Update configuration

**UI Access**:
- All screens
- Settings menu
- System configuration
- Component management
- Network settings

#### 2. Owner
**Capabilities**:
- Monitor own Edge devices
- Configure controllers
- View all data
- Limited system settings
- Cannot execute system commands

**UI Access**:
- Live monitoring
- History charts
- Controller configuration
- Alerting setup
- Profile settings

#### 3. Installer
**Capabilities**:
- Monitor assigned Edge devices
- Configure components
- System diagnostics
- Troubleshooting tools
- Cannot modify critical settings

**UI Access**:
- Live monitoring
- History charts
- Component inspector
- Channel viewer
- System logs
- Network status

#### 4. Guest
**Capabilities**:
- View-only access
- Monitor live data
- View history
- Cannot change configuration

**UI Access**:
- Live monitoring (read-only)
- History charts (read-only)
- No settings access

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
| Network Config | ✅ | ⚠️ Limited | ⚠️ View Only | ❌ |
| System Logs | ✅ | ⚠️ Limited | ✅ | ❌ |

### Setting User Permissions

Permissions are configured in the Backend:

1. **File-based** (`metadata.file`):
   - Edit user configuration file
   - Assign roles to users
   - Associate users with Edges

2. **Odoo-based** (`metadata.odoo`):
   - Configure in Odoo ERP
   - Full user management UI
   - Advanced role hierarchies

---

## UI Customization and Theming

### Theme Support

OpenEMS UI supports **custom themes** for white-labeling:

**Theme Components**:
- Custom logo and branding
- Color scheme (CSS variables)
- Favicon and icons
- App name
- Environment configuration

**Theme Location**: `/src/ui/src/themes/`

### Creating a Custom Theme

1. Create theme directory: `/src/ui/src/themes/mytheme/`
2. Add required files:
   - `scss/variables.scss`: Color and style variables
   - `environments/`: Backend/Edge connection settings
   - `root/`: Favicon and metadata files
3. Configure in `angular.json`
4. Build with theme: `ng build -c "mytheme,mytheme-backend-prod,prod"`

---

## Additional UI Features

### 1. Internationalization (i18n)

**Supported Languages**:
- English (en)
- German (de)
- Extensible to other languages

**Translation Files**: `/src/ui/src/assets/i18n/`

**Switching Language**: User menu → Language selection

### 2. Chart Features

**Chart Types**:
- Line charts (time-series)
- Bar charts (energy totals)
- Stacked charts (multiple data series)
- Sankey diagrams (energy flows)

**Chart Interactions**:
- Zoom: Scroll or pinch
- Pan: Drag chart
- Legend: Click to toggle series
- Tooltip: Hover for details
- Export: Download as PNG or CSV

### 3. Data Export

**Export Formats**:
- CSV: Tabular data for Excel/analysis
- PNG: Chart images for reports
- JSON: Raw data for processing

**Export Options**:
- Date range selection
- Data resolution (minute/hour/day)
- Selected channels only

### 4. Notifications

**Types**:
- System alerts (errors, warnings)
- Controller notifications
- Battery alerts
- Grid issues
- Component failures

**Notification Channels**:
- In-app notifications
- Browser notifications (PWA)
- Push notifications (mobile)
- Email (configured in Backend)

### 5. Offline Support

**PWA Capabilities**:
- Cache UI assets
- Store recent data
- Queue configuration changes
- Sync when online

**Limitations**:
- No real-time updates offline
- Limited historical data
- Configuration changes queued

---

## Technical Details

### WebSocket Communication

Real-time data uses WebSocket protocol:

**Edge WebSocket** (Port 8085):
```
ws://localhost:8085/websocket
```

**Backend WebSocket** (Port 8084):
```
ws://localhost:8084/websocket
```

**Message Format**: JSON-RPC 2.0

### REST API

Historical data and configuration use REST:

**Endpoints**:
- `/rest/ui/`: UI-specific endpoints
- `/rest/channel/`: Channel data
- `/rest/edge/`: Edge management
- `/rest/user/`: User management

### Data Update Frequency

- **Live Data**: 1 second (Edge control cycle)
- **Chart Updates**: 1-5 seconds (configurable)
- **Historical Queries**: On-demand
- **Component Status**: 5-10 seconds

---

## Getting Started with the UI

### Access via Docker Deployment

1. **Start the system**:
   ```bash
   docker compose up -d
   ```

2. **Open browser**:
   ```
   http://localhost:8080
   ```

3. **Default credentials** (if authentication enabled):
   - Check Backend configuration
   - Default may be `admin` / `admin` (change in production!)

4. **Select Edge device**:
   - Choose from available Edges
   - Start monitoring

### Access via Source Build

1. **Build and run UI**:
   ```bash
   cd src/ui
   npm install
   ng serve
   ```

2. **Access**:
   ```
   http://localhost:4200
   ```

3. **Configure connection**:
   - Edit environment files
   - Point to Edge or Backend

---

## Best Practices

### For End Users

1. **Use appropriate role**: Don't give admin access unnecessarily
2. **Enable notifications**: Stay informed of system issues
3. **Review history**: Analyze patterns to optimize usage
4. **Export data**: Keep records for analysis and compliance
5. **Update regularly**: Keep UI and apps updated

### For Administrators

1. **Secure access**: Use strong passwords, enable HTTPS
2. **Configure alerts**: Set up meaningful alert thresholds
3. **Regular backups**: Backup configuration and historical data
4. **Monitor performance**: Watch system resources
5. **Document changes**: Keep track of configuration changes

### For Developers

1. **Follow Angular style guide**: Maintain code consistency
2. **Test responsiveness**: Verify on multiple screen sizes
3. **Implement proper error handling**: User-friendly error messages
4. **Use TypeScript types**: Improve code quality
5. **Write tests**: Unit and integration tests for components

---

## Troubleshooting

### Common UI Issues

#### Cannot Connect to Edge/Backend
- Check network connectivity
- Verify Edge/Backend is running: `docker compose ps`
- Check firewall rules
- Verify URL in environment configuration

#### Live Data Not Updating
- Check WebSocket connection in browser dev tools
- Verify Edge is online
- Check network tab for errors
- Reload page to reconnect

#### Charts Not Loading
- Check historical data in InfluxDB
- Verify date range has data
- Check browser console for errors
- Try different time range

#### Mobile App Won't Install
- Check Android/iOS version compatibility
- Verify app signature
- Enable "Install from unknown sources" (Android)
- Check Xcode logs (iOS)

### Performance Issues

#### Slow Chart Loading
- Reduce date range
- Increase data aggregation
- Check InfluxDB performance
- Verify network speed

#### High Memory Usage
- Clear browser cache
- Reduce number of open charts
- Close unused tabs
- Restart browser

---

## Summary

### UI Capabilities
✅ Web-based interface (Angular + Ionic)
✅ Real-time monitoring and control
✅ Historical data analysis
✅ Responsive design (desktop/tablet/mobile)
✅ Progressive Web App (PWA)
✅ Multi-language support

### Mobile Apps
✅ **Android app available** (built with Capacitor)
✅ **iOS app available** (built with Capacitor)
✅ Native mobile features (splash screen, secure storage, file system)
✅ Push notifications support
✅ Offline capability

### Multi-Tenancy
✅ **Yes, fully multi-tenanted**
✅ Multiple Edge devices per Backend
✅ Multiple users with role-based access
✅ User-Edge access control
✅ Data isolation per Edge
✅ Enterprise-ready (Odoo integration)

---

## Additional Resources

- [OpenEMS Documentation](https://openems.github.io/openems.io/)
- [Ionic Framework](https://ionicframework.com/)
- [Capacitor](https://capacitorjs.com/)
- [Angular Documentation](https://angular.io/)
- [OpenEMS Community](https://community.openems.io/)

---

**Last Updated**: 2026-01-16
**OpenEMS Version**: 2026.2.0-SNAPSHOT

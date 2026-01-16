# OpenEMS Build Guide

This guide provides detailed instructions for building the OpenEMS Energy Management System from source.

## Prerequisites

### Required Software

1. **Java Development Kit (JDK) 21 or later** - **REQUIRED**
   - OpenEMS requires Java 21 for compilation
   - Download from: https://adoptium.net/temurin/releases/?version=21
   
2. **Gradle** - Included via wrapper (./gradlew)
   - No separate installation needed
   - The project includes Gradle wrapper scripts

3. **Node.js and npm** (for UI development only)
   - Node.js 22.x or later recommended
   - npm 10.x or later

### System Requirements

- **RAM**: Minimum 4GB, recommended 8GB for building
- **Disk Space**: At least 20GB free
- **OS**: Linux, macOS, or Windows

## Quick Start

### Using the Build Script (Recommended)

The easiest way to build the project:

```bash
./build.sh
```

This script will:
- Automatically detect and use Java 21
- Clean previous builds
- Build all modules (excluding tests for speed)
- Display helpful next steps

### Manual Build

If you prefer to build manually or need more control:

```bash
cd src
./gradlew build
```

## Common Build Issues

### Issue 1: Wrong Java Version

**Symptom**: Build fails with errors about unsupported Java version or language features

**Solution**: Ensure you're using Java 21

```bash
# Check current Java version
java -version

# Set Java 21 (Linux/macOS)
export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64  # Adjust path as needed
export PATH=$JAVA_HOME/bin:$PATH

# Set Java 21 (Windows)
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
```

**Common Java 21 Installation Locations**:
- Linux (Ubuntu/Debian): `/usr/lib/jvm/temurin-21-jdk-amd64` or `/usr/lib/jvm/java-21-openjdk-amd64`
- macOS (Homebrew): `/opt/homebrew/opt/openjdk@21`
- macOS (Manual): `/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home`
- Windows: `C:\Program Files\Eclipse Adoptium\jdk-21` or `C:\Program Files\Java\jdk-21`

### Issue 2: Gradle Daemon Issues

**Symptom**: Build hangs or fails with daemon errors

**Solution**: Use `--no-daemon` flag or stop existing daemons

```bash
# Build without daemon
./gradlew build --no-daemon

# Or stop all daemons
./gradlew --stop
```

### Issue 3: Out of Memory Errors

**Symptom**: Build fails with `OutOfMemoryError`

**Solution**: Increase Gradle memory in `gradle.properties` (already configured in this project)

```properties
org.gradle.jvmargs=-Xms512m -Xmx2048m "-XX:MaxMetaspaceSize=512m"
```

### Issue 4: Network/Dependency Download Issues

**Symptom**: Build fails downloading dependencies

**Solution**: 
- Check internet connection
- Try building again (Gradle will resume downloads)
- Clear Gradle cache if corrupted:
  ```bash
  rm -rf ~/.gradle/caches
  ./gradlew build --refresh-dependencies
  ```

## Build Commands

### Full Build (with tests)
```bash
cd src
./gradlew build
```

### Build without Tests (faster)
```bash
cd src
./gradlew build -x test
```

### Clean Build
```bash
cd src
./gradlew clean build
```

### Build Specific Components

#### Edge Component Only
```bash
cd src
./gradlew assembleEdge
```

#### Backend Component Only
```bash
cd src
./gradlew assembleBackend
```

#### UI Component Only
```bash
cd src/ui
npm install
npm run build
```

### Run Tests Only
```bash
cd src
./gradlew test
```

### Run Specific Module Tests
```bash
cd src
./gradlew :io.openems.edge.core:test
```

## Build Verification

After a successful build, verify:

1. **No build errors** - Check the output for `BUILD SUCCESSFUL`
2. **Check build artifacts** - Look in `src/build/` directory
3. **Run tests** (optional):
   ```bash
   cd src
   ./gradlew test
   ```

## Development Workflow

### Setting Up Your IDE

#### Eclipse IDE
1. Import as "Existing Gradle Project"
2. Point to the `src` directory
3. Wait for Gradle sync to complete
4. Ensure Project JDK is set to Java 21

#### IntelliJ IDEA
1. Open the `src` directory
2. IntelliJ will detect Gradle automatically
3. Wait for indexing to complete
4. Ensure Project SDK is set to Java 21 (File → Project Structure)

#### VS Code
1. Install "Extension Pack for Java"
2. Open the `src` directory
3. VS Code will detect Gradle project
4. Ensure Java 21 is selected in the status bar

### Incremental Builds

For faster development cycles, use incremental builds:

```bash
# Only rebuild changed modules
./gradlew build

# Gradle automatically detects changes
```

### Continuous Build

Watch for changes and rebuild automatically:

```bash
./gradlew build --continuous
```

## Advanced Build Options

### Parallel Builds

Already enabled in `gradle.properties`:
```properties
org.gradle.parallel=true
org.gradle.workers.max=4
```

### Build Cache

Already enabled in `gradle.properties`:
```properties
org.gradle.caching=true
```

### Skip Specific Tasks

```bash
# Skip tests
./gradlew build -x test

# Skip checkstyle
./gradlew build -x checkstyle

# Skip multiple tasks
./gradlew build -x test -x checkstyle
```

### Verbose Output

```bash
# More detailed output
./gradlew build --info

# Debug output
./gradlew build --debug

# Show all warnings
./gradlew build --warn
```

## Building for Production

For production deployments:

1. **Build with all tests**:
   ```bash
   cd src
   ./gradlew clean build
   ```

2. **Build Fat JARs** (if needed):
   ```bash
   cd src
   ./gradlew assembleEdge
   ./gradlew assembleBackend
   ```

3. **Verify checksums**:
   ```bash
   # Generate checksums for built artifacts
   sha256sum build/*.jar > checksums.txt
   ```

## Troubleshooting Tips

### Enable Debug Logging
```bash
./gradlew build --debug > build.log 2>&1
```

### Check Gradle Version
```bash
./gradlew --version
```

### Clean Everything
```bash
# Clean Gradle cache and build outputs
./gradlew clean cleanBuildCache
rm -rf ~/.gradle/caches
rm -rf ~/.gradle/wrapper
```

### Verify Java Installation
```bash
# Check Java version
java -version
javac -version

# Check JAVA_HOME
echo $JAVA_HOME  # Linux/macOS
echo %JAVA_HOME% # Windows

# List installed Java versions (Linux)
update-java-alternatives -l
```

## Getting Help

If you encounter issues:

1. Check this guide for common problems
2. Review the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) file
3. Check the OpenEMS documentation: https://openems.github.io/openems.io/
4. Ask in the OpenEMS Community: https://community.openems.io/
5. Open an issue on GitHub

## Additional Resources

- [OpenEMS Documentation](https://openems.github.io/openems.io/)
- [Gradle Build Tool](https://gradle.org/)
- [Java 21 Download](https://adoptium.net/temurin/releases/?version=21)
- [OpenEMS Community Forum](https://community.openems.io/)

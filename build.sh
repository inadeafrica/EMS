#!/bin/bash
# Build script for OpenEMS Energy Management System

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== OpenEMS Build Script ===${NC}"
echo ""

# Check Java version
echo -e "${YELLOW}Checking Java installation...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java is not installed${NC}"
    exit 1
fi

# Set JAVA_HOME to Java 21 if available
if [ -d "/usr/lib/jvm/temurin-21-jdk-amd64" ]; then
    export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64
    export PATH=$JAVA_HOME/bin:$PATH
    echo -e "${GREEN}✓ Using Java 21 from $JAVA_HOME${NC}"
elif [ -d "/usr/lib/jvm/java-21-openjdk-amd64" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
    export PATH=$JAVA_HOME/bin:$PATH
    echo -e "${GREEN}✓ Using Java 21 from $JAVA_HOME${NC}"
else
    echo -e "${YELLOW}Warning: Java 21 not found in standard locations${NC}"
    echo -e "${YELLOW}Attempting to use default Java version...${NC}"
fi

# Display Java version
java -version

echo ""
echo -e "${YELLOW}Building OpenEMS...${NC}"
echo ""

# Navigate to src directory
cd "$(dirname "$0")/src"

# Run the build
echo -e "${YELLOW}Step 1: Cleaning previous build...${NC}"
./gradlew clean --no-daemon

echo ""
echo -e "${YELLOW}Step 2: Building all modules...${NC}"
./gradlew build -x test --no-daemon

echo ""
echo -e "${GREEN}=== Build Completed Successfully ===${NC}"
echo ""
echo -e "To run with tests, use: ${YELLOW}cd src && ./gradlew build --no-daemon${NC}"
echo -e "To build Edge JAR: ${YELLOW}cd src && ./gradlew assembleEdge --no-daemon${NC}"
echo -e "To build Backend JAR: ${YELLOW}cd src && ./gradlew assembleBackend --no-daemon${NC}"
echo ""

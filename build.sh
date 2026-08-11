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

# Gradle 9 (used by this project's wrapper) refuses to run on a JVM older
# than 17, regardless of what compile target the build itself uses. Detect
# a suitable JDK rather than trusting whatever "java" happens to resolve to.
java_major_version() {
    local java_bin="$1"
    "$java_bin" -version 2>&1 | awk -F '"' '/version/ {print $2; exit}' | awk -F '.' '{
        if ($1 == "1") print $2; else print $1
    }'
}

find_candidate_java_homes() {
    # macOS
    if command -v /usr/libexec/java_home &> /dev/null; then
        /usr/libexec/java_home -V 2>/dev/null | awk -F'"' '/[0-9]+.*: / {print $2}'
    fi
    # Linux: any JDK registered with update-alternatives
    if command -v update-alternatives &> /dev/null; then
        update-alternatives --list java 2>/dev/null | sed -e 's#/bin/java$##'
    fi
    # Common Linux install locations (Temurin, distro OpenJDK, Zulu, Corretto, ...)
    for dir in /usr/lib/jvm/*/; do
        [ -x "${dir}bin/java" ] && echo "${dir%/}"
    done
}

JDK_HOME=""

# Prefer an already-exported JAVA_HOME if it's new enough.
if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    version=$(java_major_version "$JAVA_HOME/bin/java")
    if [ -n "$version" ] && [ "$version" -ge 17 ] 2>/dev/null; then
        JDK_HOME="$JAVA_HOME"
    fi
fi

# Otherwise search for the newest available JDK that is 17+ (preferring 21).
if [ -z "$JDK_HOME" ]; then
    best_version=0
    while IFS= read -r candidate; do
        [ -z "$candidate" ] && continue
        [ -x "$candidate/bin/java" ] || continue
        version=$(java_major_version "$candidate/bin/java")
        [ -z "$version" ] && continue
        if [ "$version" -ge 17 ] 2>/dev/null && [ "$version" -gt "$best_version" ]; then
            best_version=$version
            JDK_HOME="$candidate"
        fi
    done < <(find_candidate_java_homes | sort -u)
fi

if [ -n "$JDK_HOME" ]; then
    export JAVA_HOME="$JDK_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo -e "${GREEN}✓ Using $(java_major_version "$JAVA_HOME/bin/java")-series JDK from $JAVA_HOME${NC}"
else
    echo -e "${RED}Error: No JDK 17 or later was found.${NC}"
    echo -e "${RED}Gradle 9 (used by this project) requires JVM 17+ to run, and OpenEMS itself targets Java 21.${NC}"
    echo -e "${YELLOW}Install a JDK 21 (recommended) from https://adoptium.net/temurin/releases/?version=21${NC}"
    echo -e "${YELLOW}and either set JAVA_HOME to it, or re-run this script.${NC}"
    exit 1
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

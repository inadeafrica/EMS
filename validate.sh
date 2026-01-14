#!/bin/bash
# Quick validation script for Energy Management System setup

set -e

echo "======================================"
echo "Energy Management System Validation"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓${NC} $DOCKER_VERSION"
else
    echo -e "${RED}✗ Docker not found${NC}"
    exit 1
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    echo -e "${GREEN}✓${NC} Docker Compose $COMPOSE_VERSION"
else
    echo -e "${RED}✗ Docker Compose not found${NC}"
    exit 1
fi

# Check Docker Compose configuration
echo -n "Validating docker-compose.yml... "
if docker compose config --quiet; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Invalid configuration${NC}"
    exit 1
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} Not found (will use defaults)"
fi

# Check config directories
echo -n "Checking config directories... "
if [ -d config/edge ] && [ -d config/backend ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Config directories missing${NC}"
    exit 1
fi

# Check if Docker daemon is running
echo -n "Checking Docker daemon... "
if docker info &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Docker daemon not running${NC}"
    exit 1
fi

# Check available disk space
echo -n "Checking disk space... "
AVAILABLE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -gt 10 ]; then
    echo -e "${GREEN}✓${NC} ${AVAILABLE_SPACE}GB available"
else
    echo -e "${YELLOW}⚠${NC} Only ${AVAILABLE_SPACE}GB available (10GB+ recommended)"
fi

echo ""
echo "======================================"
echo -e "${GREEN}Validation Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Review .env.example and create .env if needed"
echo "  2. Run: make start"
echo "  3. Access UI at: http://localhost:8080"
echo ""

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🐳 Building Docker images...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}📝 Please create .env file with required environment variables${NC}"
    exit 1
fi

# Check if firebase.json exists
if [ ! -f firebase.json ]; then
    echo -e "${RED}❌ Error: firebase.json file not found!${NC}"
    echo -e "${YELLOW}📝 Please add your Firebase service account file${NC}"
    exit 1
fi

# Build development image
echo -e "${YELLOW}🔨 Building development image...${NC}"
docker-compose build backend-dev

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Development image built successfully!${NC}"
else
    echo -e "${RED}❌ Failed to build development image${NC}"
    exit 1
fi

# Build production image
echo -e "${YELLOW}🔨 Building production image...${NC}"
docker-compose build backend-prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production image built successfully!${NC}"
else
    echo -e "${RED}❌ Failed to build production image${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All Docker images built successfully!${NC}"
echo -e "${YELLOW}📋 Available commands:${NC}"
echo -e "  docker-compose up backend-dev    # Run development"
echo -e "  docker-compose up backend-prod   # Run production"
echo -e "  docker-compose down             # Stop all services" 
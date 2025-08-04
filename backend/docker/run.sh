#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${YELLOW}Usage: $0 [dev|prod]${NC}"
    echo -e "${BLUE}Options:${NC}"
    echo -e "  dev   - Run development environment (port 3001)"
    echo -e "  prod  - Run production environment (port 3001)"
    echo -e ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 dev   # Start development server"
    echo -e "  $0 prod  # Start production server"
}

# Check if environment is specified
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Environment not specified${NC}"
    show_usage
    exit 1
fi

ENVIRONMENT=$1

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

case $ENVIRONMENT in
    "dev")
        echo -e "${YELLOW}🚀 Starting development environment...${NC}"
        echo -e "${BLUE}📍 Server will be available at: http://localhost:3001${NC}"
        echo -e "${BLUE}📝 Hot reload enabled${NC}"
        docker-compose up backend-dev
        ;;
    "prod")
        echo -e "${YELLOW}🚀 Starting production environment...${NC}"
        echo -e "${BLUE}📍 Server will be available at: http://localhost:3001${NC}"
        echo -e "${BLUE}📝 Production optimized${NC}"
        docker-compose up backend-prod
        ;;
    *)
        echo -e "${RED}❌ Error: Invalid environment '$ENVIRONMENT'${NC}"
        show_usage
        exit 1
        ;;
esac 
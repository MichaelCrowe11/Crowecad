#!/bin/bash

# Deploy script for Fly.io
set -e

echo "🚀 Starting CroweCAD deployment to Fly.io..."

# Export Fly CLI path
export PATH="/home/runner/.fly/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if logged in to Fly
check_fly_auth() {
    if ! flyctl auth whoami &>/dev/null; then
        echo -e "${YELLOW}Please log in to Fly.io${NC}"
        flyctl auth login
    else
        echo -e "${GREEN}✓ Authenticated with Fly.io${NC}"
    fi
}

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}Deploying backend...${NC}"
    
    # Check if app exists, create if not
    if ! flyctl apps list | grep -q "crowecad-backend"; then
        echo "Creating backend app..."
        flyctl apps create crowecad-backend --org personal
    fi
    
    # Set secrets (you'll need to set these manually)
    echo -e "${YELLOW}Note: Set environment variables manually with:${NC}"
    echo "flyctl secrets set DATABASE_URL='your-db-url' -a crowecad-backend"
    echo "flyctl secrets set APS_CLIENT_ID='your-aps-id' -a crowecad-backend"
    echo "flyctl secrets set APS_CLIENT_SECRET='your-aps-secret' -a crowecad-backend"
    
    # Deploy
    flyctl deploy --config fly.backend.toml --dockerfile Dockerfile.fly -a crowecad-backend
    
    echo -e "${GREEN}✓ Backend deployed successfully${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}Deploying frontend...${NC}"
    
    # Check if app exists, create if not
    if ! flyctl apps list | grep -q "crowecad-frontend"; then
        echo "Creating frontend app..."
        flyctl apps create crowecad-frontend --org personal
    fi
    
    # Set backend URL
    echo -e "${YELLOW}Setting backend URL...${NC}"
    flyctl secrets set VITE_API_URL='https://crowecad-backend.fly.dev' -a crowecad-frontend
    
    # Deploy
    flyctl deploy --config fly.frontend.toml --dockerfile Dockerfile.fly -a crowecad-frontend
    
    echo -e "${GREEN}✓ Frontend deployed successfully${NC}"
}

# Main deployment flow
main() {
    check_fly_auth
    
    echo -e "${YELLOW}Which component would you like to deploy?${NC}"
    echo "1) Backend only"
    echo "2) Frontend only"
    echo "3) Both (full deployment)"
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            deploy_frontend
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo -e "Backend: https://crowecad-backend.fly.dev"
    echo -e "Frontend: https://crowecad-frontend.fly.dev"
}

# Run main function
main
#!/bin/bash

# Docker deployment optimization script
# Prepares the environment for minimal Docker image size

echo "🚀 Preparing optimized Docker deployment..."

# Set environment variables for deployment
export NODE_ENV=production
export DISABLE_PACKAGE_CACHE=true
export NPM_CONFIG_CACHE=/tmp/.npm

# Clean up any existing build artifacts
echo "Cleaning previous builds..."
rm -rf dist/
rm -rf client/dist/
rm -rf node_modules/.cache/
rm -rf client/node_modules/.cache/

# Remove large development assets (keeping only essential files)
echo "Optimizing assets..."
if [ -d "attached_assets" ]; then
    # Keep only essential image and config files
    find attached_assets -name "*.txt" -size +10k -delete 2>/dev/null || true
    find attached_assets -name "Pasted-*" -delete 2>/dev/null || true
fi

# Create .nvmrc to ensure consistent Node.js version
echo "20" > .nvmrc

echo "✅ Environment optimized for Docker deployment!"
echo ""
echo "To build optimized Docker image:"
echo "  docker build --build-arg NODE_ENV=production --build-arg DISABLE_PACKAGE_CACHE=true -t crowecad:optimized ."
echo ""
echo "Optimizations applied:"
echo "  ✓ Cleaned build artifacts and caches"
echo "  ✓ Removed large development assets"
echo "  ✓ Set production environment variables"
echo "  ✓ Configured package cache settings"
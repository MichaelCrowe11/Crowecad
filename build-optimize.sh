#!/bin/bash

# Build optimization script for Docker deployment
# This script prepares the build context to reduce Docker image size

echo "🔧 Optimizing build for Docker deployment..."

# Clean up cache directories if they exist (excluding critical Replit files)
echo "Cleaning non-critical cache..."
find .cache -type f -name "*.body" -delete 2>/dev/null || true
find .cache/pip -type f -delete 2>/dev/null || true

# Remove unnecessary large files from attached_assets for production
echo "Optimizing attached assets..."
if [ -d "attached_assets" ]; then
    # Keep only essential assets, remove large text dumps
    find attached_assets -name "*.txt" -size +100k -delete 2>/dev/null || true
fi

# Create production package.json with only necessary dependencies
echo "Creating optimized package.json for production..."
node -e "
const pkg = require('./package.json');
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  type: pkg.type,
  scripts: {
    start: pkg.scripts.start
  },
  dependencies: pkg.dependencies
};
console.log(JSON.stringify(prodPkg, null, 2));
" > package.prod.json

echo "✅ Build optimization complete!"
echo ""
echo "To build with optimizations:"
echo "  docker build --build-arg NODE_ENV=production -t crowecad:optimized ."
echo ""
echo "Image size reduction strategies applied:"
echo "  ✓ Cleaned non-critical cache files"
echo "  ✓ Optimized attached assets"
echo "  ✓ Created production-only package.json"
echo "  ✓ Using multi-stage Docker build"
echo "  ✓ Using Alpine Linux base image"
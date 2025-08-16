# Multi-stage Dockerfile for CroweCad

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with optimizations for smaller image
ENV NPM_CONFIG_CACHE=/tmp/.npm
ENV DISABLE_PACKAGE_CACHE=true
RUN npm ci --no-optional --no-fund --no-audit --prefer-offline && \
    npm cache clean --force && \
    rm -rf /tmp/.npm

# Copy source code
COPY . .

# Build the application with production optimizations
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV DISABLE_PACKAGE_CACHE=true
# Use production vite config for optimized builds
RUN npx vite build --config vite.config.production.js && \
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify --tree-shaking=true && \
    # Clean up build artifacts
    rm -rf client/node_modules/.vite && \
    rm -rf node_modules/.cache

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only production files from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
# Create production-only package.json to reduce dependencies
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
# Only copy essential static assets (not entire public folder)
COPY --from=builder --chown=nodejs:nodejs /app/attached_assets/crowe-avatar_1754994960604.png ./public/
COPY --from=builder --chown=nodejs:nodejs /app/attached_assets/grafana_dashboard_myco_ei_mpdet_1754994266305.json ./public/

# Install production dependencies only with aggressive optimizations
ENV NPM_CONFIG_CACHE=/tmp/.npm
ENV DISABLE_PACKAGE_CACHE=true
RUN npm ci --only=production --no-optional --no-fund --no-audit --ignore-scripts && \
    # Remove unnecessary files from node_modules
    find node_modules -name '*.md' -delete && \
    find node_modules -name 'README*' -delete && \
    find node_modules -name 'CHANGELOG*' -delete && \
    find node_modules -name '*.map' -delete && \
    find node_modules -name '.DS_Store' -delete && \
    # Clean npm cache
    npm cache clean --force && \
    rm -rf /tmp/.npm && \
    # Remove package-lock.json to save space
    rm -f package-lock.json

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
# ============================================
# Development Dockerfile with hot-reload
# ============================================
FROM node:24-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install development utilities
RUN apk add --no-cache git

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Copy source code (will be overwritten by volume mount in dev)
COPY . .

# Expose application port
EXPOSE 3000

# Start in development mode with hot-reload
CMD ["pnpm", "run", "start:dev"]


# ============================================================
# Stage 1: Builder
# Uses Node 22 Alpine (lightweight) to install deps and build
# ============================================================
FROM node:22-alpine AS builder

# Install pnpm globally (project uses pnpm-lock.yaml)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifest files first for better layer caching
# Docker will only re-run pnpm install if these change
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies needed by Vite build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Accept build-time environment variables (injected at build time by Docker)
# These get baked into the static bundle by Vite
ARG VITE_APP_NAME="DTE Recruitment Portal"
ARG VITE_API_URL=https://dteapi.vosl.in/api/
ARG VITE_MOCK_API=false

# Set them as real env vars so Vite picks them up during build
ENV VITE_APP_NAME="DTE Recruitment Portal"
ENV VITE_API_URL=https://dteapi.vosl.in/api/
# ENV VITE_API_URL=http://localhost:8000/api/
ENV VITE_MOCK_API=false

# Build the production-optimised static assets
RUN pnpm run build


# ============================================================
# Stage 2: Production Server
# Lightweight Node Alpine — serves /dist with the `serve` package
# ============================================================
FROM node:22-alpine AS production

# Install `serve` globally — a zero-config static file server
RUN npm install -g serve

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the compiled dist from the builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

USER appuser

# Expose port 3000
EXPOSE 3000

# Start serve in SPA mode on port 3000 (bind to 0.0.0.0 so it is reachable outside the container)
CMD ["serve", "-s", "dist", "-l", "0.0.0.0:3000"]

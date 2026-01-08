# Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Install deps first
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build with envs injected by Docker
RUN npm run build

# Runtime stage
FROM node:20-slim AS runner
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser \
    && useradd -r -g appuser -d /app -s /usr/sbin/nologin appuser

# Copy contents of the standalone build into the runtime image
COPY --from=builder /app/.next/standalone ./

# Copy static assets (served by Next)
# Remove them during actual deployment if using a CDN
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Ensure correct ownership
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["node", "server.js"]

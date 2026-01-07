# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build with envs injected by Docker
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S appuser \
    && adduser -S appuser -G appuser -h /app

# Copy contents of the standalone build into the runtime image
COPY --from=builder /app/.next/standalone ./

# Copy static assets (served by Next)
# Remove them during actual deployment if using a CDN
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
FROM node:20-alpine

WORKDIR /app

# Install deps first
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build with envs injected by Docker
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
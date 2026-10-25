# Stage 1: Build the React application with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies cleanly
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and build production static bundle
COPY . .
RUN npm run build

# Stage 2: Serve using high-performance Nginx Alpine
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

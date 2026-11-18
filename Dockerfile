# Use Node.js 18 Alpine as the base image for building
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY client/ ./

# Build the application
RUN npm run build

# Use Nginx Alpine for production
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
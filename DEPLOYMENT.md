# Deployment Guide

## Table of Contents
1. [Docker Deployment](#docker-deployment)
2. [Production Configuration](#production-configuration)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Monitoring Setup](#monitoring-setup)
5. [Scaling Considerations](#scaling-considerations)

---

## Docker Deployment

### Quick Start with Docker Compose
```bash
# Build and start production container
docker-compose up -d client

# View logs
docker-compose logs -f client

# Stop container
docker-compose down
```

### Building Docker Image Manually
```bash
# Build the image
docker build -t football-lineup-builder .

# Run the container
docker run -p 3000:80 -d football-lineup-builder
```

### Docker Development Environment
```bash
# Start development server with hot reloading
docker-compose up client-dev
```

---

## Production Configuration

### Environment Variables
Create a `.env` file in the `client` directory with:
```env
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

### Nginx Configuration
The default Nginx configuration includes:
- Gzip compression for static assets
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Static asset caching with long expiration
- SPA routing support

---

## CI/CD Pipeline

### GitHub Actions Workflow
The project includes a complete CI/CD pipeline in `.github/workflows/ci-cd.yml` that:
1. Runs on every push and pull request
2. Installs dependencies
3. Runs linting
4. Executes tests
5. Builds the application
6. Pushes Docker image to Docker Hub (only on main branch)

### Required Secrets
Add these secrets to your GitHub repository:
- `DOCKER_HUB_USERNAME` - Docker Hub username
- `DOCKER_HUB_ACCESS_TOKEN` - Docker Hub access token

### Deployment Steps
1. Push changes to the `main` branch
2. CI pipeline automatically runs tests and builds
3. Docker image is pushed to Docker Hub
4. Deploy to your production server using the new image

---

## Monitoring Setup

### Sentry Error Tracking
1. Create a Sentry account at https://sentry.io
2. Create a new project for React
3. Copy your DSN and add it to environment variables
4. The application will automatically track errors and performance

### Performance Monitoring
Sentry tracks:
- Page load times
- API request durations
- User interaction latency
- Frontend errors with stack traces

### Usage Analytics
To enable analytics:
1. Uncomment the analytics code in `src/utils/monitoring.js`
2. Add your analytics service (Posthog, Mixpanel, etc.)
3. Track custom events as needed

---

## Scaling Considerations

### Static Asset Optimization
- All assets are gzipped
- Static files have 1-year cache headers
- Use a CDN for global distribution

### Server Requirements
- Minimum 512MB RAM
- 1 CPU core
- 1GB storage for static assets

### High Availability
- Deploy multiple containers behind a load balancer
- Use Redis for session storage (if adding backend)
- Implement health checks (already configured in Docker)

---

## Production Checklist

Before deploying to production:
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables are properly configured
- [ ] Sentry DSN is set
- [ ] Docker image builds successfully
- [ ] CI pipeline passes all stages
- [ ] Security headers are enabled
- [ ] CDN is configured (if used)
- [ ] SSL certificate is installed
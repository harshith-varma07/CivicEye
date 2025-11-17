# Docker Build Issues and Solutions

## Issues Encountered

### 1. SSL Certificate Issues with Python/PyPI
**Problem**: Docker build fails when installing Python packages due to SSL certificate verification errors.

**Solution**: Added `--trusted-host` flags to pip install commands in `ai_services/Dockerfile`:
```dockerfile
RUN pip install --no-cache-dir --upgrade pip --trusted-host pypi.org --trusted-host files.pythonhosted.org && \
    pip install --no-cache-dir -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

**Status**: ✅ RESOLVED - AI services now build successfully

### 2. npm Install Timeout Issues
**Problem**: npm install fails with "Exit handler never called!" error during Docker build for backend and frontend services.

**Root Cause**: This is a known npm bug that occurs in Docker environments, especially with large dependency trees and network restrictions.

**Attempted Solutions**:
1. Using `npm ci` instead of `npm install`
2. Adding `--maxsockets=1` flag to reduce concurrent connections
3. Using `--prefer-offline` flag
4. Fallback to retry logic

**Current Status**: ⚠️ PARTIALLY RESOLVED - Backend builds but with warnings, frontend still fails

### 3. MongoDB Authentication URL Format
**Problem**: Original MongoDB URI didn't include `authSource=admin` parameter.

**Solution**: Updated to `mongodb://admin:password123@mongodb:27017/civiceye?authSource=admin`

**Status**: ✅ RESOLVED

### 4. Service Dependencies
**Problem**: Services were starting before dependencies were ready.

**Solution**: Added healthchecks and dependency conditions in docker-compose.yml:
```yaml
depends_on:
  mongodb:
    condition: service_healthy
  redis:
    condition: service_healthy
```

**Status**: ✅ RESOLVED

## Workarounds

### Option 1: Use Pre-built Images (Recommended for Testing)
Instead of building from scratch, you can:
1. Pull pre-built images from Docker Hub (if available)
2. Build images on a machine with better network connectivity
3. Use cached layers from previous builds

### Option 2: Local Development Setup
Run services locally without Docker:
```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Redis
redis-server

# Terminal 3 - Backend
cd backend
npm install
npm run dev

# Terminal 4 - Frontend
cd frontend
npm install
npm start

# Terminal 5 - AI Services
cd ai_services
pip install -r requirements.txt
uvicorn main:app --reload
```

### Option 3: Docker Compose with Volume Mounts
Mount node_modules as volumes to avoid rebuilding:
```yaml
volumes:
  - ./backend:/app
  - /app/node_modules
```

## Recommendations for Production

1. **Use Node 20**: Update to Node 20 to resolve engine compatibility warnings
2. **Multi-stage Builds**: Optimize Docker images with multi-stage builds
3. **Layer Caching**: Organize Dockerfile commands to maximize layer caching
4. **Private Registry**: Use a private Docker registry for faster pulls
5. **CI/CD Pipeline**: Build images in CI/CD with better network access

## Docker Compose Alternative Configuration

For environments with network restrictions, consider this simpler approach:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:4.4
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Run backend/frontend locally
  # Connect to mongodb://admin:password123@localhost:27017/civiceye?authSource=admin
```

Then run backend and frontend locally using npm.

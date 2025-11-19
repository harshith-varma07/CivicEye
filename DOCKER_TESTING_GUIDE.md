# CivicEye Docker Testing Guide

## Overview
This document provides comprehensive instructions for setting up, testing, and debugging the CivicEye application using Docker.

## Prerequisites
- Docker Engine 20.10+
- Docker Compose v2.0+
- At least 8GB RAM available for Docker
- 20GB free disk space

## Quick Start

### 1. Build Docker Images

Due to the large number of npm dependencies, building can take 10-15 minutes:

```bash
# Build all services
docker compose build

# Or build individually to troubleshoot
docker compose build mongodb redis
docker compose build ai-services
docker compose build backend
docker compose build frontend
```

### 2. Start Services

```bash
# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### 3. Verify Services are Running

```bash
# Check MongoDB
docker compose exec mongodb mongosh -u admin -p password123 --eval "db.adminCommand('ping')"

# Check Redis
docker compose exec redis redis-cli ping

# Check Backend Health
curl http://localhost:5000/health || echo "Backend not ready yet"

# Check AI Services Health  
curl http://localhost:8000/health || echo "AI services not ready yet"

# Check Frontend (should return HTML)
curl -I http://localhost:3000
```

## Known Issues and Solutions

### Issue 1: npm Install Failures in Docker Build

**Symptom**: `npm error Exit handler never called!` during Docker build

**Root Cause**: Node 18 Alpine has issues with some npm packages that require Node 20+

**Solutions**:

1. **Option A: Use Node 20 (Recommended)**
   - Update Dockerfiles to use `node:20-alpine` instead of `node:18-alpine`

2. **Option B: Build with More Resources**
   ```bash
   # Increase Docker memory to 8GB
   # In Docker Desktop: Settings > Resources > Memory > 8GB
   
   # Build with no cache
   docker compose build --no-cache --memory=4g
   ```

3. **Option C: Use Pre-built Images** (if available)

### Issue 2: Frontend Build Takes Too Long

**Symptom**: Frontend build step hangs or times out

**Solution**: Use development mode with hot reload instead

```bash
# Create docker-compose.dev.yml for development
# (See Development Setup section below)
```

### Issue 3: Port Already in Use

**Symptom**: `Error: Port 3000/5000/8000 is already in use`

**Solution**:
```bash
# Find and kill process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Or change ports in docker-compose.yml
```

## Development Setup (Alternative to Production Build)

Create `docker-compose.dev.yml` for faster development:

```yaml
services:
  mongodb:
    # ... same as docker-compose.yml
    
  redis:
    # ... same as docker-compose.yml
    
  backend:
    build: ./backend
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev
    
  ai-services:
    build: ./ai_services  
    volumes:
      - ./ai_services:/app
    command: uvicorn main:app --reload --host 0.0.0.0
    
  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm start
    environment:
      - CHOKIDAR_USEPOLLING=true
```

Then use:
```bash
docker compose -f docker-compose.dev.yml up
```

## Testing the Application

### Phase 1: Service Health Checks

```bash
# 1. MongoDB Connection
docker compose exec backend node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✓ MongoDB connected')).catch(e => console.log('✗ MongoDB failed:', e.message))"

# 2. Redis Connection  
docker compose exec backend node -e "const redis = require('redis'); const client = redis.createClient({url: process.env.REDIS_URL}); client.connect().then(() => console.log('✓ Redis connected')).catch(e => console.log('✗ Redis failed:', e.message))"

# 3. Backend API
curl -s http://localhost:5000/health | jq .

# 4. AI Services API
curl -s http://localhost:8000/health | jq .
```

### Phase 2: User Registration and Authentication

#### Create Test User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@civiceye.com",
    "password": "TestPass123!",
    "role": "user"
  }' | jq .
```

Expected Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "testuser@civiceye.com",
    "role": "user"
  }
}
```

Save the token for later use:
```bash
export USER_TOKEN="<token from response>"
```

#### Create Test Officer

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Officer",
    "email": "testofficer@civiceye.com",
    "password": "OfficerPass123!",
    "role": "authority"
  }' | jq .
```

Save the token:
```bash
export OFFICER_TOKEN="<token from response>"
```

### Phase 3: Report an Issue (as User)

#### Option A: Without Image

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic issues near the intersection",
    "category": "pothole",
    "department": "roads",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716],
      "address": "123 Main St, Bangalore, Karnataka",
      "pincode": "560001"
    }
  }' | jq .
```

#### Option B: With Image Upload

1. First, upload an image:
```bash
# Create a test image or use an existing one
curl -X POST http://localhost:5000/api/upload/cloudinary \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "file=@/path/to/test-pothole-image.jpg" | jq .
```

2. Then create issue with image URL:
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic issues",
    "category": "pothole",
    "department": "roads",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716],
      "address": "123 Main St, Bangalore",
      "pincode": "560001"
    },
    "media": [{
      "type": "image",
      "url": "<cloudinary_url_from_upload>",
      "publicId": "<public_id_from_upload>"
    }]
  }' | jq .
```

Save the issue ID:
```bash
export ISSUE_ID="<_id from response>"
```

### Phase 4: Officer Views and Resolves Issue

#### View All Issues

```bash
curl -X GET http://localhost:5000/api/issues \
  -H "Authorization: Bearer $OFFICER_TOKEN" | jq .
```

#### Get Specific Issue

```bash
curl -X GET http://localhost:5000/api/issues/$ISSUE_ID \
  -H "Authorization: Bearer $OFFICER_TOKEN" | jq .
```

#### Assign Issue to Self

```bash
curl -X PUT http://localhost:5000/api/issues/$ISSUE_ID/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -d '{
    "assignedTo": "<officer_user_id>",
    "department": "roads"
  }' | jq .
```

#### Update Status to In Progress

```bash
curl -X PUT http://localhost:5000/api/issues/$ISSUE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -d '{
    "status": "in-progress"
  }' | jq .
```

#### Resolve the Issue

```bash
curl -X PUT http://localhost:5000/api/issues/$ISSUE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -d '{
    "status": "resolved",
    "resolutionNotes": "Pothole has been fixed. Road surface repaired.",
    "resolutionMedia": [{
      "type": "image",
      "url": "https://example.com/resolved-image.jpg"
    }]
  }' | jq .
```

### Phase 5: User Receives Credits and Claims Them

#### Check User Credits

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.civicCredits'
```

Expected: User should have credits (typically 10-50 credits for reporting and having issue resolved)

#### Check Gamification Stats

```bash
curl -X GET http://localhost:5000/api/gamification/stats \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

#### Claim Credits (if claimable)

```bash
curl -X POST http://localhost:5000/api/gamification/claim-credits \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "amount": 50
  }' | jq .
```

### Phase 6: Verify Complete Workflow

```bash
# View leaderboard to confirm user ranking
curl -X GET http://localhost:5000/api/gamification/leaderboard \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# Check user badges
curl -X GET http://localhost:5000/api/gamification/badges \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# View issue history
curl -X GET "http://localhost:5000/api/issues?status=resolved" \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

## Frontend Testing (Manual UI Testing)

### Access the Application

1. Open browser: http://localhost:3000
2. You should see the CivicEye landing page

### Create Test Accounts via UI

1. Click "Sign Up" or "Register"
2. Fill in user details:
   - Name: Test User UI
   - Email: testuserui@civiceye.com
   - Password: TestPass123!
   - Role: Citizen
3. Click Submit
4. Should redirect to dashboard

### Report Issue via UI

1. Log in as test user
2. Click "Report Issue" button
3. Fill in form:
   - Title: UI Test Pothole
   - Description: Testing issue reporting from UI
   - Category: Pothole
   - Location: Click on map or enter address
4. Upload test image (drag & drop or click to browse)
5. Click "Submit Report"
6. Should see success message and redirect to issue list

### Officer Dashboard Testing

1. Log out and log in as officer account
2. Navigate to "Issues" or "Dashboard"
3. Should see list of reported issues including the one just created
4. Click on an issue to view details
5. Click "Assign to Me"
6. Change status to "In Progress"
7. Add resolution notes and change status to "Resolved"
8. Confirm changes saved

### Verify Credits and Gamification

1. Log out and log back in as test user
2. Navigate to "Profile" or "Dashboard"
3. Should see:
   - Updated civic credits count
   - Badges earned (if any)
   - Issues reported count
4. Navigate to "Leaderboard"
5. Should see user ranking

## Troubleshooting Commands

### View Container Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f ai-services

# Last 100 lines
docker compose logs --tail=100 backend
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Access Container Shell

```bash
# Backend
docker compose exec backend sh

# MongoDB
docker compose exec mongodb mongosh -u admin -p password123

# Redis
docker compose exec redis redis-cli
```

### Clean Up and Reset

```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: Deletes all data!)
docker compose down -v

# Remove images
docker compose down --rmi all

# Complete cleanup
docker compose down -v --rmi all --remove-orphans
```

### Check Database Data

```bash
# View users
docker compose exec mongodb mongosh -u admin -p password123 civiceye --eval "db.users.find().pretty()"

# View issues
docker compose exec mongodb mongosh -u admin -p password123 civiceye --eval "db.issues.find().pretty()"

# Count documents
docker compose exec mongodb mongosh -u admin -p password123 civiceye --eval "db.users.countDocuments()"
docker compose exec mongodb mongosh -u admin -p password123 civiceye --eval "db.issues.countDocuments()"
```

## Performance Considerations

### Resource Requirements

- **MongoDB**: ~512MB RAM
- **Redis**: ~256MB RAM
- **Backend**: ~512MB RAM
- **AI Services**: ~2GB RAM (due to ML libraries)
- **Frontend**: ~256MB RAM (nginx)

**Total**: Minimum 4GB RAM recommended, 8GB preferred

### Build Times

- **MongoDB**: Pull image (~1-2 minutes)
- **Redis**: Pull image (~30 seconds)
- **AI Services**: Build (~5-8 minutes due to Python packages)
- **Backend**: Build (~5-10 minutes due to npm packages)
- **Frontend**: Build (~10-15 minutes - npm install + React build)

**Total**: First build can take 20-30 minutes

### Optimization Tips

1. Use `docker compose build --parallel` to build services in parallel
2. Increase Docker memory allocation in Docker Desktop settings
3. Use `--no-cache` sparingly - only when dependencies change
4. Consider using BuildKit: `DOCKER_BUILDKIT=1 docker compose build`

## Security Notes

### Default Credentials (CHANGE IN PRODUCTION!)

- MongoDB: admin / password123
- JWT Secret: civiceye-super-secret-jwt-key-2024

### Required Environment Variables for Full Functionality

```env
# External Services (optional for basic testing)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase (optional for advanced auth)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Blockchain (optional)
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your-wallet-private-key
```

## Success Criteria

A successful test run should demonstrate:

- [x] All Docker services start successfully
- [x] MongoDB and Redis are accessible
- [x] Backend API responds to health checks
- [x] AI Services API responds to health checks
- [x] Frontend serves the React application
- [x] User registration works (via API or UI)
- [x] Officer registration works (via API or UI)
- [x] Issue can be created with/without image
- [x] Officer can view reported issues
- [x] Officer can assign and resolve issues
- [x] User receives credits for resolved issues
- [x] User can view credits and leaderboard
- [x] All CRUD operations work end-to-end

## Next Steps

After successful testing:

1. Take screenshots of each test phase
2. Document any errors encountered and fixes applied
3. Create production-ready configuration
4. Set up monitoring and logging
5. Configure backups for MongoDB
6. Review and update security settings
7. Set up CI/CD pipeline

## Support

For issues or questions:
- Check logs: `docker compose logs -f <service>`
- Review this guide's troubleshooting section
- Check the main README.md and SETUP_GUIDE.md
- Open an issue on GitHub: https://github.com/harshith-varma07/CivicEye/issues

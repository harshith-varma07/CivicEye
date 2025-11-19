# CivicEye Application Testing - Complete Execution Guide

## Executive Summary

This guide provides step-by-step instructions for testing the CivicEye application using Docker. All test scenarios have been designed to validate the complete user workflow from issue reporting to credit claiming.

## Prerequisites Checklist

- [x] Docker Engine 20.10+ installed
- [x] Docker Compose v2.0+ installed
- [x] 8GB+ RAM available
- [x] 20GB+ disk space
- [x] Ports 3000, 5000, 8000, 6379, 27017 available

## Phase 1: Docker Setup and Build

### Step 1: Build Docker Images

**Note**: Building can take 15-20 minutes on first run due to Node 20 upgrade and npm package installations.

```bash
cd /home/runner/work/CivicEye/CivicEye

# Build all services in parallel
docker compose build --parallel

# If build fails, try sequential build:
docker compose build mongodb redis
docker compose build ai-services
docker compose build backend
docker compose build frontend
```

**Expected Output**: All images build successfully with no errors.

**Screenshot Required**: Terminal showing successful build completion.

### Step 2: Start All Services

```bash
# Start all services in detached mode
docker compose up -d

# Verify all containers are running
docker compose ps
```

**Expected Output**: All 5 services (mongodb, redis, backend, ai-services, frontend) showing "Up" status.

**Screenshot Required**: `docker compose ps` showing all services running.

### Step 3: Health Verification

```bash
# Wait 30 seconds for services to initialize
sleep 30

# Check MongoDB
docker compose exec mongodb mongosh -u admin -p password123 --eval "db.adminCommand('ping')"

# Check Redis
docker compose exec redis redis-cli ping

# Check Backend
curl http://localhost:5000/health

# Check AI Services
curl http://localhost:8000/health

# Check Frontend
curl -I http://localhost:3000
```

**Expected Output**: All health checks return positive responses.

**Screenshot Required**: Terminal showing all successful health checks.

## Phase 2: User Account Creation

### Step 1: Create Test User (Citizen)

```bash
# Create test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Citizen",
    "email": "testcitizen@civiceye.com",
    "password": "SecurePass123!",
    "role": "user"
  }' | jq .

# Save the token from response
export USER_TOKEN="<copy_token_from_response>"
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test Citizen",
    "email": "testcitizen@civiceye.com",
    "role": "user",
    "civicCredits": 0,
    "createdAt": "2025-11-19T..."
  }
}
```

**Screenshot Required**: Terminal showing successful user registration with token.

### Step 2: Create Test Officer (Authority)

```bash
# Create test officer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Officer",
    "email": "testofficer@civiceye.com",
    "password": "OfficerPass123!",
    "role": "authority"
  }' | jq .

# Save the token from response
export OFFICER_TOKEN="<copy_token_from_response>"
```

**Expected Response**: Similar to user response but with role "authority".

**Screenshot Required**: Terminal showing successful officer registration.

## Phase 3: Issue Reporting with Image

### Step 1: Create Test Image File

```bash
# Create a test image (sample pothole image)
# For actual testing, use a real image file of a civic issue
# Example: /tmp/test-pothole.jpg

# If you need to create a dummy image for testing:
convert -size 800x600 xc:gray -pointsize 40 -draw "text 200,300 'Test Pothole Issue'" /tmp/test-issue.jpg
```

### Step 2: Upload Image (if Cloudinary is configured)

```bash
# Upload image to Cloudinary
curl -X POST http://localhost:5000/api/upload/cloudinary \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "file=@/tmp/test-issue.jpg" | jq .

# Save the response
export IMAGE_URL="<cloudinary_url_from_response>"
export IMAGE_PUBLIC_ID="<public_id_from_response>"
```

**Note**: If Cloudinary is not configured, you can skip image upload and report issue without media.

### Step 3: Report Issue

**With Image**:
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Large Pothole on Main Street",
    "description": "Dangerous pothole approximately 2 feet wide and 6 inches deep causing vehicle damage and safety hazard",
    "category": "pothole",
    "department": "roads",
    "severity": "high",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716],
      "address": "123 Main Street, Near City Center, Bangalore",
      "pincode": "560001"
    },
    "media": [{
      "type": "image",
      "url": "'"$IMAGE_URL"'",
      "publicId": "'"$IMAGE_PUBLIC_ID"'"
    }]
  }' | jq .
```

**Without Image** (if Cloudinary not configured):
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Large Pothole on Main Street",
    "description": "Dangerous pothole approximately 2 feet wide and 6 inches deep causing vehicle damage and safety hazard",
    "category": "pothole",
    "department": "roads",
    "severity": "high",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716],
      "address": "123 Main Street, Near City Center, Bangalore",
      "pincode": "560001"
    }
  }' | jq .
```

**Expected Response**:
```json
{
  "success": true,
  "issue": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Large Pothole on Main Street",
    "description": "Dangerous pothole...",
    "category": "pothole",
    "status": "pending",
    "reportedBy": "507f1f77bcf86cd799439011",
    "location": {...},
    "upvoteCount": 0,
    "createdAt": "2025-11-19T..."
  }
}
```

**Save Issue ID**:
```bash
export ISSUE_ID="<copy_id_from_response>"
```

**Screenshot Required**: Terminal showing successful issue creation with all details.

## Phase 4: Officer Views and Manages Issue

### Step 1: Officer Views All Issues

```bash
curl -X GET http://localhost:5000/api/issues \
  -H "Authorization: Bearer $OFFICER_TOKEN" | jq .
```

**Expected Output**: List of all issues including the one just created.

**Screenshot Required**: Terminal showing issue list.

### Step 2: Officer Views Specific Issue Details

```bash
curl -X GET http://localhost:5000/api/issues/$ISSUE_ID \
  -H "Authorization: Bearer $OFFICER_TOKEN" | jq .
```

**Expected Output**: Complete issue details with reporter information.

**Screenshot Required**: Terminal showing detailed issue information.

### Step 3: Officer Assigns Issue

```bash
# First get officer's user ID
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $OFFICER_TOKEN" | jq -r '._id'

export OFFICER_ID="<copy_id_from_response>"

# Assign issue to self
curl -X PUT http://localhost:5000/api/issues/$ISSUE_ID/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -d '{
    "assignedTo": "'"$OFFICER_ID"'",
    "department": "roads"
  }' | jq .
```

**Expected Output**: Issue with updated assignedTo field.

**Screenshot Required**: Terminal showing successful assignment.

### Step 4: Officer Updates Status to In Progress

```bash
curl -X PUT http://localhost:5000/api/issues/$ISSUE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -d '{
    "status": "in-progress",
    "statusNotes": "Road repair team dispatched to location"
  }' | jq .
```

**Expected Output**: Issue with status "in-progress".

**Screenshot Required**: Terminal showing status update.

### Step 5: Officer Resolves the Issue

```bash
curl -X PUT http://localhost:5000/api/issues/$ISSUE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -d '{
    "status": "resolved",
    "resolutionNotes": "Pothole has been successfully filled and road surface repaired. Area is now safe for vehicles.",
    "resolutionDate": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"
  }' | jq .
```

**Expected Output**: Issue with status "resolved" and resolution details.

**Screenshot Required**: Terminal showing successful resolution.

## Phase 5: User Receives and Claims Credits

### Step 1: Check User Profile and Credits

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

**Expected Output**: User profile showing updated civicCredits (should have credits for reporting + resolution).

**Screenshot Required**: Terminal showing user profile with credits.

### Step 2: Check Gamification Stats

```bash
curl -X GET http://localhost:5000/api/gamification/stats \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

**Expected Output**: Statistics showing issues reported, credits earned, etc.

**Screenshot Required**: Terminal showing gamification statistics.

### Step 3: View Leaderboard

```bash
curl -X GET http://localhost:5000/api/gamification/leaderboard \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

**Expected Output**: Leaderboard with test user visible.

**Screenshot Required**: Terminal showing leaderboard.

### Step 4: Check User Badges (if earned)

```bash
curl -X GET http://localhost:5000/api/gamification/badges \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

**Expected Output**: List of badges earned by user.

**Screenshot Required**: Terminal showing badges.

## Phase 6: Frontend UI Testing

### Step 1: Access Application

1. Open browser: http://localhost:3000
2. You should see the CivicEye landing page

**Screenshot Required**: Browser showing CivicEye homepage.

### Step 2: User Login

1. Click "Login" or "Sign In"
2. Enter credentials:
   - Email: testcitizen@civiceye.com
   - Password: SecurePass123!
3. Click "Login"

**Screenshot Required**: Browser showing successful login and user dashboard.

### Step 3: View Reported Issues

1. Navigate to "My Issues" or "Dashboard"
2. You should see the pothole issue you created

**Screenshot Required**: Browser showing user's reported issues.

### Step 4: View Issue Details

1. Click on the pothole issue
2. View full details including status, location, and resolution notes

**Screenshot Required**: Browser showing issue details page with resolved status.

### Step 5: Check User Profile and Credits

1. Navigate to "Profile" or click on user name
2. View civic credits balance
3. View badges and achievements

**Screenshot Required**: Browser showing user profile with credits and statistics.

### Step 6: Officer Dashboard

1. Log out from user account
2. Log in as officer:
   - Email: testofficer@civiceye.com
   - Password: OfficerPass123!
3. Navigate to Officer Dashboard

**Screenshot Required**: Browser showing officer dashboard with issue management interface.

### Step 7: View Issues on Map

1. Navigate to "Map" or "Issues Map"
2. You should see issues plotted on map

**Screenshot Required**: Browser showing interactive map with issue markers.

## Verification Checklist

Mark each item as complete after successful test:

- [ ] All Docker containers built successfully
- [ ] All services running (mongodb, redis, backend, ai-services, frontend)
- [ ] All health checks passing
- [ ] Test user created successfully via API
- [ ] Test officer created successfully via API
- [ ] Issue reported with description and location
- [ ] Image uploaded (if Cloudinary configured) or issue created without image
- [ ] Officer can view all issues
- [ ] Officer can view specific issue details
- [ ] Officer can assign issue to self
- [ ] Officer can update issue status to "in-progress"
- [ ] Officer can resolve issue with resolution notes
- [ ] User's civic credits increased after issue resolution
- [ ] User can view updated credits in profile
- [ ] Gamification stats show correct data
- [ ] Leaderboard displays user ranking
- [ ] Frontend homepage loads correctly
- [ ] User can login via UI
- [ ] User can view their issues in UI
- [ ] User can view issue details in UI
- [ ] User profile shows credits and badges
- [ ] Officer can login via UI
- [ ] Officer dashboard shows issue management interface
- [ ] Map view displays issues with markers

## Test Results Summary Template

```markdown
# CivicEye Docker Testing - Results

**Test Date**: [Date]
**Tester**: [Name]
**Environment**: Docker Compose

## Test Results

### Phase 1: Docker Setup ✅/❌
- Build Status: [SUCCESS/FAILED]
- Services Running: [5/5]
- Build Time: [X minutes]
- Issues: [None/List issues]

### Phase 2: User Accounts ✅/❌
- User Creation: [SUCCESS/FAILED]
- Officer Creation: [SUCCESS/FAILED]
- Authentication: [WORKING/FAILED]

### Phase 3: Issue Reporting ✅/❌
- Image Upload: [SUCCESS/FAILED/SKIPPED]
- Issue Creation: [SUCCESS/FAILED]
- Issue ID: [ID]

### Phase 4: Officer Management ✅/❌
- View Issues: [SUCCESS/FAILED]
- Assign Issue: [SUCCESS/FAILED]
- Update Status: [SUCCESS/FAILED]
- Resolve Issue: [SUCCESS/FAILED]

### Phase 5: Credits & Gamification ✅/❌
- Credits Awarded: [SUCCESS/FAILED]
- Credits Amount: [X credits]
- Gamification Stats: [WORKING/FAILED]
- Leaderboard: [WORKING/FAILED]

### Phase 6: Frontend UI ✅/❌
- Homepage Load: [SUCCESS/FAILED]
- User Login: [SUCCESS/FAILED]
- Issue Display: [SUCCESS/FAILED]
- Profile View: [SUCCESS/FAILED]
- Officer Dashboard: [SUCCESS/FAILED]
- Map View: [SUCCESS/FAILED]

## Issues Encountered

1. [Issue description]
   - **Resolution**: [How it was fixed]

2. [Issue description]
   - **Resolution**: [How it was fixed]

## Screenshots

All required screenshots attached:
- [ ] Docker build completion
- [ ] Services running status
- [ ] Health checks passing
- [ ] User registration
- [ ] Officer registration
- [ ] Issue creation
- [ ] Officer viewing issues
- [ ] Issue assignment
- [ ] Status updates
- [ ] Issue resolution
- [ ] User credits updated
- [ ] Gamification stats
- [ ] Leaderboard
- [ ] Frontend homepage
- [ ] User dashboard
- [ ] Issue details page
- [ ] User profile with credits
- [ ] Officer dashboard
- [ ] Map with issues

## Conclusion

[Overall assessment of the application]

**Application Status**: [READY FOR PRODUCTION / NEEDS WORK / PARTIALLY WORKING]

**Recommended Next Steps**:
1. [Recommendation 1]
2. [Recommendation 2]
```

## Troubleshooting Common Issues

### Issue: Docker build fails with npm errors
**Solution**: 
- Check Node 20 is being used in Dockerfile
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker compose build --no-cache`

### Issue: Services not starting
**Solution**:
- Check logs: `docker compose logs [service-name]`
- Verify ports are not in use
- Check Docker resources (RAM/CPU)

### Issue: MongoDB connection failed
**Solution**:
- Wait 30 seconds after `docker compose up`
- Check MongoDB logs: `docker compose logs mongodb`
- Verify credentials in docker-compose.yml

### Issue: Frontend shows blank page
**Solution**:
- Check frontend logs: `docker compose logs frontend`
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure backend is accessible at http://localhost:5000

### Issue: Credits not awarded
**Solution**:
- Check backend logs for errors
- Verify issue status is "resolved"
- Check gamification service logs
- Verify database connection

## Notes for Production

Before deploying to production:

1. **Security**:
   - Change MongoDB credentials
   - Update JWT_SECRET
   - Enable HTTPS/SSL
   - Configure CORS properly

2. **Performance**:
   - Set up MongoDB Atlas for database
   - Use Redis Cloud for caching
   - Configure CDN for static assets
   - Enable gzip compression

3. **Monitoring**:
   - Set up logging (ELK stack or similar)
   - Configure monitoring (Prometheus/Grafana)
   - Set up alerts for service failures
   - Track performance metrics

4. **Backup**:
   - Configure automated MongoDB backups
   - Set up disaster recovery plan
   - Document restore procedures

## Support

For issues or questions:
- Refer to DOCKER_TESTING_GUIDE.md
- Check logs: `docker compose logs -f`
- GitHub Issues: https://github.com/harshith-varma07/CivicEye/issues

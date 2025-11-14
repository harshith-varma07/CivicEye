# CivicEye Docker Testing Guide

## Overview
This guide provides step-by-step instructions for testing CivicEye through Docker, including all three user roles: User, Officer, and Admin.

## Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 5000, 8000, 27017, 6379 available

## Quick Start

### 1. Start All Services
```bash
cd /home/runner/work/CivicEye/CivicEye
docker compose up -d
```

**Note**: First startup takes 2-3 minutes as npm dependencies are installed at runtime.

### 2. Monitor Startup
```bash
# Check service status
docker compose ps

# Watch backend logs for admin creation
docker compose logs -f backend

# Wait for "Default admin user created successfully!" message
```

### 3. Verify Services are Running
```bash
# Check all services are up
docker compose ps

# Expected output shows all services as "Up" or "Running"
```

## Default Credentials

### Admin Account (Pre-created)
- **Login ID**: ADMIN001
- **Password**: admin123
- **Role**: admin

## Testing Workflow

### Step 1: Register a User Account

**Via API (using curl)**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "aadharNumber": "123456789012",
    "password": "user123",
    "phone": "9876543210",
    "address": "123 Main St",
    "pincode": "560001"
  }'
```

**Expected Response**:
```json
{
  "message": "Registration request submitted successfully. Please wait for admin approval.",
  "_id": "...",
  "name": "John Doe",
  "aadharNumber": "123456789012",
  "accountStatus": "pending"
}
```

**Via Frontend** (if available):
1. Navigate to http://localhost:3000
2. Click on "Register" or "Sign Up"
3. Fill in the registration form with:
   - Name: John Doe
   - Aadhar Number: 123456789012
   - Password: user123
   - Phone: 9876543210
   - Address: 123 Main St
   - Pincode: 560001
4. Submit the form
5. Note: Account will be in "pending" status

### Step 2: Login as Admin and Approve User

**Login as Admin via API**:
```bash
# Get admin token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "ADMIN001",
    "password": "admin123",
    "role": "admin"
  }' | jq -r '.token')

echo "Admin Token: $TOKEN"
```

**Get Pending Users**:
```bash
curl -X GET http://localhost:5000/api/admin/pending-users \
  -H "Authorization: Bearer $TOKEN"
```

**Approve the User** (replace USER_ID with actual ID from pending users):
```bash
curl -X PUT http://localhost:5000/api/admin/approve-user/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "message": "User approved successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "aadharNumber": "123456789012",
    "accountStatus": "approved"
  }
}
```

**Via Frontend**:
1. Navigate to http://localhost:3000
2. Click "Login"
3. Select "Admin" role
4. Enter:
   - Admin ID: ADMIN001
   - Password: admin123
5. Navigate to "Pending Users" section
6. Find John Doe's registration
7. Click "Approve"
8. **Screenshot**: Take a screenshot showing the approval action

### Step 3: Create an Officer Account (via Admin)

**Create Officer via API**:
```bash
curl -X POST http://localhost:5000/api/admin/create-officer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Officer Smith",
    "officerId": "OFF001",
    "password": "officer123",
    "phone": "9876543211",
    "department": "roads",
    "pincode": "560001"
  }'
```

**Expected Response**:
```json
{
  "message": "Officer created successfully",
  "officer": {
    "_id": "...",
    "name": "Officer Smith",
    "officerId": "OFF001",
    "department": "roads",
    "role": "officer"
  }
}
```

**Via Frontend**:
1. While logged in as Admin
2. Navigate to "Manage Users" or "Create Officer"
3. Fill in the officer creation form:
   - Name: Officer Smith
   - Officer ID: OFF001
   - Password: officer123
   - Department: Roads
   - Phone: 9876543211
4. Click "Create Officer"
5. **Screenshot**: Take a screenshot showing successful officer creation

### Step 4: Login as User and Report an Issue

**Login as User via API**:
```bash
# Get user token
USER_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "123456789012",
    "password": "user123",
    "role": "user"
  }' | jq -r '.token')

echo "User Token: $USER_TOKEN"
```

**Report an Issue**:
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Large Pothole on Main Street",
    "description": "There is a large pothole causing traffic issues",
    "category": "pothole",
    "department": "roads",
    "location": {
      "coordinates": [77.5946, 12.9716],
      "address": "123 Main St, Bangalore",
      "pincode": "560001"
    },
    "priority": "high"
  }'
```

**Expected Response**:
```json
{
  "_id": "...",
  "title": "Large Pothole on Main Street",
  "description": "There is a large pothole causing traffic issues",
  "category": "pothole",
  "status": "pending",
  "upvoteCount": 0,
  "createdAt": "..."
}
```

**Via Frontend**:
1. Logout and login as John Doe:
   - Login ID: 123456789012 (Aadhar number)
   - Password: user123
   - Role: User
2. Click "Report Issue"
3. Fill in the issue form:
   - Title: Large Pothole on Main Street
   - Description: There is a large pothole causing traffic issues
   - Category: Pothole
   - Department: Roads
   - Location: Click on map or enter address
4. Upload photo (optional)
5. Click "Submit"
6. **Screenshot**: Take a screenshot showing the reported issue

### Step 5: Login as Officer and View the Issue

**Login as Officer via API**:
```bash
# Get officer token
OFFICER_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "OFF001",
    "password": "officer123",
    "role": "officer"
  }' | jq -r '.token')

echo "Officer Token: $OFFICER_TOKEN"
```

**Get All Issues**:
```bash
curl -X GET "http://localhost:5000/api/issues?department=roads" \
  -H "Authorization: Bearer $OFFICER_TOKEN"
```

**Get Specific Issue** (replace ISSUE_ID):
```bash
curl -X GET http://localhost:5000/api/issues/ISSUE_ID \
  -H "Authorization: Bearer $OFFICER_TOKEN"
```

**Update Issue Status**:
```bash
curl -X PUT http://localhost:5000/api/issues/ISSUE_ID/status \
  -H "Authorization: Bearer $OFFICER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "notes": "Work has been assigned to contractor"
  }'
```

**Via Frontend**:
1. Logout and login as Officer Smith:
   - Login ID: OFF001
   - Password: officer123
   - Role: Officer
2. Navigate to "My Issues" or "Department Issues"
3. Find the pothole issue reported by John Doe
4. Click to view details
5. **Screenshot**: Take a screenshot showing the issue details
6. Update status to "In Progress" (optional)
7. Add notes (optional)

## API Testing with Postman/Insomnia

### Collection Structure
```
CivicEye API
├── Auth
│   ├── Register User
│   ├── Login (User)
│   ├── Login (Officer)
│   └── Login (Admin)
├── Admin
│   ├── Get Pending Users
│   ├── Approve User
│   ├── Reject User
│   ├── Create Officer
│   └── Get Statistics
├── Issues
│   ├── Create Issue
│   ├── Get All Issues
│   ├── Get Issue by ID
│   ├── Update Issue Status
│   ├── Upvote Issue
│   └── Add Comment
└── Gamification
    ├── Get Leaderboard
    └── Get User Stats
```

## Troubleshooting

### Services Not Starting
```bash
# Check logs
docker compose logs backend
docker compose logs frontend
docker compose logs ai-services

# Restart specific service
docker compose restart backend
```

### npm Install Issues
The first startup may show "Exit handler never called!" errors from npm. This is a known npm bug but doesn't prevent successful installation. Services will restart automatically once installation completes.

### Database Connection Issues
```bash
# Restart MongoDB
docker compose restart mongodb

# Check MongoDB is healthy
docker compose ps mongodb
```

### Port Already in Use
```bash
# Find and stop conflicting processes
lsof -i :3000
lsof -i :5000
lsof -i :8000

# Or use different ports in docker-compose.yml
```

## Clean Up

### Stop Services
```bash
docker compose down
```

### Remove All Data
```bash
docker compose down -v
```

### Rebuild from Scratch
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## Screenshots Checklist

Required screenshots for testing documentation:
- [ ] User registration form submission
- [ ] Admin dashboard showing pending user
- [ ] Admin approving the user (with success message)
- [ ] Admin creating officer account (with success message)
- [ ] User dashboard after login
- [ ] Issue reporting form with details filled
- [ ] Successfully reported issue confirmation
- [ ] Officer dashboard showing issues
- [ ] Officer viewing the specific issue details
- [ ] Issue status update by officer

## Additional Testing

### Test User Rejection
```bash
# Reject a user instead of approving
curl -X PUT http://localhost:5000/api/admin/reject-user/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Invalid Aadhar number"
  }'
```

### Test Issue Upvoting
```bash
# Upvote an issue
curl -X PUT http://localhost:5000/api/issues/ISSUE_ID/upvote \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Test Comments
```bash
# Add comment to issue
curl -X POST http://localhost:5000/api/issues/ISSUE_ID/comments \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This pothole has been here for weeks!"
  }'
```

## Test Accounts Summary

| Role | Login ID | Password | Purpose |
|------|----------|----------|---------|
| Admin | ADMIN001 | admin123 | Pre-created, approve users, create officers |
| User | 123456789012 | user123 | Test user account for reporting issues |
| Officer | OFF001 | officer123 | Test officer account for managing issues |

## Notes

1. All services run in development mode for easier debugging
2. MongoDB data persists in Docker volume `civiceye_mongodb_data`
3. First startup requires patience for npm install (2-3 minutes)
4. Check service health with `docker compose ps`
5. View real-time logs with `docker compose logs -f [service-name]`
6. The admin account is automatically created on first backend startup

## Success Criteria

✅ All services start successfully
✅ Admin can login with default credentials  
✅ User can register and get pending status
✅ Admin can approve user registration
✅ Admin can create officer account
✅ Approved user can login
✅ User can report an issue
✅ Officer can login and view issues
✅ Officer can update issue status

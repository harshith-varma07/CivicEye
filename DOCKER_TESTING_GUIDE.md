# Docker Testing Guide for CivicEye

This guide provides step-by-step instructions for testing the CivicEye application using Docker, including creating accounts for all three roles (user, officer, admin) and testing all features.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of free RAM
- Ports 3000, 5000, 8000, 6379, 27017 available

## Step 1: Build and Start the Application

```bash
# Clone the repository (if not already done)
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye

# Build and start all services
docker-compose up --build
```

Wait for all services to start. You should see logs from:
- MongoDB (civiceye-mongo)
- Redis (civiceye-redis)
- Backend API (civiceye-backend)
- AI Services (civiceye-ai)
- Frontend (civiceye-frontend)

## Step 2: Initialize the First Admin Account

In a new terminal, run:

```bash
# Execute the admin creation script inside the backend container
docker exec -it civiceye-backend node scripts/docker-init-admin.js
```

This will create the first admin account with credentials:
- **Admin ID**: ADMIN001
- **Password**: admin123

## Step 3: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health
- **AI Services**: http://localhost:8000/docs

## Testing Workflow

### Test 1: Register a User Account

1. Go to http://localhost:3000
2. Click on "Register" or "Sign Up"
3. Select role: "User"
4. Fill in the registration form:
   - Name: Test User
   - Aadhar Number: 123456789012 (12 digits)
   - Password: user123
   - Phone: 9876543210
   - Address: 123 Test Street
   - Pincode: 560001
5. Submit the registration
6. **Expected**: Message "Registration request submitted. Please wait for admin approval."
7. **Screenshot**: Take a screenshot of the successful registration message

### Test 2: Admin Login and Approve User

1. Go to http://localhost:3000
2. Click "Login"
3. Select role: "Admin"
4. Enter credentials:
   - Admin ID: ADMIN001
   - Password: admin123
5. Click "Login"
6. Navigate to "Pending Users" or "User Management"
7. Find the user "Test User" with status "Pending"
8. Click "Approve"
9. **Expected**: User status changes to "Approved"
10. **Screenshot**: Take a screenshot showing the approved user

### Test 3: Create an Officer Account (as Admin)

1. While logged in as admin, navigate to "Create Officer" or "Officers Management"
2. Fill in the officer creation form:
   - Name: Test Officer
   - Officer ID: OFFICER001
   - Password: officer123
   - Phone: 8765432109
   - Department: roads (or select from dropdown)
   - Pincode: 560001
3. Click "Create Officer"
4. **Expected**: Success message "Officer created successfully"
5. **Screenshot**: Take a screenshot showing the created officer

### Test 4: User Login and Report an Issue

1. Logout from admin account
2. Login as the approved user:
   - Role: User
   - Aadhar Number: 123456789012
   - Password: user123
3. Navigate to "Report Issue" or click the report button
4. Fill in the issue form:
   - Title: Pothole on Main Street
   - Description: Large pothole causing traffic issues
   - Category: pothole
   - Department: roads
   - Location: Click on map or enter coordinates
   - Address: Main Street, Bangalore
   - Pincode: 560001
   - Upload photo (optional)
5. Submit the issue
6. **Expected**: Success message "Issue reported successfully"
7. **Screenshot**: Take a screenshot of the reported issue

### Test 5: Officer Login and View Issue

1. Logout from user account
2. Login as the officer:
   - Role: Officer
   - Officer ID: OFFICER001
   - Password: officer123
3. Navigate to "Dashboard" or "Issues"
4. **Expected**: The issue "Pothole on Main Street" should be visible in the list
5. Click on the issue to view details
6. **Screenshot**: Take a screenshot showing the issue in officer's view

### Test 6: Officer Changes Issue Status

1. While viewing the issue details as officer
2. Find the "Update Status" or "Change Status" section
3. Change status from "pending" to "verified"
4. Click "Update Status"
5. **Expected**: Issue status changes to "verified"
6. Change status again to "in-progress"
7. **Expected**: Issue status changes to "in-progress"
8. Finally, change status to "resolved"
9. Add resolution notes: "Pothole filled with asphalt"
10. Click "Update Status" or "Resolve Issue"
11. **Expected**: Issue status changes to "resolved"
12. **Screenshot**: Take a screenshot showing the resolved issue

### Test 7: Verify User Credits

1. Logout from officer account
2. Login as the user again:
   - Role: User
   - Aadhar Number: 123456789012
   - Password: user123
3. Navigate to "Profile" or "Dashboard"
4. **Expected**: User should have earned 50 CivicCredits for the resolved issue
5. **Screenshot**: Take a screenshot showing the user's credits

## Additional Tests (Optional)

### Test Upvote Feature
1. Create another user account (follow Test 1 and 2)
2. Login as the second user
3. View the issue reported by the first user
4. Click "Upvote"
5. **Expected**: Upvote count increases

### Test Comment Feature
1. While viewing an issue
2. Add a comment: "This issue is critical"
3. **Expected**: Comment appears in the comments section

### Test Analytics
1. Login as admin or officer
2. Navigate to "Analytics" or "Dashboard"
3. **Expected**: View statistics about issues, users, and departments

## Stopping the Application

To stop all services:

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```

## Troubleshooting

### Services not starting
```bash
# Check service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Restart a specific service
docker-compose restart backend
```

### Port conflicts
If ports are already in use, modify `docker-compose.yml` to use different ports:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### Database connection issues
```bash
# Check MongoDB is running
docker exec -it civiceye-mongo mongosh

# Check if backend can connect
docker exec -it civiceye-backend npm run test
```

### Frontend not loading
```bash
# Rebuild frontend
docker-compose up --build frontend
```

## Expected Results Summary

After completing all tests, you should have:
1. ✅ One admin account (ADMIN001)
2. ✅ One user account (approved)
3. ✅ One officer account
4. ✅ One reported issue (resolved)
5. ✅ User has earned 50 CivicCredits
6. ✅ Screenshots documenting each step

## Screenshots Checklist

- [ ] User registration success
- [ ] Admin approving user
- [ ] Officer creation success
- [ ] User reporting issue
- [ ] Officer viewing issue
- [ ] Officer changing issue status to resolved
- [ ] User's civic credits after resolution

## Notes

- All default passwords should be changed in production
- The admin account password is `admin123` (change it immediately)
- Make sure to test on a fresh database for accurate results
- Screenshots should clearly show the action being performed and the result

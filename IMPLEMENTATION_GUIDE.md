# Role-Based Access Control Implementation Guide

## Summary of Changes

The CivicEye application has been updated with a comprehensive three-role system:

1. **User Role** - Citizens who report issues (Aadhar-based authentication, requires admin approval)
2. **Officer Role** - Department officials who handle issues (ID-based authentication, created by admin)
3. **Admin Role** - System administrators (ID-based authentication, created by admin)

## Quick Start

### 1. Create the First Admin Account

Before you can use the system, you need to create the first admin account:

```bash
cd backend
node scripts/createFirstAdmin.js
```

This will create an admin account with:
- **Admin ID**: ADMIN001
- **Password**: admin123 (change this immediately!)

### 2. Start the Application

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### 3. Login as Admin

1. Navigate to `http://localhost:3000/login`
2. Select **Admin** role
3. Enter Admin ID: `ADMIN001`
4. Enter Password: `admin123`
5. Click Login

### 4. Create Officers

1. Once logged in as admin, you'll be on the Admin Dashboard
2. Click "Create Officer" button
3. Fill in the officer details:
   - Name
   - Officer ID (e.g., OFF001, OFF002)
   - Password
   - Phone
   - Department (select from dropdown)
   - Pincode (the area this officer covers)
4. Click "Create"

### 5. Approve User Registrations

When citizens register:
1. They provide their Aadhar number and details
2. Their account status is set to "pending"
3. Admin sees them in the "Pending Users" tab
4. Admin can approve or reject with a reason

## User Flows

### For Citizens (Users)

**Registration:**
1. Go to `/register`
2. Fill in:
   - Full Name
   - 12-digit Aadhar Number
   - Phone Number
   - Address
   - Pincode
   - Password
3. Submit - account created immediately
4. **Can login right away** with basic access

**Login:**
1. Go to `/login`
2. Select "Citizen" role
3. Enter Aadhar number and password
4. Access dashboard immediately
5. See account status banner (pending/approved)

**Reporting Issues:**
1. Click "Report Issue"
2. Fill in issue details
3. Select category (e.g., pothole)
4. Department is auto-selected based on category
5. Add location and pincode
6. Issue is routed to officers in that department and pincode

### For Officers

**Login:**
1. Go to `/login`
2. Select "Officer" role
3. Enter Officer ID and password
4. Access officer dashboard

**Managing Issues:**
1. See only issues in your department and pincode
2. Update issue status:
   - Pending → Verified → Assigned → In Progress → Resolved
3. Add resolution notes when marking as resolved

### For Admins

**Login:**
1. Go to `/login`
2. Select "Admin" role
3. Enter Admin ID and password
4. Access admin dashboard

**Managing Users:**
1. View pending user registrations
2. Approve or reject users
3. View all users in the system

**Managing Officers:**
1. Create new officer accounts
2. Assign departments and pincodes
3. View all officers by department

**Managing Admins:**
1. Create additional admin accounts
2. Cannot delete the last admin (safety feature)

## Key Files Modified/Created

### Backend

**Modified:**
- `backend/src/models/User.js` - Added aadharNumber, officerId, accountStatus, department, pincode
- `backend/src/models/Issue.js` - Added department field
- `backend/src/controllers/authController.js` - Role-based login/registration
- `backend/src/controllers/issueController.js` - Department and pincode filtering
- `backend/src/routes/authRoutes.js` - Updated validation
- `backend/src/routes/issueRoutes.js` - Added department validation
- `backend/src/server.js` - Added admin routes

**Created:**
- `backend/src/controllers/adminController.js` - Admin operations
- `backend/src/routes/adminRoutes.js` - Admin API routes
- `backend/scripts/createFirstAdmin.js` - Bootstrap script

### Frontend

**Modified:**
- `frontend/src/pages/LoginPage.js` - Role selection, different login fields
- `frontend/src/pages/RegisterPage.js` - Aadhar-based registration
- `frontend/src/pages/DashboardPage.js` - Role-based redirect
- `frontend/src/pages/ReportIssuePage.js` - Department selection
- `frontend/src/pages/AuthorityDashboard.js` - Officer dashboard with filtering
- `frontend/src/services/authService.js` - Updated for new auth flow
- `frontend/src/App.js` - Added admin route

**Created:**
- `frontend/src/pages/AdminDashboard.js` - Complete admin interface

## Department to Category Mapping

The system auto-maps issue categories to departments:

| Category | Department |
|----------|-----------|
| Pothole | Roads & Infrastructure |
| Streetlight | Electricity |
| Garbage | Sanitation |
| Water | Water Supply |
| Sewage | Sanitation |
| Traffic | Traffic Management |
| Park | Parks & Recreation |
| Building | Building & Construction |
| Other | General |

## API Authentication

All API requests (except register and login) require authentication:

```javascript
// Header format
Authorization: Bearer <jwt_token>
```

Tokens are automatically managed by the frontend and stored in localStorage.

## Environment Variables

Make sure these are set in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/civiceye
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

## Testing the System

### 1. Test User Registration Flow
1. Register as a citizen with Aadhar number
2. **Login immediately** - should work
3. Should see "pending verification" banner
4. Login as admin
5. Approve the user
6. Login as the user again - should see "verified" banner

### 2. Test Officer Flow
1. Login as admin
2. Create an officer with department "Roads" and pincode "123456"
3. Logout and login as that officer
4. Should only see issues in "Roads" department with pincode "123456"

### 3. Test Issue Routing
1. Login as a user
2. Create an issue with category "Pothole" and pincode "123456"
3. Login as the officer (Roads department, pincode 123456)
4. Should see the new issue
5. Login as an officer with different department or pincode
6. Should NOT see the issue

## Troubleshooting

**Issue: "Cannot read property 'role' of null"**
- Solution: Clear localStorage and login again

**Issue: User can't login after registration**
- Check: Password is correct
- Verify: Aadhar number is exactly 12 digits
- Check: Account is not rejected

**Issue: Officer sees no issues**
- Check: Are there issues in their department?
- Verify: Does the pincode match?

**Issue: Admin routes return 403**
- Check: Is the user actually logged in as admin?
- Verify: Is the JWT token valid?

## Security Considerations

1. **Change default admin password immediately**
2. **Use strong passwords for all accounts**
3. **Keep JWT_SECRET secure and random**
4. **Enable HTTPS in production**
5. **Implement rate limiting** (already configured)
6. **Regular security audits**

## Next Steps

1. **Integrate with Aadhaar Verification API** for real-time validation
2. **Add email/SMS notifications** for account approval
3. **Implement password reset** functionality
4. **Add two-factor authentication** for admin accounts
5. **Create mobile apps** for iOS and Android
6. **Add bulk import** for officers via CSV

## Support

For detailed documentation, see:
- `ROLE_BASED_SYSTEM.md` - Complete role system documentation
- `API_DOCUMENTATION.md` - API reference
- `ARCHITECTURE.md` - System architecture

## Version

- **Version**: 2.0.0
- **Release Date**: November 10, 2025
- **Breaking Changes**: Yes - requires database migration and new authentication flow

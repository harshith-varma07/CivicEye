# CivicEye Role-Based Access Control System

## Overview
The CivicEye application now implements a comprehensive three-role system with distinct authentication flows, permissions, and workflows.

## User Roles

### 1. User Role (Citizens)
**Purpose**: Citizens who report civic issues in their area

**Registration Process**:
- Navigate to the registration page
- Provide the following information:
  - Full Name
  - 12-digit Aadhar Number (used as login ID)
  - Phone Number
  - Full Address
  - Pincode
  - Password (minimum 6 characters)
  - Confirm Password
- Account is created immediately with "pending" status
- **Users can login immediately after registration**
- Full feature access granted after admin approval

**Login Process**:
- Select "Citizen" role on the login page
- Enter 12-digit Aadhar number
- Enter password
- Can login regardless of approval status (except if rejected)
- Dashboard shows verification status banner

**Permissions**:
- Report civic issues in their area (if not rejected)
- Select issue category and department
- Upload photos/videos of issues
- View all issues
- Upvote issues
- Add comments to issues
- View civic credits and badges
- Access leaderboard

**Restrictions**:
- Cannot update issue status
- Cannot assign issues
- Cannot access admin or officer dashboards
- Rejected users cannot create new issues

**Account Status Effects**:
- **Pending**: Can login and use most features, see warning banner, awaiting admin verification
- **Approved**: Full access to all features, see success banner
- **Rejected**: Can login but cannot create issues, see rejection reason

### 2. Officer Role (Government Officials)
**Purpose**: Department officials who handle and resolve civic issues

**Account Creation**:
- Only admins can create officer accounts
- No self-registration available
- Admin provides:
  - Officer Name
  - Officer ID (used for login)
  - Password
  - Phone Number
  - Department assignment
  - Pincode coverage area
- Account is automatically approved upon creation

**Login Process**:
- Select "Officer" role on the login page
- Enter Officer ID
- Enter password
- Logs in successfully (no approval needed)

**Permissions**:
- View issues filtered by:
  - Their assigned department
  - Their designated pincode area
- Update issue status (pending, verified, assigned, in-progress, resolved, rejected)
- Add resolution notes when marking issues as resolved
- View analytics for their department
- Add comments to issues

**Restrictions**:
- Cannot create new issues
- Cannot create or manage user accounts
- Cannot create other officers or admins
- Can only see issues in their department and pincode

### 3. Admin Role (System Administrators)
**Purpose**: Manage the entire system, users, and officers

**Account Creation**:
- Only existing admins can create new admin accounts
- No self-registration available
- Admin provides:
  - Admin Name
  - Admin ID (used for login)
  - Password
  - Phone Number
- Account is automatically approved upon creation

**Login Process**:
- Select "Admin" role on the login page
- Enter Admin ID
- Enter password
- Logs in successfully

**Permissions**:
- View all pending user registrations
- Approve or reject user registrations with reasons
- Create officer accounts with department and pincode assignment
- Create new admin accounts
- View all users (citizens, officers, admins)
- View system statistics:
  - Total users, pending users, approved users
  - Total officers by department
  - Total admins
- Update or delete user accounts
- View all issues (not filtered)
- All officer permissions

**Restrictions**:
- Cannot delete the last admin account (system safety)

## Department Categories

The system includes the following departments:

1. **Roads & Infrastructure** (`roads`)
   - Handles: Potholes, road damage
   
2. **Electricity** (`electricity`)
   - Handles: Street lights, power issues

3. **Water Supply** (`water`)
   - Handles: Water supply problems

4. **Sanitation** (`sanitation`)
   - Handles: Garbage, sewage issues

5. **Parks & Recreation** (`parks`)
   - Handles: Park maintenance

6. **Building & Construction** (`building`)
   - Handles: Building-related issues

7. **Traffic Management** (`traffic`)
   - Handles: Traffic problems

8. **General** (`general`)
   - Handles: Other miscellaneous issues

## Issue Routing System

When a user reports an issue:

1. User selects an issue category
2. System auto-suggests the appropriate department
3. User can override the department selection if needed
4. User must provide pincode
5. Issue is routed to officers who match:
   - Same department
   - Same pincode area
6. All matching officers receive notifications

## Authentication Flow

### User Registration & Login
```
1. User registers with Aadhar → Account created (Status: Pending)
2. User can login immediately → Sees verification pending notice
3. Admin reviews registration → Approves/Rejects
4. If approved → User gets full access + success banner
5. If rejected → User sees rejection reason, cannot create issues
```

### Officer Creation & Login
```
1. Admin creates officer account → Status: Approved
2. Officer receives credentials
3. Officer can login immediately
```

### Admin Creation & Login
```
1. Existing admin creates new admin → Status: Approved
2. New admin receives credentials
3. New admin can login immediately
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (Aadhar-based)
- `POST /api/auth/login` - Role-based login (User/Officer/Admin)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Admin Operations
- `GET /api/admin/pending-users` - Get pending user registrations
- `GET /api/admin/users` - Get all users with filters
- `PUT /api/admin/approve-user/:id` - Approve user registration
- `PUT /api/admin/reject-user/:id` - Reject user with reason
- `POST /api/admin/create-officer` - Create officer account
- `POST /api/admin/create-admin` - Create admin account
- `PUT /api/admin/update-user/:id` - Update user details
- `DELETE /api/admin/delete-user/:id` - Delete user account
- `GET /api/admin/stats` - Get system statistics

### Issues
- `POST /api/issues` - Create issue (User only)
- `GET /api/issues` - Get issues (filtered by role)
- `GET /api/issues/:id` - Get single issue
- `PUT /api/issues/:id/status` - Update status (Officer/Admin)
- `PUT /api/issues/:id/assign` - Assign issue (Officer/Admin)
- `PUT /api/issues/:id/upvote` - Upvote issue
- `POST /api/issues/:id/comments` - Add comment

## Database Schema Changes

### User Model
```javascript
{
  name: String (required),
  aadharNumber: String (unique, 12 digits) - For users,
  officerId: String (unique) - For officers and admins,
  password: String (required, hashed),
  phone: String,
  address: String - For users,
  pincode: String,
  role: String (user/officer/admin),
  accountStatus: String (pending/approved/rejected),
  department: String - For officers,
  rejectionReason: String - For rejected users,
  createdBy: ObjectId - Admin who created this account,
  // ... other fields
}
```

### Issue Model
```javascript
{
  title: String (required),
  description: String (required),
  category: String (required),
  department: String (required),
  location: {
    coordinates: [Number],
    address: String,
    pincode: String
  },
  reportedBy: ObjectId (User),
  assignedTo: ObjectId (Officer),
  status: String,
  // ... other fields
}
```

## Frontend Routes

- `/` - Home page
- `/login` - Login page (role selection)
- `/register` - User registration (citizens only)
- `/dashboard` - Citizen dashboard (auto-redirects based on role)
- `/admin` - Admin dashboard
- `/authority` - Officer dashboard
- `/report` - Report issue page (users only)
- `/issues/:id` - Issue details page
- `/leaderboard` - Civic credits leaderboard

## Initial Setup

### Creating the First Admin Account

Since there's no signup for admin, you'll need to create the first admin manually in the database:

```javascript
// Using MongoDB shell or a script
const bcrypt = require('bcryptjs');

const firstAdmin = {
  name: "System Administrator",
  officerId: "ADMIN001",
  password: await bcrypt.hash("admin123", 10),
  phone: "1234567890",
  role: "admin",
  accountStatus: "approved"
};

// Insert into User collection
db.users.insertOne(firstAdmin);
```

After creating the first admin, they can login and create more admins and officers through the admin dashboard.

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Authentication**: Token-based authentication
3. **Role-based Authorization**: Middleware checks user role for protected routes
4. **Account Approval**: Users must be approved by admin
5. **Unique Identifiers**: Aadhar numbers and officer IDs must be unique
6. **Input Validation**: All inputs are validated on both frontend and backend

## Notifications

When significant events occur:
- Users receive notification when account is approved/rejected
- Officers receive notification when new issues are reported in their department/pincode
- Users receive notification when their issue is resolved
- Users receive notification when their issue is upvoted

## Best Practices

1. **For Admins**:
   - Review user registrations regularly
   - Provide clear rejection reasons
   - Assign officers to appropriate departments and pincodes
   - Create backup admin accounts

2. **For Officers**:
   - Update issue status regularly
   - Provide detailed resolution notes
   - Monitor issues in your area

3. **For Users**:
   - Provide accurate Aadhar information
   - Select correct department for issues
   - Add detailed descriptions and photos
   - Keep pincode accurate for proper routing

## Troubleshooting

**User can't login after registration**:
- Check if admin has approved the account
- Verify Aadhar number is correct (12 digits)
- Check account status in admin dashboard

**Officer not seeing any issues**:
- Verify department assignment is correct
- Check if pincode matches issue locations
- Ensure issues exist in that department/pincode

**Admin can't be deleted**:
- System prevents deletion of the last admin
- Create another admin first, then delete

## Future Enhancements

Potential improvements:
- Email/SMS notifications for account approval
- Bulk officer creation via CSV import
- Officer performance analytics
- Department-wise SLA tracking
- Mobile app with biometric authentication
- Integration with Aadhaar verification API

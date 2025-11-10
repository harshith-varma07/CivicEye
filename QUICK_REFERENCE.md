# CivicEye Roles Quick Reference Card

## 🔐 Authentication Credentials

| Role | Login ID | Example | Signup Available? |
|------|----------|---------|-------------------|
| **Citizen/User** | 12-digit Aadhar Number | 123456789012 | ✅ Yes (requires approval) |
| **Officer** | Officer ID | OFF001, OFF002 | ❌ No (admin creates) |
| **Admin** | Admin ID | ADMIN001, ADMIN002 | ❌ No (admin creates) |

## 👥 Role Permissions Matrix

| Permission | User | Officer | Admin |
|------------|------|---------|-------|
| Register account | ✅ | ❌ | ❌ |
| Report issues | ✅ | ❌ | ✅ |
| View all issues | ✅ | ⚠️ Filtered* | ✅ |
| Upvote issues | ✅ | ✅ | ✅ |
| Comment on issues | ✅ | ✅ | ✅ |
| Update issue status | ❌ | ✅ | ✅ |
| Assign issues | ❌ | ✅ | ✅ |
| Approve users | ❌ | ❌ | ✅ |
| Create officers | ❌ | ❌ | ✅ |
| Create admins | ❌ | ❌ | ✅ |
| View analytics | ❌ | ✅ | ✅ |

*Officers only see issues in their department and pincode

## 📋 User (Citizen) Workflow

### Registration Steps
1. Navigate to `/register`
2. Fill in details:
   - Name
   - **Aadhar Number** (12 digits)
   - Phone
   - Address
   - Pincode
   - Password
3. Submit → Account created immediately
4. Can login right away with limited access
5. Full access granted after admin approval

### Login Steps
1. Navigate to `/login`
2. Select **"Citizen"** role
3. Enter Aadhar number
4. Enter password
5. Click Login (works immediately after registration)

### Reporting Issues
1. Click "Report Issue"
2. Enter title and description
3. Select category
4. Department auto-selected
5. Add location and pincode
6. Upload photos (optional)
7. Submit

## 👮 Officer Workflow

### How Officers Are Created
- Only admins can create officer accounts
- Admin provides:
  - Name, Officer ID, Password
  - **Department assignment**
  - **Pincode coverage area**

### Login Steps
1. Navigate to `/login`
2. Select **"Officer"** role
3. Enter Officer ID
4. Enter password
5. Click Login → Go to Officer Dashboard

### Managing Issues
1. View issues filtered by your department/pincode
2. Click "Update Status" on any issue
3. Change status:
   - Pending → Verified → Assigned → In Progress → Resolved
4. Add resolution notes (required for "Resolved")
5. Submit

## 👨‍💼 Admin Workflow

### Creating the First Admin
```bash
cd backend
node scripts/createFirstAdmin.js
```
Creates: ADMIN001 / admin123

### Login Steps
1. Navigate to `/login`
2. Select **"Admin"** role
3. Enter Admin ID
4. Enter password
5. Click Login → Go to Admin Dashboard

### Approving Users
1. Go to "Pending Users" tab
2. Review user details
3. Click "Approve" or "Reject"
4. If rejecting, provide reason
5. User receives notification

### Creating Officers
1. Click "Create Officer"
2. Fill in form:
   - Name
   - Officer ID (e.g., OFF001)
   - Password
   - Phone
   - **Department** (select from list)
   - **Pincode** (area coverage)
3. Click "Create"

### Creating Admins
1. Click "Create Admin"
2. Fill in form:
   - Name
   - Admin ID (e.g., ADMIN002)
   - Password
   - Phone
3. Click "Create"

## 🏢 Departments Reference

| Department Code | Full Name | Handles |
|----------------|-----------|---------|
| `roads` | Roads & Infrastructure | Potholes, road damage |
| `electricity` | Electricity | Street lights, power |
| `water` | Water Supply | Water issues |
| `sanitation` | Sanitation | Garbage, sewage |
| `parks` | Parks & Recreation | Park maintenance |
| `building` | Building & Construction | Building issues |
| `traffic` | Traffic Management | Traffic problems |
| `general` | General | Other issues |

## 📊 Issue Status Flow

```
Pending → Verified → Assigned → In Progress → Resolved
                                            ↓
                                         Rejected
```

- **Pending**: Just reported, awaiting verification
- **Verified**: Confirmed as valid issue
- **Assigned**: Assigned to specific officer
- **In Progress**: Officer is working on it
- **Resolved**: Issue fixed (requires notes)
- **Rejected**: Not a valid issue

## 🎯 Issue Routing Logic

When a user reports an issue:
1. User selects **Category** (e.g., "Pothole")
2. System suggests **Department** (e.g., "Roads")
3. User provides **Pincode** (e.g., "560001")
4. Issue is sent to all officers where:
   - `officer.department === "roads"`
   - `officer.pincode === "560001"`

## 🔒 Account Status States

### For Users:
- **Pending**: Can login and use basic features, awaiting admin approval for full access
- **Approved**: Full access to all features
- **Rejected**: Cannot create issues or access features (can still login to see status)

### For Officers & Admins:
- Always **Approved** (created by admin)

## 🚀 Quick Start Commands

```bash
# Create first admin
cd backend
node scripts/createFirstAdmin.js

# Start backend
npm start

# Start frontend (new terminal)
cd ../frontend
npm start

# Access application
http://localhost:3000
```

## 🆘 Common Issues

### "Your account was rejected"
- **Reason**: Admin rejected your account
- **See**: Rejection reason in the error message
- **Action**: Contact admin or create a new account

### "Invalid Aadhar number or password"
- **Check**: Aadhar must be exactly 12 digits
- **Check**: Password is correct
- **Verify**: You selected "Citizen" role

### "Not authorized"
- **Solution**: Check you're using correct role
- **Check**: Token might be expired, logout and login again

### Officer sees no issues
- **Check**: Are there issues in your department?
- **Check**: Are there issues with your pincode?
- **Contact**: Admin to verify department/pincode assignment

## 📱 User Interface Routes

| Route | Accessible By | Purpose |
|-------|---------------|---------|
| `/` | Everyone | Home page |
| `/login` | Not logged in | Login page |
| `/register` | Not logged in | User registration |
| `/dashboard` | User | User dashboard |
| `/report` | User | Report new issue |
| `/issues/:id` | Everyone | View issue details |
| `/leaderboard` | Everyone | View civic credits |
| `/authority` | Officer | Officer dashboard |
| `/admin` | Admin | Admin dashboard |

## 💡 Tips & Best Practices

### For Users:
- ✅ Provide accurate Aadhar number
- ✅ Select correct category and pincode
- ✅ Upload clear photos of the issue
- ✅ Check issue status regularly

### For Officers:
- ✅ Update status regularly
- ✅ Provide detailed resolution notes
- ✅ Monitor your assigned area
- ✅ Respond to critical priority issues first

### For Admins:
- ✅ Review user registrations promptly
- ✅ Provide clear rejection reasons
- ✅ Assign officers to correct departments/pincodes
- ✅ Create backup admin accounts
- ✅ Change default passwords immediately
- ✅ Monitor system statistics

## 🔢 Default Credentials

**First Admin** (after running script):
- Admin ID: `ADMIN001`
- Password: `admin123`
- ⚠️ **CHANGE IMMEDIATELY!**

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_GUIDE.md`
2. Check `ROLE_BASED_SYSTEM.md`
3. Review `CHANGES.md` for technical details
4. Check console for error messages

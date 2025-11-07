# CivicEye API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
```
POST /auth/register

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "citizen"  // or "authority"
}

Response:
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "citizen",
  "civicCredits": 0,
  "token": "..."
}
```

### Login
```
POST /auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "citizen",
  "civicCredits": 100,
  "token": "..."
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "citizen",
  "civicCredits": 100,
  ...
}
```

## Issues

### Create Issue
```
POST /issues
Authorization: Bearer <token>

Request Body:
{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic issues",
  "category": "pothole",
  "location": {
    "coordinates": [-73.935242, 40.730610],  // [longitude, latitude]
    "address": "123 Main St, New York, NY"
  },
  "media": [
    {
      "type": "image",
      "url": "https://...",
      "cloudinaryId": "..."
    }
  ]
}

Response:
{
  "_id": "...",
  "title": "Pothole on Main Street",
  "status": "pending",
  "upvoteCount": 0,
  ...
}
```

### Get Issues
```
GET /issues?status=pending&category=pothole&page=1&limit=20

Query Parameters:
- status: pending, verified, assigned, in-progress, resolved, rejected
- category: pothole, streetlight, garbage, water, sewage, traffic, park, building, other
- priority: low, medium, high, critical
- latitude: number
- longitude: number
- radius: number (in km)
- page: number (default: 1)
- limit: number (default: 20)

Response:
{
  "issues": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalIssues": 100
}
```

### Get Single Issue
```
GET /issues/:id

Response:
{
  "_id": "...",
  "title": "...",
  "description": "...",
  "category": "...",
  "status": "...",
  "reportedBy": {
    "name": "...",
    "email": "...",
    ...
  },
  "upvotes": [...],
  "comments": [...],
  ...
}
```

### Upvote Issue
```
PUT /issues/:id/upvote
Authorization: Bearer <token>

Response:
{
  "_id": "...",
  "upvoteCount": 5,
  ...
}
```

### Assign Issue (Authority/Admin only)
```
PUT /issues/:id/assign
Authorization: Bearer <token>

Request Body:
{
  "authorityId": "...",
  "slaDeadline": "2024-12-31T23:59:59Z"
}

Response:
{
  "_id": "...",
  "status": "assigned",
  "assignedTo": "...",
  ...
}
```

### Update Issue Status (Authority/Admin only)
```
PUT /issues/:id/status
Authorization: Bearer <token>

Request Body:
{
  "status": "resolved",
  "resolutionNotes": "Fixed the pothole",
  "resolutionMedia": [
    {
      "url": "...",
      "ipfsHash": "..."
    }
  ]
}

Response:
{
  "_id": "...",
  "status": "resolved",
  "resolvedAt": "2024-01-15T...",
  ...
}
```

### Add Comment
```
POST /issues/:id/comments
Authorization: Bearer <token>

Request Body:
{
  "text": "This is still not fixed"
}

Response:
[
  {
    "user": {...},
    "text": "This is still not fixed",
    "createdAt": "..."
  }
]
```

### Get Analytics (Authority/Admin only)
```
GET /issues/analytics/stats
Authorization: Bearer <token>

Response:
{
  "totalIssues": 1000,
  "pendingIssues": 200,
  "resolvedIssues": 700,
  "inProgressIssues": 100,
  "issuesByCategory": [...],
  "issuesByPriority": [...]
}
```

### Get Hotspots
```
GET /issues/analytics/hotspots?latitude=40.7306&longitude=-73.9352&radius=10

Response:
[
  {
    "_id": {
      "category": "pothole",
      "location": "Main Street"
    },
    "count": 15,
    "issues": ["...", "..."]
  }
]
```

## Gamification

### Get Leaderboard
```
GET /gamification/leaderboard?limit=10&timeframe=week

Query Parameters:
- limit: number (default: 10)
- timeframe: all, week, month

Response:
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "...",
    "civicCredits": 500,
    "badges": [...],
    "issuesReported": 25
  }
]
```

### Get User Badges
```
GET /gamification/badges
Authorization: Bearer <token>

Response:
{
  "badges": [
    {
      "name": "First Issue",
      "earnedAt": "2024-01-01T...",
      "icon": "🎯"
    }
  ],
  "newBadges": [...]
}
```

### Get User Stats
```
GET /gamification/stats/:userId?
Authorization: Bearer <token>

Response:
{
  "civicCredits": 500,
  "badges": [...],
  "totalIssues": 25,
  "resolvedIssues": 20,
  "pendingIssues": 5,
  "totalUpvotes": 150
}
```

## Upload

### Upload to Cloudinary
```
POST /upload/cloudinary
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: [image or video file]

Response:
{
  "url": "https://res.cloudinary.com/...",
  "cloudinaryId": "...",
  "type": "image"
}
```

### Upload to IPFS
```
POST /upload/ipfs
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: [image or video file]

Response:
{
  "ipfsHash": "Qm...",
  "url": "https://ipfs.infura.io/ipfs/Qm...",
  "type": "image"
}
```

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "message": "Error description",
  "errors": [...]  // Optional validation errors
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

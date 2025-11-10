# CivicEye Architecture Diagram

## Full Stack Localhost Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                     CivicEye Platform                            │
│                  (Single Localhost Setup)                        │
└─────────────────────────────────────────────────────────────────┘

                          npm run dev
                               ↓
                     ┌──────────────────┐
                     │   concurrently   │
                     │  (Parallel Start) │
                     └────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ↓                    ↓                    ↓
   ┌─────────┐         ┌──────────┐        ┌───────────┐
   │ Backend │         │ Frontend │        │    AI     │
   │ Node.js │         │  React   │        │  FastAPI  │
   │ :5000   │         │  :3000   │        │   :8000   │
   └────┬────┘         └─────┬────┘        └─────┬─────┘
        │                    │                    │
        │                    │                    │
        │              ┌─────┴─────┐             │
        │              │  Browser  │             │
        │              │  Client   │             │
        │              └─────┬─────┘             │
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
              ┌─────▼──────┐    ┌─────▼──────┐
              │  MongoDB   │    │   Redis    │
              │  :27017    │    │   :6379    │
              └────────────┘    └────────────┘
```

## Component Details

### Backend (Port 5000)
```
┌─────────────────────────────────────┐
│          Backend Server             │
├─────────────────────────────────────┤
│  Routes:                            │
│  ├─ /api/auth     (Authentication)  │
│  ├─ /api/issues   (Issue CRUD)      │
│  ├─ /api/gamification (Rewards)     │
│  └─ /api/upload   (File Upload)     │
├─────────────────────────────────────┤
│  Optimizations:                     │
│  ├─ Set for O(1) upvote checks      │
│  ├─ Map for status aggregation      │
│  ├─ Promise.all for parallel queries│
│  └─ Redis caching                   │
└─────────────────────────────────────┘
```

### Frontend (Port 3000)
```
┌─────────────────────────────────────┐
│       React Application             │
├─────────────────────────────────────┤
│  Pages:                             │
│  ├─ Dashboard                       │
│  ├─ Issue Map                       │
│  ├─ Report Issue                    │
│  └─ Leaderboard                     │
├─────────────────────────────────────┤
│  Features:                          │
│  ├─ Material-UI Components          │
│  ├─ Leaflet Maps                    │
│  ├─ Real-time Updates               │
│  └─ Responsive Design               │
└─────────────────────────────────────┘
```

### AI Services (Port 8000)
```
┌─────────────────────────────────────┐
│       FastAPI Service               │
├─────────────────────────────────────┤
│  Models:                            │
│  ├─ Duplicate Detector              │
│  │   └─ Jaccard Similarity O(n+m)   │
│  ├─ Priority Predictor              │
│  │   └─ Weighted Scoring O(1)       │
│  └─ Tag Generator                   │
│      └─ Set Operations O(n+m)       │
├─────────────────────────────────────┤
│  Algorithms:                        │
│  ├─ Haversine Distance O(1)         │
│  ├─ Set Intersection O(min(n,m))    │
│  └─ Text Preprocessing O(n)         │
└─────────────────────────────────────┘
```

## Data Flow

### Issue Creation Flow
```
User (Browser)
    │
    ↓ POST /api/issues
Backend Server
    │
    ├─→ Validate Input
    ├─→ Create Issue in MongoDB
    ├─→ Call AI Service
    │   │
    │   ↓ POST /api/ai/analyze-issue
    │   AI Service
    │   │
    │   ├─→ Duplicate Detection (Jaccard)
    │   ├─→ Priority Prediction (Scoring)
    │   ├─→ Tag Generation (Sets)
    │   │
    │   ↓ Return Analysis
    │   Backend
    │
    ├─→ Update Issue with AI Data
    ├─→ Notify Relevant Officers
    ├─→ Invalidate Cache
    │
    ↓ Return Issue
User
```

### Analytics Retrieval (Optimized)
```
User Request
    │
    ↓ GET /api/issues/analytics/stats
Backend
    │
    ├─→ Check Redis Cache
    │   └─→ If Hit: Return Cached Data
    │
    ├─→ If Miss:
    │   │
    │   ├─→ Promise.all([
    │   │       countDocuments(),
    │   │       aggregate(status),
    │   │       aggregate(category),
    │   │       aggregate(priority)
    │   │   ])
    │   │
    │   ├─→ Process with Map O(1)
    │   ├─→ Cache Result in Redis
    │   │
    │   ↓
    ↓ Return Analytics
User
```

## Performance Optimizations

### Backend Optimizations
```
┌──────────────────────────────────────────┐
│  Operation      │  Before  │  After      │
├──────────────────────────────────────────┤
│  Upvote Check   │  O(n)    │  O(1) Set   │
│  Badge Check    │  O(n²)   │  O(n) Set   │
│  Analytics      │  O(4n)   │  O(n) ∥     │
│  Tag Match      │  O(n*m)  │  O(n+m) ∩   │
└──────────────────────────────────────────┘

Legend: ∥ = Parallel, ∩ = Intersection
```

### Database Indexes
```
MongoDB Indexes:
├─ location (2dsphere)     → Geospatial queries
├─ status + createdAt      → Filtering & sorting
├─ category + status       → Combined filtering
├─ reportedBy + createdAt  → User issues
└─ upvoteCount             → Popularity ranking

Redis Cache Keys:
├─ issues:{query}          → List caching
├─ analytics:stats         → Analytics caching
└─ user:{id}:stats         → User stats caching
```

## Development Workflow

```
Developer
    │
    ↓ git clone
    ↓ npm install
    ↓ npm run setup:env
    │
    ├─→ Creates backend/.env
    ├─→ Creates frontend/.env
    └─→ Creates ai_services/.env
    │
    ↓ npm run dev
    │
    ├─→ Starts Backend   (Blue logs)
    ├─→ Starts Frontend  (Magenta logs)
    └─→ Starts AI        (Green logs)
    │
    ↓ All services running in parallel
    │
    ├─ Backend:    http://localhost:5000
    ├─ Frontend:   http://localhost:3000
    └─ AI:         http://localhost:8000
```

## Technology Stack

```
Frontend Layer
├─ React 18
├─ Material-UI
├─ Leaflet.js
└─ Axios

Backend Layer
├─ Node.js 18
├─ Express.js
├─ Mongoose (MongoDB ODM)
└─ Redis Client

AI Layer
├─ Python 3.9+
├─ FastAPI
├─ Motor (Async MongoDB)
└─ Custom ML Models

Data Layer
├─ MongoDB (Document Store)
└─ Redis (Cache)
```

## Deployment Architecture

```
Development (Localhost)
    npm run dev
    ↓
    All services on localhost
    ├─ :3000 Frontend
    ├─ :5000 Backend
    └─ :8000 AI

Production (Docker)
    docker-compose up
    ↓
    Containerized services
    ├─ Frontend container
    ├─ Backend container
    ├─ AI container
    ├─ MongoDB container
    └─ Redis container
```

## Security Layers

```
┌──────────────────────────────────┐
│     Security Middleware          │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │  Helmet.js (Headers)       │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  CORS (Cross-Origin)       │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Rate Limiting             │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  JWT Authentication        │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Input Validation          │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

**Note**: All diagrams use ASCII art for universal compatibility.
Actual implementation uses modern frameworks and libraries as specified in package.json files.

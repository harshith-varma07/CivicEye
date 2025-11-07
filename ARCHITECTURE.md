# CivicEye Architecture Documentation

## System Overview

CivicEye is a comprehensive civic issue reporting and resolution platform built with a modern microservices architecture, combining MERN stack, AI/ML services, and blockchain technology.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Port 3000)                                      │
│  - Material-UI Components                                        │
│  - React Router                                                  │
│  - Leaflet Maps                                                  │
│  - Mapbox Integration                                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Nginx Reverse Proxy                                             │
│  - SSL/TLS Termination                                           │
│  - Load Balancing                                                │
│  - Rate Limiting                                                 │
└──────────┬──────────────────────┬────────────────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────────────┐
│  Backend API         │  │  AI Services                          │
│  (Port 5000)         │  │  (Port 8000)                          │
│                      │  │                                        │
│  Express.js          │  │  FastAPI                               │
│  - REST API          │  │  - Issue Categorization                │
│  - JWT Auth          │  │  - Duplicate Detection                 │
│  - WebSocket         │  │  - Priority Prediction                 │
│  - Redis Cache       │  │  - Maintenance Prediction              │
└──────────┬───────────┘  └──────────┬─────────────────────────────┘
           │                         │
           ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐│
│  │  MongoDB     │  │  Redis       │  │  IPFS/Cloudinary       ││
│  │  (Port 27017)│  │  (Port 6379) │  │  Media Storage         ││
│  │              │  │              │  │                        ││
│  │  - Users     │  │  - Cache     │  │  - Images              ││
│  │  - Issues    │  │  - Sessions  │  │  - Videos              ││
│  │  - Notifs    │  │  - Queue     │  │  - Documents           ││
│  └──────────────┘  └──────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Polygon Mumbai Testnet                                          │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │ IssueRegistry    │  │  SLAContract   │  │  CivicCredits   │ │
│  │ Contract         │  │  Contract      │  │  ERC20 Token    │ │
│  │                  │  │                │  │                 │ │
│  │ - Register Issue │  │ - Create SLA   │  │ - Award Credits │ │
│  │ - Update Status  │  │ - Track Time   │  │ - Transfer      │ │
│  │ - Assign Auth    │  │ - Penalties    │  │ - Redeem        │ │
│  └──────────────────┘  └────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  - Firebase (Auth & Notifications)                               │
│  - Mapbox (Geocoding & Visualization)                            │
│  - OpenStreetMap (Base Maps)                                     │
│  - Infura (IPFS & Blockchain RPC)                                │
│  - Cloudinary (Media CDN)                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Maps**: 
  - Leaflet + React-Leaflet (OpenStreetMap)
  - Mapbox GL JS (Advanced visualization)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify
- **Build Tool**: Create React App / Webpack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT + Firebase Auth
- **Validation**: Express Validator
- **File Upload**: Multer
- **Security**: 
  - Helmet.js (HTTP headers)
  - CORS
  - Rate Limiting
  - bcrypt (Password hashing)
- **Real-time**: Socket.io (optional)
- **Compression**: compression middleware

### AI Services
- **Framework**: FastAPI (Python)
- **ML Libraries**:
  - scikit-learn (Traditional ML)
  - numpy (Numerical operations)
  - pandas (Data manipulation)
  - sentence-transformers (Text embeddings)
- **Database**: Motor (Async MongoDB driver)
- **Server**: Uvicorn (ASGI server)

### Blockchain
- **Network**: Polygon Mumbai (Testnet)
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Libraries**: 
  - OpenZeppelin Contracts
  - ethers.js
- **Provider**: Infura/Alchemy

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (optional)
- **Logging**: Winston + Morgan

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  phone: String,
  role: Enum['citizen', 'authority', 'admin'],
  civicCredits: Number,
  badges: [{
    name: String,
    earnedAt: Date,
    icon: String
  }],
  location: {
    type: 'Point',
    coordinates: [Number, Number]  // [lng, lat]
  },
  avatar: String,
  department: String,  // For authorities
  fcmToken: String,  // For push notifications
  walletAddress: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Issue Model
```javascript
{
  _id: ObjectId,
  title: String (indexed),
  description: String,
  category: Enum[...],
  tags: [String],
  priority: Enum['low', 'medium', 'high', 'critical'],
  status: Enum['pending', 'verified', 'assigned', 'in-progress', 'resolved', 'rejected'],
  location: {
    type: 'Point',
    coordinates: [Number, Number],  // [lng, lat]
    address: String,
    city: String,
    state: String
  },
  media: [{
    type: Enum['image', 'video'],
    url: String,
    ipfsHash: String,
    cloudinaryId: String
  }],
  reportedBy: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  upvotes: [{
    user: ObjectId (ref: User),
    votedAt: Date
  }],
  upvoteCount: Number (indexed),
  verifications: [{
    user: ObjectId (ref: User),
    verifiedAt: Date,
    comment: String
  }],
  aiPrediction: {
    category: String,
    confidence: Number,
    isDuplicate: Boolean,
    duplicateOf: ObjectId (ref: Issue),
    estimatedResolutionTime: Number
  },
  blockchainTxHash: String,
  slaDeadline: Date,
  resolvedAt: Date,
  resolutionNotes: String,
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## API Architecture

### REST API Endpoints

**Authentication** (`/api/auth`)
- POST `/register` - User registration
- POST `/login` - User login
- GET `/me` - Get current user
- PUT `/profile` - Update profile

**Issues** (`/api/issues`)
- POST `/` - Create issue
- GET `/` - List issues (with filters)
- GET `/:id` - Get issue details
- PUT `/:id/upvote` - Upvote/downvote issue
- PUT `/:id/assign` - Assign to authority
- PUT `/:id/status` - Update status
- POST `/:id/comments` - Add comment
- GET `/analytics/stats` - Get analytics
- GET `/analytics/hotspots` - Get issue hotspots

**Gamification** (`/api/gamification`)
- GET `/leaderboard` - Get top contributors
- GET `/badges` - Get user badges
- GET `/stats/:userId?` - Get user statistics

**Upload** (`/api/upload`)
- POST `/cloudinary` - Upload to Cloudinary
- POST `/ipfs` - Upload to IPFS

### AI Service Endpoints

**Analysis** (`/api/ai`)
- POST `/analyze-issue` - Comprehensive issue analysis
- GET `/models/status` - Model status

## Security Architecture

### Authentication Flow
1. User registers/logs in
2. Backend validates credentials
3. JWT token generated and returned
4. Token stored in localStorage
5. Token included in Authorization header for protected routes
6. Backend validates token on each request

### Authorization Levels
- **Public**: Anyone can access
- **Authenticated**: Requires valid JWT
- **Authority**: Requires authority or admin role
- **Admin**: Requires admin role only

### Data Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with secret key
- HTTPS in production
- Rate limiting on API endpoints
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection via helmet.js

## Blockchain Architecture

### Smart Contract Interaction Flow

1. **Issue Registration**:
   ```
   User Reports Issue → Backend API → MongoDB
                                   → AI Analysis
                                   → Blockchain (IssueRegistry.registerIssue)
   ```

2. **Issue Assignment**:
   ```
   Authority Assigned → Backend API → MongoDB
                                   → Blockchain (IssueRegistry.assignIssue)
                                   → SLAContract.createSLA
   ```

3. **Issue Resolution**:
   ```
   Issue Resolved → Backend API → MongoDB
                               → Blockchain (IssueRegistry.updateStatus)
                               → SLAContract.completeSLA
                               → CivicCredits.awardResolutionCredits
   ```

### Gas Optimization
- Batch operations where possible
- Use events for off-chain data storage
- Minimize storage variables
- Use uint256 for counters

## Caching Strategy

### Redis Cache Layers

1. **API Response Cache**
   - Issues list (10 min TTL)
   - User profiles (1 hour TTL)
   - Analytics data (30 min TTL)

2. **Session Cache**
   - User sessions
   - JWT blacklist (for logout)

3. **Rate Limiting**
   - IP-based counters
   - User-based counters

### Cache Invalidation
- Clear on data modification
- Pattern-based deletion for related data
- Automatic expiry with TTL

## Scalability Considerations

### Horizontal Scaling
- Stateless backend servers
- Load balancer distribution
- Redis for shared session storage
- MongoDB replica sets

### Vertical Scaling
- Optimize database queries
- Add database indexes
- Implement connection pooling
- Use caching effectively

### Database Sharding
- Shard by geographic location
- Separate collections for hot/cold data
- Archive old resolved issues

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading components
- Image optimization
- CDN for static assets
- Service worker for offline support

### Backend
- Database indexing
- Query optimization
- Response compression
- Connection pooling
- Async operations

### Database
- Geospatial indexes for location queries
- Compound indexes for common queries
- Aggregation pipeline optimization
- Read replicas for scaling reads

## Monitoring & Observability

### Metrics to Track
- API response time
- Error rates
- Database query performance
- Cache hit rates
- Active users
- Issue creation rate
- Resolution time

### Logging
- Request/response logs
- Error logs
- Audit logs
- Security logs

### Alerts
- High error rates
- Slow API responses
- Database connection issues
- High memory/CPU usage
- Failed blockchain transactions

## Disaster Recovery

### Backup Strategy
- Daily MongoDB backups
- Continuous replication
- Point-in-time recovery
- Off-site backup storage

### High Availability
- Multi-AZ deployment
- Database replication
- Load balancer health checks
- Automatic failover

## Future Enhancements

### Phase 2
- Real-time notifications with WebSockets
- Advanced analytics dashboard
- Mobile app (React Native)
- ML model improvements
- Mainnet deployment

### Phase 3
- Contractor marketplace
- Payment integration
- Advanced SLA management
- IoT sensor integration
- Predictive issue prevention

## Development Workflow

```
Developer → Feature Branch → Pull Request → Review → Tests → Merge → Deploy

CI/CD Pipeline:
1. Code push
2. Automated tests
3. Build Docker images
4. Deploy to staging
5. Integration tests
6. Deploy to production
```

## Deployment Architecture (Production)

```
Internet → Cloudflare CDN → Load Balancer
                                   ↓
                          ┌────────┴────────┐
                          ↓                 ↓
                    Nginx (Server 1)  Nginx (Server 2)
                          ↓                 ↓
                    ┌─────┴─────┐     ┌─────┴─────┐
                    ↓           ↓     ↓           ↓
                Backend     Frontend Backend   Frontend
                    ↓                             ↓
                    └─────────┬───────────────────┘
                              ↓
                    MongoDB Atlas (Replica Set)
                              ↓
                    Redis Cloud (Cluster)
```

## Conclusion

CivicEye's architecture is designed for:
- **Scalability**: Handle growing user base
- **Reliability**: High availability and fault tolerance
- **Security**: Multiple layers of protection
- **Performance**: Fast response times
- **Maintainability**: Clean, modular code
- **Transparency**: Blockchain-backed audit trail

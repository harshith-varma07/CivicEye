# CivicEye Setup Guide

Complete guide for setting up and running CivicEye on your local machine.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Development Commands](#development-commands)

---

## Prerequisites

### Required Software

1. **Node.js 18+** and npm 9+
   ```bash
   # Check version
   node --version
   npm --version
   
   # Download from https://nodejs.org/
   # Or use nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Python 3.9+**
   ```bash
   # Check version
   python --version
   
   # Download from https://www.python.org/downloads/
   # Or use pyenv (recommended)
   curl https://pyenv.run | bash
   pyenv install 3.9.0
   pyenv global 3.9.0
   ```

3. **MongoDB**
   ```bash
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   
   # Ubuntu/Debian
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

4. **Redis**
   ```bash
   # macOS (using Homebrew)
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis-server
   
   # Windows
   # Download from https://github.com/microsoftarchive/redis/releases
   ```

### Optional (for Blockchain features)
- MetaMask browser extension
- Hardhat for smart contract development

---

## Quick Start

### One-Command Setup (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye

# 2. Install root dependencies
npm install

# 3. Install all service dependencies
npm run install-all

# 4. Setup environment files
npm run setup:env

# 5. Configure your .env files (see Configuration section)
# Edit backend/.env, frontend/.env, and ai_services/.env

# 6. Start all services
npm run dev
```

**That's it!** The application will be running at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Services**: http://localhost:8000

---

## Detailed Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye
```

### Step 2: Install Dependencies

#### Option A: Automated Installation (Recommended)

```bash
# Install root dependencies (includes concurrently for running all services)
npm install

# Install all service dependencies at once
npm run install-all
```

#### Option B: Manual Installation

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# AI Services
cd ai_services
pip install -r requirements.txt
cd ..

# Smart Contracts (optional)
cd contracts
npm install
cd ..
```

### Step 3: Setup Environment Files

#### Option A: Automated Setup

```bash
npm run setup:env
```

This will automatically create `.env` files from `.env.example` templates.

#### Option B: Manual Setup

```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai_services/.env.example ai_services/.env
cp contracts/.env.example contracts/.env  # Optional
```

---

## Configuration

### Backend Configuration (`backend/.env`)

**Minimum Required:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civiceye
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
```

**Optional Services:**

```env
# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# IPFS via Infura
IPFS_PROJECT_ID=your-infura-project-id
IPFS_PROJECT_SECRET=your-infura-project-secret

# Firebase (for auth and notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Blockchain
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your-private-key-for-blockchain
```

### Frontend Configuration (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_URL=http://localhost:8000

# Optional
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### AI Services Configuration (`ai_services/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/civiceye
API_TITLE=CivicEye AI Services
API_VERSION=1.0.0
```

---

## Running the Application

### Option 1: Run All Services Together (Recommended)

```bash
npm run dev
```

This starts all services in parallel with color-coded logs:
- **Blue**: Backend logs
- **Magenta**: Frontend logs
- **Green**: AI Services logs

### Option 2: Run Services Individually

```bash
# Terminal 1 - Backend
npm run dev:backend
# or
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev:frontend
# or
cd frontend && npm start

# Terminal 3 - AI Services
npm run dev:ai
# or
cd ai_services && uvicorn main:app --reload
```

### Option 3: Using Docker

```bash
docker-compose up
```

---

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB

**Solutions**:
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/civiceye
```

### Redis Connection Issues

**Problem**: Cannot connect to Redis

**Solutions**:
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
# Windows: redis-server

# Check Redis URL in .env
REDIS_URL=redis://localhost:6379
```

### Port Already in Use

**Problem**: Port 3000, 5000, or 8000 already in use

**Solutions**:
```bash
# Find process using the port
lsof -i :5000
lsof -i :3000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change the port in .env files
# Backend: PORT=5001
# Frontend: automatically prompts to use different port
# AI: Change port in npm script
```

### Python Dependencies Issues

**Problem**: Cannot install Python packages

**Solutions**:
```bash
cd ai_services

# Create virtual environment (recommended)
python -m venv venv

# Activate
# macOS/Linux: source venv/bin/activate
# Windows PowerShell: venv\Scripts\Activate.ps1
# Windows CMD: venv\Scripts\activate.bat

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Node Dependencies Issues

**Problem**: npm install fails

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Or use clean install
npm ci
```

### Frontend Build Issues

**Problem**: React app won't start

**Solutions**:
```bash
cd frontend

# Check Node version (must be 18+)
node --version

# Clear cache and rebuild
rm -rf node_modules build package-lock.json
npm install
npm start
```

---

## Development Commands

### Root Level Commands

```bash
# Install all dependencies
npm run install-all

# Setup environment files
npm run setup:env

# Start all services
npm run dev
npm start  # alias for npm run dev

# Run all tests
npm test

# Lint all code
npm run lint

# Clean all dependencies
npm run clean
```

### Backend Commands

```bash
cd backend

# Development server
npm run dev

# Run tests
npm test
npm run test:coverage

# Lint code
npm run lint
```

### Frontend Commands

```bash
cd frontend

# Development server
npm start

# Run tests
npm test
npm run test:coverage

# Production build
npm run build

# Lint code
npm run lint  # if configured
```

### AI Services Commands

```bash
cd ai_services

# Development server
uvicorn main:app --reload

# With specific host/port
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
pytest --cov=app

# Format code
black .
```

### Smart Contracts Commands

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai
```

---

## Monitoring

### Check Service Health

```bash
# Backend health
curl http://localhost:5000/health

# AI Services health
curl http://localhost:8000/health

# Frontend (should show React app)
curl http://localhost:3000
```

### View Logs

All services output logs to the terminal. When running with `npm run dev`, you'll see:
- **Color-coded output** for easy identification
- **Service name prefixes** (BACKEND, FRONTEND, AI)
- **Real-time updates** as requests are processed

### Database Access

**MongoDB:**
```bash
# Connect with mongosh
mongosh mongodb://localhost:27017/civiceye

# View collections
show collections

# View issues
db.issues.find().pretty()

# View users
db.users.find().pretty()
```

**Redis:**
```bash
# Connect
redis-cli

# List all keys
KEYS *

# Get specific key
GET issues:*

# Monitor real-time commands
MONITOR
```

---

## Next Steps

After successfully setting up:

1. **Create your first user**: Visit http://localhost:3000 and register
2. **Report an issue**: Click "Report Issue" and fill in the details
3. **Explore the map**: View issues on the interactive map
4. **Check analytics**: View the dashboard and statistics
5. **Test API**: Use http://localhost:8000/docs for AI service API documentation

---

## Additional Resources

- **API Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Architecture Guide**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Testing Guide**: See [TESTING.md](TESTING.md)

---

## Production Deployment

### Environment Preparation

1. **Set Production Environment Variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<strong-random-secret>
   MONGODB_URI=<mongodb-atlas-connection-string>
   REDIS_URL=<redis-cloud-url>
   ```

2. **Configure External Services**
   - MongoDB Atlas for production database
   - Redis Cloud or AWS ElastiCache
   - Cloudinary for media storage
   - Firebase for authentication
   - Infura for IPFS

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Cloud Deployment

#### AWS Deployment

1. **EC2 Setup**
   ```bash
   # SSH into EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install dependencies
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone and setup
   git clone https://github.com/harshith-varma07/CivicEye.git
   cd CivicEye
   npm run install-all
   ```

2. **RDS for MongoDB Alternative**
   - Use MongoDB Atlas or DocumentDB
   - Update MONGODB_URI in environment

3. **S3 for Media Storage**
   - Alternative to Cloudinary
   - Configure AWS SDK in backend

#### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create applications
heroku create civiceye-backend
heroku create civiceye-frontend

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd frontend
git push heroku main

# Set environment variables
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-jwt-secret>
```

#### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### SSL/HTTPS Setup

```bash
# Using Nginx with Let's Encrypt
sudo apt-get install nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/civiceye

# Obtain SSL certificate
sudo certbot --nginx -d civiceye.com -d www.civiceye.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Performance Optimization for Production

1. **Enable Compression**
   - Gzip compression already configured in backend
   - Enable CDN for static assets

2. **Database Indexing**
   - Ensure all MongoDB indexes are created
   - Regular index maintenance

3. **Caching Strategy**
   - Redis caching for API responses
   - Browser caching headers
   - CDN for static assets

4. **Load Balancing**
   - Use Nginx or AWS Load Balancer
   - Multiple backend instances

### Monitoring and Logging

```bash
# PM2 for process management
npm install -g pm2

# Start with PM2
cd backend
pm2 start src/server.js --name civiceye-backend

# Monitor
pm2 monit

# Logs
pm2 logs civiceye-backend

# Save configuration
pm2 save
pm2 startup
```

### Security Checklist

- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure cookie options
- [ ] Enable rate limiting
- [ ] Use helmet.js security headers
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Regular security audits

### Backup Strategy

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/civiceye" --out=/backup/$(date +%Y%m%d)

# Automated backups (cron)
0 2 * * * mongodump --uri="$MONGODB_URI" --out=/backup/$(date +\%Y\%m\%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/civiceye" /backup/20231110
```

---

## Testing Strategies

### Unit Testing

**Backend Unit Tests**
```javascript
// Example: backend/src/__tests__/issue.test.js
const { upvoteIssue } = require('../controllers/issueController');

describe('Issue Controller', () => {
  test('upvote adds user to upvotes', async () => {
    const req = { user: { _id: 'user123' }, params: { id: 'issue123' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    
    await upvoteIssue(req, res);
    
    expect(res.json).toHaveBeenCalled();
  });
});
```

**Frontend Unit Tests**
```javascript
// Example: frontend/src/__tests__/IssueCard.test.js
import { render, screen } from '@testing-library/react';
import IssueCard from '../components/IssueCard';

test('renders issue title', () => {
  const issue = { title: 'Test Issue', description: 'Test' };
  render(<IssueCard issue={issue} />);
  expect(screen.getByText('Test Issue')).toBeInTheDocument();
});
```

### Integration Testing

```javascript
// Example: backend/src/__tests__/integration/api.test.js
const request = require('supertest');
const app = require('../server');

describe('API Integration Tests', () => {
  test('POST /api/issues creates issue', async () => {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title: 'Test Pothole',
        category: 'pothole',
        location: { coordinates: [77.5946, 12.9716], address: 'Test St' }
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });
});
```

### E2E Testing

```javascript
// Example using Cypress
describe('Issue Reporting Flow', () => {
  it('allows user to report an issue', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-testid=login]').click();
    cy.get('[data-testid=email]').type('test@example.com');
    cy.get('[data-testid=password]').type('password');
    cy.get('[data-testid=submit]').click();
    
    cy.get('[data-testid=report-issue]').click();
    cy.get('[data-testid=title]').type('Pothole on Main St');
    cy.get('[data-testid=category]').select('pothole');
    cy.get('[data-testid=submit]').click();
    
    cy.contains('Issue reported successfully');
  });
});
```

---

## API Reference

### Authentication Endpoints

**POST /api/auth/register**
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}

Response:
{
  "token": "jwt-token",
  "user": { "id": "123", "name": "John Doe", "email": "john@example.com" }
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token",
  "user": { "id": "123", "name": "John Doe" }
}
```

### Issue Endpoints

**POST /api/issues**
```json
Request:
{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic issues",
  "category": "pothole",
  "department": "roads",
  "location": {
    "coordinates": [77.5946, 12.9716],
    "address": "123 Main St, Bangalore",
    "pincode": "560001"
  },
  "media": [
    { "type": "image", "url": "https://cloudinary.com/image.jpg" }
  ]
}

Response:
{
  "_id": "issue123",
  "title": "Pothole on Main Street",
  "status": "pending",
  "upvoteCount": 0,
  "createdAt": "2024-01-10T10:00:00Z"
}
```

**GET /api/issues**
```
Query Parameters:
- status: pending|verified|assigned|in-progress|resolved
- category: pothole|streetlight|garbage|water|sewage
- latitude: number
- longitude: number
- radius: number (km)
- page: number
- limit: number

Response:
{
  "issues": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalIssues": 50
}
```

**PUT /api/issues/:id/upvote**
```
Headers: Authorization: Bearer <token>

Response:
{
  "_id": "issue123",
  "upvoteCount": 15,
  "upvotes": [...]
}
```

### Gamification Endpoints

**GET /api/gamification/leaderboard**
```
Query Parameters:
- limit: number (default: 10)
- timeframe: all|week|month

Response:
[
  {
    "name": "John Doe",
    "civicCredits": 500,
    "badges": [...],
    "issuesReported": 25
  }
]
```

### AI Service Endpoints

**POST /api/ai/analyze-issue**
```json
Request:
{
  "title": "Pothole on Main Street",
  "description": "Large pothole",
  "category": "pothole",
  "location": { "coordinates": [77.5946, 12.9716] }
}

Response:
{
  "predictedCategory": "pothole",
  "confidence": 0.95,
  "tags": ["road", "urgent", "safety"],
  "isDuplicate": false,
  "priority": "high",
  "priorityScore": 0.75
}
```

---

## Additional Resources

- **API Documentation**: All endpoints documented above
- **Architecture**: MERN stack with AI services and blockchain
- **Testing**: Unit, integration, and E2E testing covered
- **Deployment**: Multiple cloud platform options
- **Contributing**: Fork, branch, test, PR workflow

---

## Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/harshith-varma07/CivicEye/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/harshith-varma07/CivicEye/discussions)

---

**Happy Coding!** 🚀


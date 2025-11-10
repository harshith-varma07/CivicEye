# CivicEye - Localhost Setup Guide

This guide will help you run the entire CivicEye platform on localhost without Docker.

## 🚀 Quick Start (Recommended)

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.9+
- MongoDB (running on localhost:27017)
- Redis (running on localhost:6379)

### One-Command Setup

```bash
# Install all dependencies
npm run install-all

# Setup environment files
npm run setup:env

# Start all services (backend, frontend, AI)
npm run dev
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Services**: http://localhost:8000

## 📋 Detailed Setup Instructions

### Step 1: Install Prerequisites

#### Install Node.js
```bash
# Download from https://nodejs.org/
# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Install Python
```bash
# Download from https://www.python.org/downloads/
# Or use pyenv (recommended)
curl https://pyenv.run | bash
pyenv install 3.9.0
pyenv global 3.9.0
```

#### Install MongoDB
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

#### Install Redis
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

### Step 2: Clone and Configure

```bash
# Clone the repository
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye

# Install root dependencies (includes concurrently for parallel execution)
npm install

# Setup environment files
npm run setup:env
```

### Step 3: Configure Environment Variables

Edit the generated `.env` files:

**backend/.env**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civiceye
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_URL=http://localhost:8000
```

**ai_services/.env**
```env
MONGODB_URI=mongodb://localhost:27017/civiceye
API_TITLE=CivicEye AI Services
API_VERSION=1.0.0
```

### Step 4: Install Service Dependencies

```bash
# Install all service dependencies
npm run install-all

# Or install manually:
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ai_services && pip install -r requirements.txt && cd ..
```

### Step 5: Start All Services

```bash
# Start all services in parallel
npm run dev
```

This will start:
1. **Backend** on port 5000 (Node.js/Express)
2. **Frontend** on port 3000 (React)
3. **AI Services** on port 8000 (FastAPI)

## 🔧 Individual Service Commands

If you prefer to run services separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend

# Terminal 3 - AI Services
npm run dev:ai
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

## 🎨 Linting

```bash
# Lint all code
npm run lint

# Lint backend only
npm run lint:backend

# Lint frontend only
npm run lint:frontend
```

## 📦 Building for Production

```bash
# Build frontend for production
npm run build
```

## 🔍 Optimizations Implemented

This setup includes several performance optimizations:

### Backend Optimizations
1. **Efficient Data Structures**:
   - Set-based upvote checking (O(1) vs O(n))
   - Map-based data aggregation
   - Parallel query execution with Promise.all

2. **Database Optimizations**:
   - Proper MongoDB indexing (geospatial, compound indexes)
   - Aggregation pipeline optimization
   - Redis caching for frequently accessed data

3. **API Optimizations**:
   - Response compression
   - Rate limiting
   - Request validation

### Frontend Optimizations
1. **React Best Practices**:
   - Component lazy loading
   - Memoization for expensive computations
   - Efficient re-rendering

### AI Services Optimizations
1. **Algorithm Optimizations**:
   - Jaccard similarity for text comparison (O(n) complexity)
   - Haversine formula for geospatial distance
   - Set operations for word processing
   - Early exit in priority classification

2. **Caching**:
   - Result caching for duplicate detection
   - Precomputed similarity thresholds

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB if not running
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
```

### Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Python Virtual Environment Issues
```bash
# Create virtual environment (recommended but optional)
cd ai_services
python -m venv venv

# Activate
# macOS/Linux: source venv/bin/activate
# Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 📊 Monitoring

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

All services output logs to the terminal. When running with `npm run dev`, you'll see color-coded logs:
- **Blue**: Backend logs
- **Magenta**: Frontend logs
- **Green**: AI Services logs

## 🚀 Next Steps

1. **Create your first user**: Visit http://localhost:3000 and register
2. **Report an issue**: Click "Report Issue" and fill in the details
3. **Explore the map**: View issues on the interactive map
4. **Check the leaderboard**: See top contributors

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/harshith-varma07/CivicEye/issues)
- **Discussions**: [Ask questions](https://github.com/harshith-varma07/CivicEye/discussions)

---

**Happy Coding!** 🎉

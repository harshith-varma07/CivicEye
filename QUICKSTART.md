# CivicEye Quick Start Guide

Get CivicEye up and running in 10 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.9+ installed (`python --version`)
- [ ] MongoDB running (local or Atlas)
- [ ] Redis running (local or cloud)
- [ ] Git installed

## Quick Setup (Development)

### Option 1: Docker Compose (Recommended)

**Fastest way to get started!**

```bash
# 1. Clone the repository
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye

# 2. Start all services
docker-compose up

# That's it! Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - AI Services: http://localhost:8000
# - MongoDB: localhost:27017
# - Redis: localhost:6379
```

### Option 2: Manual Setup

**Step 1: Clone and Setup**
```bash
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye
```

**Step 2: Backend Setup**
```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your MongoDB and Redis URLs
# Minimum required:
# MONGODB_URI=mongodb://localhost:27017/civiceye
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key

npm run dev
# Backend running on http://localhost:5000
```

**Step 3: Frontend Setup** (New Terminal)
```bash
cd frontend
npm install
cp .env.example .env

# Edit .env
# REACT_APP_API_URL=http://localhost:5000/api

npm start
# Frontend running on http://localhost:3000
```

**Step 4: AI Services** (New Terminal)
```bash
cd ai_services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Edit .env
# MONGODB_URI=mongodb://localhost:27017/civiceye

uvicorn main:app --reload
# AI Services running on http://localhost:8000
```

**Step 5: Smart Contracts** (Optional for Development)
```bash
cd contracts
npm install
cp .env.example .env

# Only needed if deploying to blockchain
# Add your private key and RPC URL

npx hardhat compile
# Contracts compiled!
```

## First Time Setup

### 1. Create Test User

Visit http://localhost:3000 and register:
- Name: Test User
- Email: test@civiceye.com
- Password: password123
- Role: Citizen

### 2. Report Your First Issue

1. Click "Report Issue"
2. Fill in the details:
   - Title: "Test Pothole"
   - Description: "Testing the system"
   - Category: Pothole
   - Click on map to select location
   - Add address
3. Upload a photo (optional)
4. Submit!

### 3. Explore Features

- **Dashboard**: View all reported issues
- **Upvote**: Click thumbs up on issues
- **Comments**: Add comments to issues
- **Leaderboard**: See top contributors
- **Profile**: Check your CivicCredits

## Configuration

### Essential Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civiceye
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_URL=http://localhost:8000
```

**AI Services (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/civiceye
```

### Optional Services

**Cloudinary** (for image uploads):
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**IPFS** (via Infura):
```env
IPFS_PROJECT_ID=your-project-id
IPFS_PROJECT_SECRET=your-project-secret
```

**Firebase** (for auth and notifications):
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

**Mapbox** (for advanced maps):
```env
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
```

## Testing the API

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@civiceye.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@civiceye.com",
    "password": "password123"
  }'
```

**Get Issues:**
```bash
curl http://localhost:5000/api/issues
```

### Using Postman

1. Import the API collection
2. Set base URL: `http://localhost:5000/api`
3. Test endpoints

## Common Issues and Solutions

### Backend won't start

**Problem**: MongoDB connection error
```
Solution: Ensure MongoDB is running
- Local: Start MongoDB service
- Atlas: Check connection string and network access
```

**Problem**: Port 5000 already in use
```
Solution: Change port in backend/.env
PORT=5001
```

### Frontend won't start

**Problem**: Port 3000 in use
```
Solution: 
1. Kill process on port 3000, OR
2. Run on different port when prompted (Y)
```

**Problem**: API calls failing
```
Solution: Check REACT_APP_API_URL in frontend/.env
Should be: http://localhost:5000/api
```

### AI Services issues

**Problem**: Module not found
```
Solution: Ensure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

**Problem**: MongoDB connection failed
```
Solution: Check MONGODB_URI in ai_services/.env
```

### Database issues

**Problem**: Cannot connect to MongoDB
```
Solution:
1. Check if MongoDB is running
2. Verify connection string
3. Check network access (for Atlas)
```

**Problem**: Cannot connect to Redis
```
Solution:
1. Check if Redis is running
2. Verify REDIS_URL
```

## Development Workflow

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and test**
   ```bash
   # Run backend tests
   cd backend && npm test
   
   # Run frontend tests
   cd frontend && npm test
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

### Hot Reload

All services support hot reload:
- **Backend**: Nodemon restarts on file changes
- **Frontend**: React hot reload
- **AI**: Uvicorn --reload watches files

## Monitoring

### View Logs

**Backend:**
```bash
cd backend
npm run dev  # Logs appear in terminal
```

**Frontend:**
```bash
cd frontend
npm start  # Logs in browser console and terminal
```

**AI Services:**
```bash
cd ai_services
uvicorn main:app --reload  # Logs in terminal
```

### Database

**MongoDB:**
```bash
# Connect with mongosh
mongosh mongodb://localhost:27017/civiceye

# View issues
db.issues.find().pretty()

# View users
db.users.find().pretty()
```

**Redis:**
```bash
redis-cli
> KEYS *
> GET issues:*
```

## Production Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)

Quick production checklist:
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure MongoDB Atlas
- [ ] Configure Redis Cloud
- [ ] Set up Cloudinary/IPFS
- [ ] Deploy smart contracts to Mumbai
- [ ] Configure domain and SSL
- [ ] Set up monitoring

## Next Steps

1. **Read Documentation**
   - [API Documentation](API_DOCUMENTATION.md)
   - [Architecture](ARCHITECTURE.md)
   - [Testing Guide](TESTING.md)

2. **Explore Features**
   - Try reporting different types of issues
   - Test upvoting and commenting
   - Check the leaderboard
   - View analytics

3. **Customize**
   - Modify categories in backend/src/models/Issue.js
   - Add new badges in backend/src/controllers/gamificationController.js
   - Customize UI in frontend/src

4. **Deploy**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

## Support

- **Documentation**: Check repository docs
- **Issues**: [GitHub Issues](https://github.com/harshith-varma07/CivicEye/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harshith-varma07/CivicEye/discussions)

## Quick Reference

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health: http://localhost:5000/health
- AI Services: http://localhost:8000
- AI Docs: http://localhost:8000/docs

**Default Test Credentials:**
```
Email: test@civiceye.com
Password: password123
```

**Useful Commands:**
```bash
# Start all (Docker)
docker-compose up

# Stop all (Docker)
docker-compose down

# View logs
docker-compose logs -f

# Backend
npm run dev      # Start dev server
npm test        # Run tests
npm run lint    # Lint code

# Frontend
npm start       # Start dev server
npm test        # Run tests
npm run build   # Production build

# AI Services
uvicorn main:app --reload  # Start server
pytest                      # Run tests

# Contracts
npx hardhat compile        # Compile contracts
npx hardhat test          # Test contracts
npx hardhat run scripts/deploy.js  # Deploy
```

Happy coding! 🚀

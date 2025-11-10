# CivicEye Developer Quick Reference

## 🚀 Quick Start Commands

```bash
# First time setup
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye
npm install
npm run setup:env

# Start development (all services)
npm run dev

# Access services
# Frontend:    http://localhost:3000
# Backend:     http://localhost:5000
# AI Services: http://localhost:8000
```

## 📦 Installation Commands

```bash
# Install all dependencies
npm run install-all

# Install individual services
cd backend && npm install
cd frontend && npm install
cd ai_services && pip install -r requirements.txt
```

## 🔧 Development Commands

```bash
# Run all services together
npm run dev

# Run services individually
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 3000
npm run dev:ai         # AI services on port 8000
```

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Run specific tests
npm run test:backend
npm run test:frontend

# Run with coverage
cd backend && npm test -- --coverage
cd frontend && npm test -- --coverage
```

## 🎨 Code Quality

```bash
# Lint all code
npm run lint

# Lint specific services
npm run lint:backend
npm run lint:frontend

# Auto-fix linting issues
cd backend && npx eslint src/**/*.js --fix
```

## 🏗️ Build Commands

```bash
# Build frontend for production
npm run build

# Build output location
cd frontend/build
```

## 🧹 Cleanup

```bash
# Clean all node_modules and venv
npm run clean

# Clean specific service
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf ai_services/venv
```

## 🔍 Health Checks

```bash
# Check if services are running
curl http://localhost:5000/health    # Backend
curl http://localhost:8000/health    # AI Services
curl http://localhost:3000           # Frontend

# Check API
curl http://localhost:5000/api/issues

# Check AI docs
open http://localhost:8000/docs
```

## 📊 Database Commands

```bash
# MongoDB
mongosh mongodb://localhost:27017/civiceye

# View collections
db.issues.find().pretty()
db.users.find().pretty()

# Redis
redis-cli
> KEYS *
> GET issues:*
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### MongoDB Not Running
```bash
# Start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

### Redis Not Running
```bash
# Start Redis
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
# Windows: redis-server
```

### Python Dependencies Issue
```bash
cd ai_services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Node Dependencies Issue
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature

# Pull latest changes
git pull origin main
```

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civiceye
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:8000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_URL=http://localhost:8000
```

### AI Services (.env)
```env
MONGODB_URI=mongodb://localhost:27017/civiceye
API_TITLE=CivicEye AI Services
```

## 🔗 Useful Endpoints

### Authentication
```bash
# Register user
POST http://localhost:5000/api/auth/register

# Login
POST http://localhost:5000/api/auth/login

# Get current user
GET http://localhost:5000/api/auth/me
```

### Issues
```bash
# Create issue
POST http://localhost:5000/api/issues

# Get all issues
GET http://localhost:5000/api/issues

# Get single issue
GET http://localhost:5000/api/issues/:id

# Upvote issue
PUT http://localhost:5000/api/issues/:id/upvote
```

### AI Services
```bash
# Analyze issue
POST http://localhost:8000/api/ai/analyze-issue

# Get model status
GET http://localhost:8000/api/ai/models/status
```

## 📚 Documentation Files

- `LOCALHOST_SETUP.md` - Detailed setup guide
- `OPTIMIZATIONS.md` - Performance optimizations
- `QUICKSTART.md` - Quick start guide
- `API_DOCUMENTATION.md` - API reference
- `ARCHITECTURE.md` - System architecture
- `TESTING.md` - Testing guide

## 💡 Tips & Tricks

1. **Use concurrently logs**: Colors help identify which service logged what
2. **Hot reload**: All services support hot reload during development
3. **MongoDB Compass**: Use GUI tool for database inspection
4. **Postman**: Import API collection for easy testing
5. **VS Code Extensions**: 
   - ESLint
   - Prettier
   - MongoDB for VS Code
   - Python

## 🎯 Common Tasks

### Add a new API endpoint
1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Add validation middleware if needed
4. Update API documentation

### Add a new React component
1. Create component in `frontend/src/components/`
2. Add routing if needed in `frontend/src/App.js`
3. Connect to API using axios
4. Add tests

### Add a new AI model
1. Create model in `ai_services/app/models/`
2. Import in `ai_services/app/services/ai_service.py`
3. Add route in `ai_services/app/routes/ai_routes.py`
4. Test with sample data

## ⚡ Performance Tips

- Use `Promise.all()` for parallel async operations
- Use `Set` for O(1) lookups instead of arrays
- Use `Map` for key-value storage with O(1) access
- Cache frequently accessed data in Redis
- Use MongoDB indexes for common queries
- Optimize images before uploading

## 🆘 Getting Help

- **Issues**: [GitHub Issues](https://github.com/harshith-varma07/CivicEye/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harshith-varma07/CivicEye/discussions)
- **Documentation**: Check the docs folder

---

**Remember**: Always run `npm run lint` before committing code!

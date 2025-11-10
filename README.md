# CivicEye - Crowdsourced Civic Issue Reporting & Resolution Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange.svg)](https://soliditylang.org/)

## 🚀 Overview

CivicEye is a comprehensive platform for real-time civic issue reporting, community validation, gamification, and blockchain-backed transparency. Built with the MERN stack, AI/ML services, and blockchain integration, it empowers citizens to report civic issues, enables community-driven verification, and provides authorities with efficient tools for issue resolution.

**🎯 Built for**: Smart India Hackathon 2025

**✨ Key Highlights**:
- 🗺️ Real-time geospatial issue tracking
- 🤖 AI-powered categorization and duplicate detection
- ⛓️ Blockchain-verified transparency
- 🎮 Gamification with CivicCredits and badges
- 📱 Mobile-first responsive design
- 🔒 Enterprise-grade security

## 🏗️ Architecture

**Full-Stack Technology:**
- **Frontend**: React 18 + Material-UI + Leaflet.js + Mapbox
- **Backend**: Node.js + Express + MongoDB + Redis
- **AI Services**: Python + FastAPI + scikit-learn
- **Blockchain**: Solidity 0.8.20 on Polygon Mumbai
- **Storage**: IPFS (Infura) + Cloudinary
- **Authentication**: JWT + Firebase Auth
- **Notifications**: FCM Push Notifications

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Technology Stack](#-technology-stack)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### For Citizens
- 📸 **Issue Reporting**: Photo/video upload with GPS tagging
- 🗺️ **Interactive Maps**: Real-time issue visualization with Leaflet & OpenStreetMap
- 👍 **Community Verification**: Upvote and verify reported issues
- 💬 **Engagement**: Comment and discuss issues
- 🏆 **Gamification**: Earn CivicCredits, badges, and climb the leaderboard
- 🔔 **Notifications**: Real-time updates via FCM

### For Authorities
- 📊 **Dashboard**: Comprehensive issue management interface
- 🎯 **Assignment**: Assign issues to departments/contractors
- ⏱️ **SLA Tracking**: Monitor resolution deadlines
- 📈 **Analytics**: Insights into issue trends and hotspots
- ✅ **Resolution Tracking**: Update status and add resolution notes

### AI-Powered Features
- 🤖 **Auto-Categorization**: ML-based issue classification
- 🔍 **Duplicate Detection**: Smart identification of duplicate reports
- ⚡ **Priority Prediction**: Automatic priority assignment
- 📅 **Predictive Maintenance**: Estimate resolution timelines
- 🏷️ **Tag Generation**: Automatic tag suggestions

### Blockchain Features
- ⛓️ **Immutable Records**: Permanent issue registry on Polygon
- 🔐 **Transparency**: Public audit trail of all actions
- 💰 **CivicCredits Token**: ERC20 token for rewards
- 📜 **Smart Contracts**: SLA enforcement and automatic penalties
- 🔒 **Trust**: Cryptographically verified data

## 🚀 Quick Start

### Localhost Setup (Fastest - No Docker Required) ⚡

**Perfect for development!** Run the entire stack with one command:

```bash
# Clone the repository
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye

# Install all dependencies and setup
npm run install-all
npm run setup:env

# Start all services (backend + frontend + AI)
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# AI Services: http://localhost:8000
```

**Prerequisites:** Node.js 18+, Python 3.9+, MongoDB, Redis

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

### Using Docker

```bash
# Clone the repository
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# AI Services: http://localhost:8000
```

### Manual Setup (Advanced)

**Prerequisites:**
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- Redis
- MetaMask wallet (for blockchain features)

**Step 1: Clone and Setup Environment**
```bash
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai_services/.env.example ai_services/.env
cp contracts/.env.example contracts/.env

# Edit .env files with your configuration
```

**Step 2: Install and Run Services**

```bash
# Option A: Use the unified dev command (recommended)
npm install
npm run dev

# Option B: Run services individually
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start

# Terminal 3 - AI Services
cd ai_services
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 4 - Blockchain (Optional for development)
cd contracts
npm install
npx hardhat compile
```

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## 📚 Documentation

All documentation is consolidated in two comprehensive guides:

| Document | Description |
|----------|-------------|
| [README.md](README.md) | **Complete project overview, features, API, testing, deployment, and contribution guidelines** |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | **Complete setup, configuration, troubleshooting, deployment, and API reference** |

## 📁 Project Structure

```
CivicEye/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Database, Firebase, IPFS config
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── utils/          # Utilities
│   └── package.json
├── ai_services/             # Python FastAPI service
│   ├── app/
│   │   ├── models/         # ML models
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI service logic
│   │   └── utils/          # Helpers
│   ├── main.py
│   └── requirements.txt
├── contracts/               # Solidity smart contracts
│   ├── contracts/          # Smart contract code
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.js
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/auth/me           # Get current user
PUT    /api/auth/profile      # Update profile
```

### Issues
```
POST   /api/issues                      # Create issue
GET    /api/issues                      # List issues (with filters)
GET    /api/issues/:id                  # Get issue details
PUT    /api/issues/:id/upvote           # Upvote issue
PUT    /api/issues/:id/assign           # Assign to authority
PUT    /api/issues/:id/status           # Update status
POST   /api/issues/:id/comments         # Add comment
GET    /api/issues/analytics/stats      # Get analytics
GET    /api/issues/analytics/hotspots   # Get issue hotspots
```

### Gamification
```
GET    /api/gamification/leaderboard    # Top contributors
GET    /api/gamification/badges         # User badges
GET    /api/gamification/stats/:userId  # User statistics
```

### Media Upload
```
POST   /api/upload/cloudinary           # Upload to Cloudinary
POST   /api/upload/ipfs                 # Upload to IPFS
```

### AI Services
```
POST   /api/ai/analyze-issue            # Analyze issue with AI
GET    /api/ai/models/status            # AI models status
```

**📖 For complete API documentation with request/response examples, see the API Reference section in [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## 🛠️ Technology Stack

### Frontend Stack
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Material-UI | Component library |
| React Router | Navigation |
| Leaflet | Interactive maps |
| Mapbox GL | Advanced visualization |
| Axios | HTTP client |
| React Context | State management |

### Backend Stack
| Technology | Purpose |
|------------|---------|
| Node.js 18 | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| Redis | Caching |
| JWT | Authentication |
| Multer | File uploads |
| Socket.io | WebSocket |

### AI/ML Stack
| Technology | Purpose |
|------------|---------|
| FastAPI | Web framework |
| scikit-learn | ML algorithms |
| NumPy | Numerical computing |
| Pandas | Data manipulation |
| Motor | Async MongoDB driver |

### Blockchain Stack
| Technology | Purpose |
|------------|---------|
| Solidity 0.8.20 | Smart contracts |
| Hardhat | Development framework |
| ethers.js | Ethereum library |
| OpenZeppelin | Contract library |
| Polygon Mumbai | Test network |

### DevOps Stack
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| Nginx | Reverse proxy |
| GitHub Actions | CI/CD |

## 🧪 Testing

### Run Tests

**Backend Tests:**
```bash
cd backend
npm test
npm run test:coverage
```

**Frontend Tests:**
```bash
cd frontend
npm test
npm run test:coverage
```

**AI Services Tests:**
```bash
cd ai_services
pytest
pytest --cov=app
```

**Smart Contract Tests:**
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

**📖 For detailed testing examples and strategies, see the Testing Strategies section in [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## 🚀 Deployment

### Production Deployment

```bash
# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Deploy smart contracts to Mumbai
cd contracts
npx hardhat run scripts/deploy.js --network mumbai
```

**Supported Platforms:**
- AWS (EC2, RDS, S3, CloudFront)
- DigitalOcean (Droplets, Managed Database)
- Heroku
- Vercel (Frontend)
- Railway

**📖 For complete deployment guide with cloud platform steps, see the Production Deployment section in [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## 📊 Screenshots

### Citizen Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Citizen+Dashboard)

### Issue Reporting with Map
![Report Issue](https://via.placeholder.com/800x400?text=Report+Issue+with+Map)

### Leaderboard & Gamification
![Leaderboard](https://via.placeholder.com/800x400?text=Leaderboard)

### Authority Dashboard
![Authority Dashboard](https://via.placeholder.com/800x400?text=Authority+Dashboard)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

**Quick Contribution Steps:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Code Style:**
- JavaScript: ESLint + Prettier
- Python: PEP 8
- Solidity: Solidity Style Guide

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the CivicEye Team for Smart India Hackathon 2025

## 🙏 Acknowledgments

- OpenStreetMap for map data
- Polygon for blockchain infrastructure
- OpenZeppelin for secure smart contract libraries
- All contributors and supporters

## 📧 Contact

- **GitHub**: [@harshith-varma07](https://github.com/harshith-varma07)
- **Issues**: [GitHub Issues](https://github.com/harshith-varma07/CivicEye/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harshith-varma07/CivicEye/discussions)

## ⭐ Star Us!

If you find CivicEye useful, please consider giving us a star on GitHub! It helps others discover the project.

## ⚡ Performance Optimizations

CivicEye is optimized for performance using modern data structures and algorithms:

### Backend Optimizations
- **Upvote checking**: O(n) → O(1) using Set for fast lookups
- **Badge checking**: O(n²) → O(n) using Set-based operations
- **Analytics aggregation**: Sequential queries → Parallel execution with Promise.all
- **Database queries**: Optimized with proper indexing and aggregation pipelines
- **Caching**: Redis-based caching for frequently accessed data

### AI Service Optimizations
- **Duplicate detection**: Jaccard similarity algorithm (O(n+m) complexity)
- **Distance calculation**: Haversine formula for accurate geospatial distance (O(1))
- **Tag generation**: Set operations for efficient keyword matching (O(n+m))
- **Priority prediction**: Dictionary-based scoring with early-exit optimization

### Key Improvements
| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Upvote Check | O(n) | O(1) | n-fold speedup |
| Badge Check | O(n²) | O(n) | n-fold speedup |
| Analytics | Sequential | Parallel | ~4x faster |

## 🧪 Testing

### Running Tests

**Backend Tests:**
```bash
cd backend
npm test                # Run all tests
npm run test:coverage   # With coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm test                # Run all tests
npm run test:coverage   # With coverage report
```

**AI Services Tests:**
```bash
cd ai_services
pytest                  # Run all tests
pytest --cov=app        # With coverage report
```

**Smart Contract Tests:**
```bash
cd contracts
npx hardhat test        # Run all tests
npx hardhat coverage    # With coverage report
```

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete user workflows
- **Contract Tests**: Test smart contract functionality

## 🚀 Deployment

### Production Deployment Steps

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Deploy Smart Contracts**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network mumbai
   ```

### Supported Platforms

- **AWS**: EC2, RDS, S3, CloudFront
- **DigitalOcean**: Droplets, Managed Database
- **Heroku**: Full-stack deployment
- **Vercel**: Frontend deployment
- **Railway**: Backend and database

### Environment Variables for Production

Ensure all production environment variables are set:
- Use strong `JWT_SECRET`
- Configure production MongoDB (MongoDB Atlas recommended)
- Set up Redis Cloud or ElastiCache
- Configure Cloudinary for media storage
- Set up Firebase for authentication
- Deploy smart contracts to Polygon Mumbai testnet

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CivicEye.git
   cd CivicEye
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Run tests**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow ESLint (JavaScript) and PEP 8 (Python) standards
- **Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for significant changes
- **Pull Requests**: Provide clear description of changes

### Reporting Issues

Before creating an issue, please check existing issues. Include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, versions)
- Error messages and logs

### Code of Conduct

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

**Built for Smart India Hackathon 2025** | **Making Cities Better, Together** 🏙️✨
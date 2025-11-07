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

### Using Docker (Recommended)

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

### Manual Setup

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
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 4 - Blockchain (Optional for development)
cd contracts
npm install
npx hardhat compile
```

**📖 For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)**

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | 10-minute setup guide |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete API reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [TESTING.md](TESTING.md) | Testing strategies and examples |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

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

**📖 For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

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

**📖 For detailed testing guide, see [TESTING.md](TESTING.md)**

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

**📖 For complete deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)**

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

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

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

---

**Built for Smart India Hackathon 2025** | **Making Cities Better, Together** 🏙️✨
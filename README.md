# CivicEye - Crowdsourced Civic Issue Reporting & Resolution Platform

## 🚀 Overview

CivicEye is a comprehensive platform for real-time civic issue reporting, community validation, gamification, and blockchain-backed transparency built for Smart India Hackathon 2025.

## 🏗️ Architecture

- **Frontend**: React + Leaflet.js + Firebase Auth
- **Backend**: Node.js + Express + MongoDB
- **AI Services**: Python FastAPI microservices
- **Blockchain**: Solidity contracts on Polygon Mumbai
- **Storage**: IPFS/Cloudinary for media files

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- MetaMask wallet
- IPFS node or Infura account

### Environment Variables

Create `.env` files in each service directory using the provided templates:

- `backend/.env.example`
- `frontend/.env.example`
- `ai_services/.env.example`
- `contracts/.env.example`

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

3. **AI Services Setup**
```bash
cd ai_services
pip install -r requirements.txt
uvicorn main:app --reload
```

4. **Smart Contracts Setup**
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

### Docker Deployment

```bash
docker-compose up --build
```

## 🌟 Features

- **Issue Reporting**: Photo/video upload with GPS tagging
- **Interactive Maps**: Real-time issue visualization
- **Community Verification**: Upvoting system
- **Gamification**: Points, badges, and leaderboards
- **Authority Dashboard**: Issue assignment and tracking
- **Blockchain Integration**: Immutable audit trail
- **AI-Powered Triage**: Automatic categorization and duplicate detection

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Issues
- `POST /issues` - Create new issue
- `GET /issues` - List issues with filters
- `PUT /issues/:id/upvote` - Upvote issue
- `POST /issues/:id/assign` - Assign to authority
- `POST /issues/:id/resolve` - Mark as resolved

### Gamification
- `GET /leaderboard` - Top contributors
- `GET /analytics/hotspots` - Issue hotspots

## 🧪 Testing

Run tests for each service:

```bash
# Backend
cd backend && npm test

# Smart Contracts
cd contracts && npx hardhat test

# AI Services
cd ai_services && pytest
```

## 📦 Deployment

1. Deploy smart contracts to Polygon Mumbai
2. Configure environment variables
3. Deploy services using Docker Compose
4. Configure domain and SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details
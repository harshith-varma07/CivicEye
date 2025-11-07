# CivicEye Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or Atlas)
- Redis server
- MetaMask wallet with Polygon Mumbai testnet configured
- Infura account (for IPFS)
- Cloudinary account
- Firebase project (for authentication and notifications)
- Mapbox account

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm start
```

The frontend will run on http://localhost:3000

### 4. AI Services Setup

```bash
cd ai_services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your configuration

# Start the AI service
uvicorn main:app --reload --port 8000
```

The AI service will run on http://localhost:8000

### 5. Smart Contracts Setup

```bash
cd contracts
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your private key and RPC URL

# Compile contracts
npx hardhat compile

# Deploy to Polygon Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai

# Save the deployed contract addresses to backend/.env
```

## Docker Deployment

### Build and Run with Docker Compose

```bash
# From the root directory
docker-compose up --build
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- Backend API on port 5000
- AI Services on port 8000
- Frontend on port 3000

### Individual Service Deployment

Build individual services:

```bash
# Backend
cd backend
docker build -t civiceye-backend .

# Frontend
cd frontend
docker build -t civiceye-frontend .

# AI Services
cd ai_services
docker build -t civiceye-ai .
```

## Production Deployment

### Environment Variables

Ensure all production environment variables are properly set:

**Backend (.env):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/civiceye
REDIS_URL=redis://your-redis-host:6379
JWT_SECRET=your-strong-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
IPFS_PROJECT_ID=your-infura-project-id
IPFS_PROJECT_SECRET=your-infura-secret
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your-wallet-private-key
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://api.civiceye.com/api
REACT_APP_AI_URL=https://ai.civiceye.com
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
# ... other Firebase config
```

### Deploying to Cloud Platforms

#### AWS Deployment

1. **EC2 Setup:**
   - Launch EC2 instances (t2.medium or larger)
   - Install Docker and Docker Compose
   - Clone repository and configure environment
   - Run `docker-compose up -d`

2. **MongoDB Atlas:**
   - Create a cluster
   - Whitelist EC2 IP addresses
   - Update MONGODB_URI in backend .env

3. **Redis (ElastiCache):**
   - Create Redis cluster
   - Update REDIS_URL in backend .env

4. **S3 for Static Assets:**
   - Create S3 bucket
   - Configure CloudFront distribution
   - Update frontend build to use CDN

#### DigitalOcean Deployment

1. **Create Droplet:**
   - Ubuntu 22.04 LTS
   - At least 4GB RAM, 2 vCPUs

2. **Setup:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose

# Clone and deploy
git clone https://github.com/harshith-varma07/CivicEye.git
cd CivicEye
docker-compose up -d
```

3. **Setup Nginx:**
```bash
sudo apt install nginx

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/civiceye

# Add configuration:
server {
    listen 80;
    server_name civiceye.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }

    location /ai {
        proxy_pass http://localhost:8000;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/civiceye /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **SSL Certificate:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d civiceye.com -d www.civiceye.com
```

#### Heroku Deployment

**Backend:**
```bash
cd backend
heroku create civiceye-backend
heroku addons:create mongolab
heroku addons:create heroku-redis
heroku config:set NODE_ENV=production
# Set other environment variables
git push heroku main
```

**Frontend:**
```bash
cd frontend
heroku create civiceye-frontend
heroku buildpacks:set mars/create-react-app
git push heroku main
```

### Monitoring and Logging

1. **Setup PM2 for Process Management:**
```bash
npm install -g pm2

# Backend
cd backend
pm2 start src/server.js --name civiceye-backend

# Frontend (if not using Docker)
cd frontend
pm2 start npm --name civiceye-frontend -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

2. **Logging:**
- Configure log rotation
- Use services like Papertrail, Loggly, or CloudWatch
- Monitor error rates and performance metrics

3. **Monitoring:**
- Setup health check endpoints
- Use monitoring tools (New Relic, Datadog, or Prometheus)
- Configure alerts for downtime and errors

### Database Backups

**MongoDB Atlas:**
- Enable automatic backups in cluster settings
- Schedule regular snapshots
- Test restore procedures

**Manual Backup:**
```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/civiceye" --out=/backups/$(date +%Y%m%d)
```

### Security Best Practices

1. **Environment Variables:**
   - Never commit .env files
   - Use secret management services (AWS Secrets Manager, HashiCorp Vault)

2. **Firewall:**
   - Configure UFW or security groups
   - Only allow necessary ports (80, 443, 22)

3. **SSL/TLS:**
   - Use Let's Encrypt for free certificates
   - Enforce HTTPS redirects

4. **Rate Limiting:**
   - Already configured in backend
   - Consider using Cloudflare for DDoS protection

5. **Database Security:**
   - Use strong passwords
   - Enable authentication
   - Restrict network access

### Performance Optimization

1. **CDN:**
   - Use Cloudflare or AWS CloudFront
   - Cache static assets

2. **Database Indexing:**
   - Already configured in models
   - Monitor slow queries

3. **Caching:**
   - Redis caching already implemented
   - Tune TTL values based on usage

4. **Load Balancing:**
   - Use Nginx or AWS ELB
   - Horizontal scaling with multiple instances

## Testing in Production

1. **Smoke Tests:**
```bash
# Test API health
curl https://api.civiceye.com/health

# Test frontend
curl https://civiceye.com
```

2. **Load Testing:**
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://api.civiceye.com/api/issues
```

## Troubleshooting

**Backend not starting:**
- Check MongoDB connection
- Verify environment variables
- Check logs: `pm2 logs civiceye-backend`

**Frontend build errors:**
- Clear node_modules and reinstall
- Check environment variables
- Verify API URLs

**Database connection issues:**
- Check network access/firewall
- Verify credentials
- Test connection with mongosh

**Blockchain deployment issues:**
- Ensure wallet has sufficient MATIC
- Check network configuration
- Verify RPC URL is accessible

## Maintenance

1. **Regular Updates:**
```bash
# Update dependencies
npm update
pip install --upgrade -r requirements.txt

# Apply security patches
npm audit fix
```

2. **Database Maintenance:**
- Regular backups
- Index optimization
- Clean old logs

3. **Monitoring:**
- Review error logs daily
- Monitor resource usage
- Check API response times

## Support

For issues and questions:
- GitHub Issues: https://github.com/harshith-varma07/CivicEye/issues
- Email: support@civiceye.com
- Documentation: https://docs.civiceye.com

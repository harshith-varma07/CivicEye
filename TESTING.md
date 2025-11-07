# CivicEye Testing Guide

## Overview

This guide covers testing procedures for the CivicEye platform.

## Backend Testing

### Unit Tests

Location: `backend/src/__tests__/`

Run tests:
```bash
cd backend
npm test
```

Example test for Issue Controller:

```javascript
// backend/src/__tests__/issue.test.js
const request = require('supertest');
const app = require('../server');
const Issue = require('../models/Issue');

describe('Issue API', () => {
  let token;
  
  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = res.body.token;
  });
  
  describe('POST /api/issues', () => {
    it('should create a new issue', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Pothole',
          description: 'Large pothole on Main Street',
          category: 'pothole',
          location: {
            coordinates: [-73.935242, 40.730610],
            address: '123 Main St'
          }
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Test Pothole');
    });
    
    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/issues')
        .send({
          title: 'Test Issue',
          description: 'Test',
          category: 'pothole',
          location: {
            coordinates: [0, 0],
            address: 'Test'
          }
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
  
  describe('GET /api/issues', () => {
    it('should get all issues', async () => {
      const res = await request(app).get('/api/issues');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('issues');
      expect(Array.isArray(res.body.issues)).toBe(true);
    });
    
    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/issues?status=pending');
      
      expect(res.statusCode).toBe(200);
      res.body.issues.forEach(issue => {
        expect(issue.status).toBe('pending');
      });
    });
  });
});
```

### Integration Tests

Test complete workflows:

```javascript
// backend/src/__tests__/workflow.test.js
describe('Complete Issue Workflow', () => {
  it('should create, upvote, assign, and resolve issue', async () => {
    // 1. Create issue
    const createRes = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send(issueData);
    const issueId = createRes.body._id;
    
    // 2. Upvote issue
    await request(app)
      .put(`/api/issues/${issueId}/upvote`)
      .set('Authorization', `Bearer ${otherCitizenToken}`);
    
    // 3. Assign to authority
    await request(app)
      .put(`/api/issues/${issueId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ authorityId: authorityId });
    
    // 4. Resolve issue
    const resolveRes = await request(app)
      .put(`/api/issues/${issueId}/status`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .send({ status: 'resolved', resolutionNotes: 'Fixed' });
    
    expect(resolveRes.body.status).toBe('resolved');
  });
});
```

## Frontend Testing

### Component Tests

Using React Testing Library:

```javascript
// frontend/src/__tests__/LoginPage.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  it('submits form with credentials', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Assert redirect or success message
  });
});
```

### E2E Tests

Using Cypress:

```javascript
// cypress/e2e/issue-reporting.cy.js
describe('Issue Reporting Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.login('test@example.com', 'password123');
  });
  
  it('should report a new issue', () => {
    cy.visit('/report');
    
    cy.get('input[name="title"]').type('Test Pothole');
    cy.get('textarea[name="description"]').type('Large pothole causing issues');
    cy.get('select[name="category"]').select('pothole');
    cy.get('input[name="address"]').type('123 Main St');
    
    // Click on map to set location
    cy.get('.leaflet-container').click(300, 300);
    
    // Upload image
    cy.get('input[type="file"]').attachFile('pothole.jpg');
    
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Issue reported successfully');
  });
});
```

## AI Services Testing

### Unit Tests

```python
# ai_services/tests/test_categorizer.py
import pytest
from app.models.categorizer import categorizer

def test_categorizer_predict():
    result = categorizer.predict("There is a large pothole on Main Street")
    
    assert 'category' in result
    assert 'confidence' in result
    assert result['category'] == 'pothole'
    assert result['confidence'] > 0.5

def test_categorizer_with_streetlight():
    result = categorizer.predict("The streetlight is not working")
    
    assert result['category'] == 'streetlight'

def test_categorizer_with_garbage():
    result = categorizer.predict("Garbage pile on the street corner")
    
    assert result['category'] == 'garbage'
```

Run AI tests:
```bash
cd ai_services
pytest
```

## Smart Contract Testing

### Hardhat Tests

```javascript
// contracts/test/IssueRegistry.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IssueRegistry", function () {
  let issueRegistry;
  let owner, user1, authority;
  
  beforeEach(async function () {
    [owner, user1, authority] = await ethers.getSigners();
    
    const IssueRegistry = await ethers.getContractFactory("IssueRegistry");
    issueRegistry = await IssueRegistry.deploy();
    await issueRegistry.waitForDeployment();
  });
  
  it("Should register a new issue", async function () {
    await issueRegistry.connect(user1).registerIssue(
      "issue-1",
      "pothole",
      "QmHash123"
    );
    
    const issue = await issueRegistry.issues("issue-1");
    expect(issue.reporter).to.equal(user1.address);
    expect(issue.category).to.equal("pothole");
    expect(issue.exists).to.be.true;
  });
  
  it("Should upvote an issue", async function () {
    await issueRegistry.connect(user1).registerIssue(
      "issue-1",
      "pothole",
      "QmHash123"
    );
    
    await issueRegistry.connect(owner).upvoteIssue("issue-1");
    
    const issue = await issueRegistry.issues("issue-1");
    expect(issue.upvotes).to.equal(1);
  });
  
  it("Should assign issue to authority", async function () {
    await issueRegistry.grantAuthorityRole(authority.address);
    
    await issueRegistry.connect(user1).registerIssue(
      "issue-1",
      "pothole",
      "QmHash123"
    );
    
    await issueRegistry.connect(authority).assignIssue("issue-1", authority.address);
    
    const issue = await issueRegistry.issues("issue-1");
    expect(issue.assignedTo).to.equal(authority.address);
    expect(issue.status).to.equal(2); // Assigned status
  });
});
```

Run contract tests:
```bash
cd contracts
npx hardhat test
```

## Load Testing

### Artillery Configuration

```yaml
# load-test.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Spike test"
  variables:
    token: "{{ $randomString() }}"

scenarios:
  - name: "Get Issues"
    flow:
      - get:
          url: "/api/issues"
      - think: 1
  
  - name: "Create Issue (authenticated)"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/issues"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Load Test Issue"
            description: "Testing"
            category: "pothole"
            location:
              coordinates: [-73.935242, 40.730610]
              address: "123 Test St"
```

Run load test:
```bash
artillery run load-test.yml
```

## Manual Testing Checklist

### User Registration & Authentication
- [ ] Register new citizen user
- [ ] Register new authority user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] View profile

### Issue Reporting
- [ ] Create issue with photo
- [ ] Create issue with video
- [ ] Select location on map
- [ ] Submit without required fields
- [ ] View created issue

### Issue Interaction
- [ ] Upvote issue
- [ ] Remove upvote
- [ ] Add comment
- [ ] View issue details
- [ ] Filter issues by status
- [ ] Filter issues by category
- [ ] Search issues by location

### Authority Features
- [ ] Assign issue to authority
- [ ] Update issue status
- [ ] Mark issue as resolved
- [ ] Add resolution notes
- [ ] Upload resolution photo

### Gamification
- [ ] View leaderboard
- [ ] Check earned badges
- [ ] View CivicCredits balance
- [ ] View user statistics

### Mobile Responsiveness
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test landscape/portrait modes

## Security Testing

### Authentication & Authorization
- [ ] Test JWT token expiration
- [ ] Test invalid tokens
- [ ] Test role-based access control
- [ ] Test API rate limiting

### Input Validation
- [ ] SQL injection attempts
- [ ] XSS attempts
- [ ] File upload validation
- [ ] Input sanitization

### API Security
- [ ] CORS configuration
- [ ] HTTPS enforcement (production)
- [ ] Secure headers (helmet.js)
- [ ] Rate limiting

## Performance Testing

### Metrics to Monitor
- API response time
- Database query performance
- Redis cache hit rate
- Frontend load time
- Image optimization

### Tools
- Lighthouse for frontend performance
- New Relic/Datadog for backend monitoring
- MongoDB Atlas performance advisor
- Redis monitoring

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm test
  
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
  
  contract-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd contracts && npm install
      - name: Run tests
        run: cd contracts && npx hardhat test
```

## Test Coverage

Aim for:
- Backend: >80% code coverage
- Frontend: >70% component coverage
- Smart Contracts: 100% function coverage

Generate coverage report:
```bash
# Backend
cd backend
npm run test -- --coverage

# Frontend
cd frontend
npm test -- --coverage
```

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/videos
5. Environment details (browser, OS, etc.)
6. Error messages/logs

## Test Data

Use provided seed scripts to populate test data:
```bash
# Backend seed script
cd backend
node scripts/seed.js
```

Test users:
- Citizen: `citizen@civiceye.com` / `password123`
- Authority: `authority@civiceye.com` / `password123`
- Admin: `admin@civiceye.com` / `password123`

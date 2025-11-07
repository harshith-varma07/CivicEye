# Contributing to CivicEye

Thank you for your interest in contributing to CivicEye! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version, etc.)
- **Error messages and logs**

Use this template:

```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., Ubuntu 22.04]
 - Browser: [e.g., Chrome 120]
 - Node Version: [e.g., 18.17.0]
 - Version: [e.g., 1.0.0]

**Additional Context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear title**
- **Provide detailed description**
- **Explain why this enhancement would be useful**
- **List similar features in other apps** (if any)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the coding standards
   - Add tests for new features
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide clear title and description
   - Link related issues
   - Include screenshots for UI changes
   - Ensure all tests pass

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- Redis
- Git

### Setup Steps

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/CivicEye.git
   cd CivicEye
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/harshith-varma07/CivicEye.git
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   
   # AI Services
   cd ../ai_services && pip install -r requirements.txt
   
   # Contracts
   cd ../contracts && npm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy example files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp ai_services/.env.example ai_services/.env
   cp contracts/.env.example contracts/.env
   
   # Edit each .env file with your configuration
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   
   # Terminal 3 - AI Services
   cd ai_services && uvicorn main:app --reload
   ```

## Coding Standards

### JavaScript/Node.js

- Use ES6+ syntax
- 2 spaces for indentation
- Semicolons required
- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Use UPPER_CASE for constants

**Example:**
```javascript
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error('User not found');
  }
};
```

### Python

- Follow PEP 8 style guide
- 4 spaces for indentation
- Use snake_case for functions and variables
- Use PascalCase for classes
- Add docstrings to functions

**Example:**
```python
def analyze_issue(issue_data: dict) -> dict:
    """
    Analyze civic issue using AI models.
    
    Args:
        issue_data: Dictionary containing issue details
        
    Returns:
        Dictionary with analysis results
    """
    result = categorizer.predict(issue_data['text'])
    return result
```

### React/JSX

- Use functional components with hooks
- Use PascalCase for component names
- One component per file
- Extract reusable logic into custom hooks

**Example:**
```jsx
import React, { useState, useEffect } from 'react';

const IssueCard = ({ issue }) => {
  const [upvoted, setUpvoted] = useState(false);
  
  useEffect(() => {
    // Check if user has upvoted
  }, [issue]);
  
  return (
    <div className="issue-card">
      <h3>{issue.title}</h3>
      <p>{issue.description}</p>
    </div>
  );
};

export default IssueCard;
```

### Solidity

- Follow Solidity style guide
- Use NatSpec comments
- 4 spaces for indentation
- Use mixedCase for function names

**Example:**
```solidity
/// @notice Registers a new civic issue on blockchain
/// @param _issueId Unique identifier for the issue
/// @param _category Category of the issue
/// @param _ipfsHash IPFS hash of issue media
function registerIssue(
    string memory _issueId,
    string memory _category,
    string memory _ipfsHash
) external {
    require(!issues[_issueId].exists, "Issue already registered");
    // Implementation
}
```

## Commit Messages

Follow conventional commits specification:

**Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(backend): add issue assignment API endpoint

fix(frontend): resolve map marker positioning bug

docs(readme): update installation instructions

test(ai): add unit tests for categorizer
```

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### AI Services Tests
```bash
cd ai_services
pytest
pytest --cov=app
```

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

## Documentation

- Update README.md if you change functionality
- Add JSDoc/docstrings to new functions
- Update API documentation for new endpoints
- Include inline comments for complex logic

## Project Structure

```
CivicEye/
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── ai_services/       # Python AI services
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── requirements.txt
└── contracts/         # Smart contracts
    ├── contracts/
    ├── scripts/
    └── test/
```

## Feature Development Workflow

1. **Check existing issues** or create new one
2. **Discuss the feature** in the issue
3. **Get approval** from maintainers
4. **Create feature branch**
5. **Develop the feature**
   - Write code
   - Add tests
   - Update docs
6. **Test thoroughly**
7. **Create pull request**
8. **Address review comments**
9. **Merge after approval**

## Code Review Process

### For Reviewers
- Be constructive and respectful
- Check code quality and standards
- Verify tests are included
- Test functionality locally
- Approve or request changes

### For Contributors
- Respond to feedback promptly
- Make requested changes
- Re-request review after updates
- Be open to suggestions

## Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: High priority
- `priority: low`: Low priority
- `backend`: Backend related
- `frontend`: Frontend related
- `ai`: AI services related
- `blockchain`: Smart contracts related

## Release Process

1. Update version in package.json files
2. Update CHANGELOG.md
3. Create release branch
4. Test thoroughly
5. Create GitHub release
6. Deploy to staging
7. Test on staging
8. Deploy to production
9. Monitor for issues

## Getting Help

- **Documentation**: Check docs in repository
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Email**: support@civiceye.com (if applicable)

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- GitHub contributors page

## License

By contributing to CivicEye, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out:
- Create an issue for questions
- Use GitHub Discussions
- Contact maintainers

Thank you for contributing to CivicEye! 🎉

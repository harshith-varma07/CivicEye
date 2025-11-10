#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up CivicEye environment files...\n');

const envFiles = [
  {
    source: 'backend/.env.example',
    target: 'backend/.env',
    name: 'Backend'
  },
  {
    source: 'frontend/.env.example',
    target: 'frontend/.env',
    name: 'Frontend'
  },
  {
    source: 'ai_services/.env.example',
    target: 'ai_services/.env',
    name: 'AI Services'
  }
];

let setupComplete = true;

envFiles.forEach(({ source, target, name }) => {
  const sourcePath = path.join(process.cwd(), source);
  const targetPath = path.join(process.cwd(), target);

  if (fs.existsSync(targetPath)) {
    console.log(`✅ ${name}: .env file already exists`);
  } else if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${name}: Created .env file from .env.example`);
    } catch (error) {
      console.log(`❌ ${name}: Failed to create .env file - ${error.message}`);
      setupComplete = false;
    }
  } else {
    console.log(`⚠️  ${name}: .env.example not found at ${sourcePath}`);
    setupComplete = false;
  }
});

console.log('\n' + '='.repeat(60));

if (setupComplete) {
  console.log('✅ Environment setup complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Review and update .env files with your configuration');
  console.log('   2. Ensure MongoDB is running (default: localhost:27017)');
  console.log('   3. Ensure Redis is running (default: localhost:6379)');
  console.log('   4. Run: npm run dev\n');
} else {
  console.log('⚠️  Some environment files could not be created.');
  console.log('   Please check the errors above and create .env files manually.\n');
}

console.log('='.repeat(60));

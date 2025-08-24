#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Building Netlify Functions...');

const functionsDir = path.join(__dirname, 'netlify', 'functions');

// Ensure functions directory exists
if (!fs.existsSync(functionsDir)) {
  console.error('❌ Functions directory not found:', functionsDir);
  process.exit(1);
}

try {
  // Change to functions directory
  process.chdir(functionsDir);
  
  // Install dependencies
  console.log('📦 Installing function dependencies...');
  execSync('npm install --production', { stdio: 'inherit' });
  
  // Verify package.json exists
  const packageJsonPath = path.join(functionsDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found in functions directory');
    process.exit(1);
  }
  
  console.log('✅ Functions build completed successfully');
  
} catch (error) {
  console.error('❌ Error building functions:', error.message);
  process.exit(1);
}

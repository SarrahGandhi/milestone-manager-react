#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * This script checks if all required environment variables are set
 * Run this before deploying to catch configuration issues early
 */

require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD'
];

console.log('\n🔍 Checking Environment Variables...\n');
console.log('━'.repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('\n✅ Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ❌ ${varName}: NOT SET (REQUIRED!)`);
    hasErrors = true;
  } else {
    // Show partial value for security
    const displayValue = value.length > 20 
      ? `${value.substring(0, 20)}...` 
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  }
});

// Check optional variables
console.log('\n⚙️  Optional Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ⚠️  ${varName}: Not set (optional)`);
    hasWarnings = true;
  } else {
    // Mask sensitive values
    const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET')
      ? '***********'
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n' + '━'.repeat(60));

// Security checks
console.log('\n🔒 Security Checks:');
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret === 'milestone_manager_super_secret_key_2024_wedding_planning_app') {
    console.log('  ⚠️  WARNING: Using default JWT_SECRET (change this in production!)');
    hasWarnings = true;
  } else if (jwtSecret.length < 32) {
    console.log('  ⚠️  WARNING: JWT_SECRET is too short (should be at least 32 characters)');
    hasWarnings = true;
  } else {
    console.log('  ✅ JWT_SECRET looks secure');
  }
}

// Environment check
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`  📦 NODE_ENV: ${nodeEnv}`);
if (nodeEnv === 'production' && hasErrors) {
  console.log('  ❌ CRITICAL: Production environment is missing required variables!');
}

// Final summary
console.log('\n' + '━'.repeat(60));
console.log('\n📊 Summary:');

if (hasErrors) {
  console.log('  ❌ FAILED: Missing required environment variables');
  console.log('\n💡 Action Required:');
  console.log('  1. Create a .env file in the backend directory');
  console.log('  2. Add all required environment variables');
  console.log('  3. For Render deployment, add variables in the dashboard');
  console.log('  4. See DEPLOYMENT_GUIDE.md for detailed instructions');
  process.exit(1);
} else if (hasWarnings) {
  console.log('  ⚠️  PASSED WITH WARNINGS: Some optional variables are missing');
  console.log('  Review the warnings above and update if needed');
  process.exit(0);
} else {
  console.log('  ✅ ALL CHECKS PASSED: Environment is properly configured');
  process.exit(0);
}


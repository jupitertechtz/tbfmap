/**
 * Quick test script to verify Gmail configuration
 * Run with: node test-email-config.js
 */

require('dotenv').config();

const GMAIL_CONFIG = {
  email: process.env.GMAIL_EMAIL || 'tanzaniabasketball@gmail.com',
  password: process.env.GMAIL_PASSWORD || '',
};

console.log('\n=== Gmail Configuration Check ===\n');
console.log('Email:', GMAIL_CONFIG.email);
console.log('Password length:', GMAIL_CONFIG.password.length);
console.log('Password format:', /^[a-z0-9]{16}$/.test(GMAIL_CONFIG.password) ? '✅ Valid (16 lowercase/numbers)' : '❌ Invalid format');
console.log('Password loaded from:', process.env.GMAIL_PASSWORD ? '.env file ✅' : 'NOT FOUND ❌');

if (GMAIL_CONFIG.password.length === 16) {
  console.log('\n✅ Configuration looks good!');
  console.log('Make sure to restart your server after updating .env');
} else {
  console.log('\n❌ Password should be exactly 16 characters');
  console.log('Current length:', GMAIL_CONFIG.password.length);
}

console.log('\n');


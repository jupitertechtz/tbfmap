/**
 * Quick test script to verify Resend configuration
 * Run: node test-resend-config.js
 */

require('dotenv').config();

const { Resend } = require('resend');

const RESEND_CONFIG = {
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'Tanzania Basketball Federation <onboarding@resend.dev>',
};

console.log('\n=== Resend Configuration Check ===\n');
console.log('API Key:', RESEND_CONFIG.apiKey ? `${RESEND_CONFIG.apiKey.substring(0, 10)}...` : 'NOT SET ❌');
console.log('API Key format:', /^re_/.test(RESEND_CONFIG.apiKey) ? '✅ Valid (starts with re_)' : '❌ Invalid format');
console.log('From Email:', RESEND_CONFIG.fromEmail);
console.log('Config loaded from:', process.env.RESEND_API_KEY ? 'Environment variables ✅' : 'NOT FOUND ❌');

if (RESEND_CONFIG.apiKey && /^re_/.test(RESEND_CONFIG.apiKey)) {
  console.log('\n✅ Configuration looks valid!');
  console.log('\nTo test sending an email, use the Email Configuration page in your app.');
  console.log('Or test via API:');
  console.log('  curl -X POST https://api.tanzaniabasketball.com/send-invitation \\');
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"to":"test@example.com","fullName":"Test User","email":"test@example.com","password":"test123","role":"staff"}\'');
} else {
  console.log('\n❌ Configuration incomplete!');
  console.log('\nTo fix:');
  console.log('1. Get your API key from: https://resend.com/api-keys');
  console.log('2. Set RESEND_API_KEY in Railway environment variables');
  console.log('3. Optional: Set FROM_EMAIL for custom sender');
}

console.log('\n');


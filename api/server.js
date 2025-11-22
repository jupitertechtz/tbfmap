/**
 * Combined API Server
 * 
 * This server combines both email and file upload functionality.
 * Run this server to have both services available on one port.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Import email routes (mount at root)
const emailApp = require('./send-invitation');
app.use('/', emailApp);

// Import file upload routes (mount at root)
const uploadApp = require('./upload-files');
app.use('/', uploadApp);

// Import user creation routes (mount at root)
const userCreationApp = require('./create-user');
app.use('/', userCreationApp);

// Start combined server
const PORT = process.env.PORT || 3001;

// Only start if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TBF API server running on port ${PORT}`);
    
    // Check Resend configuration
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      console.log(`Email service: Resend (configured)`);
      console.log(`From email: ${process.env.FROM_EMAIL || 'Tanzania Basketball Federation <onboarding@resend.dev>'}`);
    } else {
      console.log(`Email service: Resend (⚠️  RESEND_API_KEY not set)`);
    }
    
    console.log(`File upload service: Available`);
    console.log(`User creation service: Available`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Files served at: http://localhost:${PORT}/files/`);
  });
}

module.exports = app;


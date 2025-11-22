/**
 * Backend API Endpoint for Creating Users
 * 
 * This endpoint securely creates users using the Supabase service role key.
 * The service role key is stored server-side and never exposed to the client.
 * 
 * To use this:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in api/.env
 * 2. This endpoint will be available at POST /create-user
 */

require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client (server-side only)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️  WARNING: Supabase admin client not configured.');
  console.warn('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in api/.env');
}

const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Create user endpoint
app.post('/create-user', async (req, res) => {
  try {
    console.log('Create user request received:', {
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      email: req.body?.email,
      hasFullName: !!req.body?.fullName,
      hasRole: !!req.body?.role,
      hasPassword: !!req.body?.password,
    });

    if (!supabaseAdmin) {
      console.error('Admin client not configured');
      return res.status(500).json({
        error: 'Admin client not configured',
        message: 'Service role key not set in backend environment. Please set SUPABASE_SERVICE_ROLE_KEY in api/.env'
      });
    }

    const { email, password, fullName, role, phone } = req.body;

    // Validation
    if (!email || !password || !fullName || !role) {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!fullName) missing.push('fullName');
      if (!role) missing.push('role');
      
      console.error('Missing required fields:', missing);
      return res.status(400).json({
        error: 'Missing required fields',
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters'
      });
    }

    // Create user using admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role,
        phone: phone || null,
      },
    });

    if (error) {
      console.error('User creation error:', error);
      return res.status(400).json({
        error: 'Failed to create user',
        message: error.message || 'An error occurred while creating the user'
      });
    }

    // Return user data (profile will be created automatically by trigger)
    res.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName,
        role,
        phone: phone || null,
        createdAt: data.user.created_at,
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Health check endpoint (merged with server.js health endpoint)
app.get('/health-user', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-creation-api',
    adminConfigured: !!supabaseAdmin,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceRoleKey
  });
});

// Only start server if run directly (not when required as module)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`User creation API running on port ${PORT}`);
    console.log(`Admin client configured: ${!!supabaseAdmin}`);
  });
}

module.exports = app;


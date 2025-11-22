# Secure User Creation - Backend API Approach

## Problem

The current implementation uses `VITE_SUPABASE_SERVICE_ROLE_KEY` in the frontend, which is a security risk because:
- The service role key is exposed in client-side code
- Anyone can view it in the browser's network tab or source code
- It bypasses all security policies

## Solution: Backend API Endpoint

Create a secure backend API endpoint that handles user creation server-side.

## Implementation

### 1. Backend API Endpoint

Create `api/create-user.js`:

```javascript
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client (server-side only)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // From backend .env, not frontend

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase configuration in backend .env');
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
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Admin client not configured',
        message: 'Service role key not set in backend environment'
      });
    }

    const { email, password, fullName, role, phone } = req.body;

    // Validation
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, fullName, and role are required'
      });
    }

    // Create user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
        phone: phone || null,
      },
    });

    if (error) {
      return res.status(400).json({
        error: 'Failed to create user',
        message: error.message
      });
    }

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName,
        role,
        phone,
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User creation API running on port ${PORT}`);
});

module.exports = app;
```

### 2. Backend Environment Variables

Create `api/.env`:

```env
# Supabase Configuration (Backend Only)
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Other API settings
PORT=3001
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

### 3. Update Frontend Service

Update `src/services/userService.js`:

```javascript
async createUser({ email, password, fullName, role, phone }) {
  try {
    // Call backend API instead of using admin client
    const apiUrl = import.meta.env.VITE_API_URL || 'https://tbfmap-production.up.railway.app';
    
    const response = await fetch(`${apiUrl}/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        role,
        phone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create user');
    }

    const result = await response.json();
    
    // Send invitation email (non-blocking)
    if (result.success) {
      try {
        const loginUrl = `${window.location.origin}/login`;
        await sendInvitationEmail({
          to: email,
          fullName,
          email,
          password,
          role,
          loginUrl,
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
      }
    }

    return normalizeProfile(result.user);
  } catch (error) {
    throw new Error(error?.message || 'Failed to create user');
  }
}
```

### 4. Remove Frontend Admin Client

After implementing the backend API:
- Remove `VITE_SUPABASE_SERVICE_ROLE_KEY` from frontend `.env.local`
- Remove or comment out the admin client usage in `src/lib/supabaseAdmin.js`
- The service role key will only exist in the backend

## Benefits

1. **Security**: Service role key never exposed to clients
2. **Control**: All user creation logic centralized in backend
3. **Auditing**: Can add logging and monitoring server-side
4. **Validation**: Can add additional server-side validation
5. **Rate Limiting**: Can implement rate limiting on the endpoint

## Migration Steps

1. Create the backend API endpoint
2. Update the frontend service to call the API
3. Test user creation
4. Remove service role key from frontend environment
5. Deploy backend with service role key in secure environment variables


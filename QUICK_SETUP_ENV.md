# Quick Setup: Environment Variables

## Problem
You're seeing: "Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY to enable admin user creation."

## Solution

I've moved user creation to a **secure backend API**. The service role key is now stored server-side (not in the frontend).

## Setup Steps

### 1. Install Supabase Package in API

```bash
cd api
npm install @supabase/supabase-js
```

### 2. Create `api/.env` File

Create a file named `.env` in the `api` directory:

```env
# Supabase Configuration (Backend Only - Secure)
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Other existing variables
GMAIL_EMAIL=tanzaniabasketball@gmail.com
GMAIL_PASSWORD=your-gmail-app-password
PORT=3001
```

### 3. Get Your Supabase Keys

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Restart API Server

```bash
cd api
npm start
```

You should see:
```
TBF API server running on port 3001
Email service: Available
File upload service: Available
User creation service: Available
```

### 5. Test User Creation

Try creating a user from the User Management page. It should now work!

## Security Benefits

✅ Service role key stays in backend (never exposed to frontend)  
✅ All user creation happens server-side  
✅ Can add authentication/authorization to the endpoint  
✅ Can add rate limiting and logging  

## File Structure

```
tbfmap/
├── api/
│   ├── .env              ← Create this with SUPABASE_SERVICE_ROLE_KEY
│   ├── create-user.js    ← New secure endpoint
│   └── server.js         ← Updated to include user creation
├── src/
│   └── services/
│       └── userService.js ← Updated to use backend API
└── .env.local            ← Frontend env (no service role key needed)
```

## Troubleshooting

### "Admin client not configured"
- Check that `api/.env` exists
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Restart the API server after adding the key

### "Failed to create user"
- Check API server is running
- Verify `VITE_API_URL` in frontend matches API server port
- Check API server logs for errors

### "Cannot connect to API"
- Ensure API server is running: `cd api && npm start`
- Check `VITE_API_URL` in frontend `.env.local` matches API port


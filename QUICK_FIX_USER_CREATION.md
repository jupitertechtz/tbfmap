# Quick Fix: Enable User Creation

## The Problem
You're seeing: "fetch failed" or "Ensure VITE_SUPABASE_SERVICE_ROLE_KEY is configured"

## The Solution (3 Steps)

### Step 1: Check `api/.env` File

Open `api/.env` and verify it has these two lines:

```env
SUPABASE_URL=https://twrxgvhtxxzwhutpkomh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3cnhndmh0eHh6d2h1dHBrb21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2MjU2NCwiZXhwIjoyMDc4NDM4NTY0fQ.WPVDsDqYp2m0xMJWIoqWE1g-IMUkyoh0DVmE8G8MTyo
```

**Important**: 
- The service role key must be on **one line** (no line breaks)
- No quotes, no spaces around `=`

### Step 2: Restart the API Server

**Stop the current server** (if running):
- Find the terminal window running the API server
- Press `Ctrl+C` to stop it

**Start it again**:
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

### Step 3: Test It

Try creating a user in the frontend. It should work now!

---

## Why This Happens

The API server reads environment variables from `api/.env` when it **starts**. If you:
- Just added the `.env` file
- Just edited the `.env` file
- Changed the values

You **must restart** the server for it to pick up the new values.

## Still Not Working?

1. **Check the API server console** for error messages
2. **Verify the service role key is correct**:
   - Go to https://app.supabase.com
   - Settings → API
   - Copy the **service_role** key (not the anon key!)
3. **Check the API server is actually running** on port 3001
4. **Check browser console** for more detailed error messages


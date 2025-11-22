# How to Enable User Creation

## Current Setup

User creation is now handled securely via a **backend API** (not in the frontend). The service role key is stored server-side in `api/.env`.

## Quick Start

1. **Stop the API server** if it's running (Ctrl+C)
2. **Verify `api/.env` has the correct values** (see Step 2 below)
3. **Restart the API server**:
   ```bash
   cd api
   npm start
   ```
4. **Verify it's working** - You should see:
   ```
   TBF API server running on port 3001
   Email service: Available
   File upload service: Available
   User creation service: Available
   ```

## Step 1: Verify API Server is Running

Check if the API server is running:

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

**Important**: If you just added or changed values in `api/.env`, you **must restart** the API server for changes to take effect!

## Step 2: Verify Environment Variables

**Open `api/.env`** and verify it contains:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Current values should be:**
- `SUPABASE_URL=https://twrxgvhtxxzwhutpkomh.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)

**To get/verify these values:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

**Important Notes:**
- The service role key should be on **one line** (no line breaks)
- No quotes around the values
- No spaces around the `=` sign
- After editing `.env`, **restart the API server**

## Step 3: Test the API

Test if the user creation endpoint is working:

```bash
# Using PowerShell
$body = @{
    email = "test@example.com"
    password = "test123456"
    fullName = "Test User"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://tbfmap-production.up.railway.app/create-user" -Method POST -ContentType "application/json" -Body $body
```

Or check the health endpoint:

```bash
Invoke-WebRequest -Uri "https://tbfmap-production.up.railway.app/health" -UseBasicParsing
```

## Step 4: Verify Frontend Configuration

In your frontend `.env.local` (if it exists), make sure:

```env
VITE_API_URL=https://tbfmap-production.up.railway.app
```

**Note**: You do NOT need `VITE_SUPABASE_SERVICE_ROLE_KEY` in the frontend anymore! It's only needed in `api/.env`.

## Troubleshooting

### "Fetch failed" Error

**Most common cause**: API server is not running or needs to be restarted.

1. **Check if API server is running**:
   - Look for a terminal window running `npm start` in the `api` folder
   - Or check if port 3001 is in use

2. **Start/Restart the API server**:
   ```bash
   cd api
   npm start
   ```
   **Important**: If you just edited `api/.env`, you MUST restart the server!

3. **Verify environment variables** in `api/.env`:
   ```bash
   cd api
   Get-Content .env | Select-String "SUPABASE"
   ```
   Should show both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

4. **Test API endpoint directly**:
   ```powershell
   # Test health endpoint
   Invoke-WebRequest -Uri "https://tbfmap-production.up.railway.app/health" -UseBasicParsing
   
   # Test user creation endpoint
   $body = @{
       email = "test@example.com"
       password = "test123456"
       fullName = "Test User"
       role = "admin"
   } | ConvertTo-Json
   
   Invoke-WebRequest -Uri "https://tbfmap-production.up.railway.app/create-user" -Method POST -ContentType "application/json" -Body $body
   ```

### "Admin client not configured"

- Check `api/.env` has `SUPABASE_SERVICE_ROLE_KEY`
- Restart API server after adding the key
- Verify the key is correct (no extra spaces, complete key)

### "Cannot connect to API"

- Ensure API server is running on port 3001
- Check `VITE_API_URL` in frontend matches API server port
- Check firewall/network settings

## File Locations

- **Backend config**: `api/.env` (contains service role key)
- **Frontend config**: `.env.local` in project root (only needs `VITE_API_URL`)

## Security Reminder

✅ **Service role key is in backend** (`api/.env`) - Secure  
❌ **Service role key is NOT in frontend** - Correct!

The frontend calls the backend API, which uses the service role key server-side.


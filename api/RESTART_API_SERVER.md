# Restart API Server for League File Uploads

## Issue
The `/upload-league-file` endpoint is returning 404, which means the API server needs to be restarted to load the new endpoint.

## Quick Fix

### Step 1: Stop the Current Server (if running)
1. Find the terminal/command prompt where the API server is running
2. Press `Ctrl+C` to stop it

OR if running in background:
```powershell
# Windows PowerShell
Get-Process -Name node | Where-Object {$_.Path -like "*api*"} | Stop-Process -Force
```

### Step 2: Restart the Server
```powershell
cd api
npm start
```

For development with auto-reload:
```powershell
cd api
npm run dev
```

### Step 3: Verify the Server is Running
You should see output like:
```
TBF API server running on port 3001
Email service: Available
File upload service: Available
User creation service: Available
Health check: https://tbfmap-production.up.railway.app/health
Files served at: https://tbfmap-production.up.railway.app/files/
```

### Step 4: Test the Endpoint
Open a browser or use PowerShell:
```powershell
# Should return 400 (Bad Request) - this means the endpoint exists!
Invoke-WebRequest -Uri "https://tbfmap-production.up.railway.app/upload-league-file" -Method POST
```

If you get a 400 error (not 404), the endpoint is working correctly!

## Available Endpoints

After restarting, these endpoints should be available:
- `POST /upload-team-file` - Upload team files
- `POST /upload-player-file` - Upload player files
- `POST /upload-league-file` - Upload league files (NEW)
- `DELETE /delete-file` - Delete files
- `GET /files/*` - Serve uploaded files
- `POST /create-user` - Create users
- `POST /send-invitation` - Send email invitations
- `GET /health` - Health check

## Troubleshooting

If the endpoint still returns 404 after restarting:
1. Check that `api/upload-files.js` contains the `/upload-league-file` endpoint
2. Check that `api/server.js` imports `upload-files.js`
3. Check the server logs for any errors
4. Verify the server is running on port 3001


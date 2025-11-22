# Restart API Server

## Issue Fixed

The file upload service wasn't properly integrated into the combined server. This has been fixed.

## How to Restart

### Option 1: If server is running in terminal
1. Press `Ctrl+C` to stop the server
2. Run: `npm start` (or `npm run dev` for development)

### Option 2: If server is running in background
1. Find the process:
   ```powershell
   # Windows PowerShell
   Get-Process -Name node | Where-Object {$_.Path -like "*api*"}
   ```
2. Stop it:
   ```powershell
   Stop-Process -Name node -Force
   ```
3. Restart:
   ```powershell
   cd api
   npm start
   ```

### Option 3: Fresh Start
```powershell
cd api
npm start
```

## Verify It's Working

After restarting, check:
1. Server logs should show:
   ```
   TBF API server running on port 3001
   Email service: Available
   File upload service: Available
   ```

2. Test the upload endpoint:
   ```powershell
   # Should return 400 (Bad Request) because no file was sent, but endpoint should exist
   Invoke-WebRequest -Uri "https://tbfmap-production.up.railway.app/upload-team-file" -Method POST
   ```

3. Check health endpoint:
   ```powershell
   Invoke-WebRequest -Uri "https://tbfmap-production.up.railway.app/health" -UseBasicParsing
   ```

## What Was Fixed

- `upload-files.js` now only starts its own server when run directly
- When required by `server.js`, it properly mounts as middleware
- Both email and file upload services are now available on the same port


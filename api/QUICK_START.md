# Quick Start Guide - Email API Server

## Step-by-Step Instructions

### 1. Navigate to the API Directory

Open your terminal/command prompt and navigate to the `api` folder:

```bash
cd api
```

### 2. Install Dependencies

Install all required packages:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `nodemailer` - Email sending library
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `nodemon` - Development auto-reload (dev dependency)

### 3. Start the Server

**For Development (with auto-reload):**
```bash
npm run dev
```

**For Production:**
```bash
npm start
```

### 4. Verify the Server is Running

You should see output like:
```
Email API server running on port 3001
Gmail configured: tanzaniabasketball@gmail.com
```

### 5. Test the Health Endpoint

Open your browser or use curl to test:
- Browser: http://localhost:3001/health
- Command line: `curl http://localhost:3001/health`

You should see:
```json
{
  "status": "ok",
  "service": "email-api"
}
```

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, you can:
1. Stop the other service using port 3001
2. Or change the port by setting an environment variable:
   ```bash
   PORT=3002 npm start
   ```
   Then update your frontend `.env.local` to use the new port.

### Missing Dependencies

If you get errors about missing modules:
```bash
npm install
```

### Gmail Authentication Issues

If you get authentication errors:
1. Make sure 2-Step Verification is enabled on the Gmail account
2. Use an App Password instead of the regular password
3. Update the password in `send-invitation.js` or use environment variables

## Environment Variables (Optional)

Create a `.env` file in the `api` directory:

```env
GMAIL_PASSWORD=tbf12345678910
PORT=3001
```

Then update `send-invitation.js` to load dotenv:
```javascript
require('dotenv').config();
```

## Next Steps

1. Keep the server running in a terminal window
2. Make sure your frontend `.env.local` has:
   ```
   VITE_API_URL=http://localhost:3001
   ```
3. Test email sending from the Email Configuration page in your app

## Running in Background (Windows)

To run the server in the background on Windows PowerShell:
```powershell
Start-Process node -ArgumentList "send-invitation.js" -WindowStyle Hidden
```

Or use a process manager like PM2:
```bash
npm install -g pm2
pm2 start send-invitation.js --name email-api
pm2 save
```


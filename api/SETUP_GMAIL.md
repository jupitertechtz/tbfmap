# Quick Setup: Fix Gmail App Password Error

## The Error
```
Invalid login: 534-5.7.9 Application-specific password required
```

## Quick Fix (5 Steps)

### Step 1: Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in if needed
3. Select **Mail** from the dropdown
4. Select **Other (Custom name)**
5. Type: "TBF Email API"
6. Click **Generate**
7. **Copy the 16-character password** (remove spaces!)

### Step 2: Create .env File

In the `api` folder, create a file named `.env` with:

```env
GMAIL_EMAIL=tanzaniabasketball@gmail.com
GMAIL_PASSWORD=your-16-char-app-password-here
PORT=3001
```

**Important**: 
- Remove spaces from the App Password
- Example: If Google shows `abcd efgh ijkl mnop`, use `abcdefghijklmnop`

### Step 3: Restart Server

Stop the server (Ctrl+C) and restart:
```bash
npm start
```

### Step 4: Test

Go to Email Configuration page and send a test email.

### Step 5: Verify

Check your email inbox for the test email.

---

## Detailed Instructions

See `GMAIL_APP_PASSWORD_SETUP.md` for complete step-by-step guide with screenshots.

## Troubleshooting

- **Still getting error?** Make sure 2-Step Verification is enabled first
- **Password not working?** Remove all spaces from the App Password
- **Can't find App Passwords?** Enable 2-Step Verification first at https://myaccount.google.com/security


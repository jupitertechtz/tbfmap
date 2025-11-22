# Troubleshooting Gmail Authentication Errors

## Error: "Username and Password not accepted" (535-5.7.8)

This error means Gmail is rejecting your credentials. Here's how to fix it:

### Step 1: Verify Your App Password

1. **Check the App Password format:**
   - Should be exactly 16 characters
   - NO spaces
   - Only lowercase letters and numbers
   - Example: `vfwkpyjfpyewvzjg`

2. **Verify it's in your .env file:**
   ```env
   GMAIL_EMAIL=tanzaniabasketball@gmail.com
   GMAIL_PASSWORD=vfwkpyjfpyewvzjg
   PORT=3001
   ```
   - Make sure there are NO spaces around the `=` sign
   - Make sure there are NO quotes around the password
   - Make sure there are NO spaces in the password itself

### Step 2: Regenerate App Password

If the password still doesn't work:

1. Go to: https://myaccount.google.com/apppasswords
2. Find your existing "TBF Email API" App Password
3. **Delete it** (click the X icon)
4. **Generate a new one:**
   - Select "Mail"
   - Select "Other (Custom name)"
   - Type: "TBF Email API"
   - Click "Generate"
5. **Copy the new password** (remove spaces!)
6. **Update your .env file** with the new password
7. **Restart the server**

### Step 3: Verify Email Address Matches

Make sure the email in your `.env` file matches the Gmail account where you generated the App Password:

```env
GMAIL_EMAIL=tanzaniabasketball@gmail.com  # Must match the account!
```

### Step 4: Check .env File Location

The `.env` file MUST be in the `api` folder:

```
tbfmap/
  api/
    .env          ← Must be here!
    send-invitation.js
    package.json
```

### Step 5: Restart Server After Changes

**Always restart the server** after changing the `.env` file:

1. Stop the server (Ctrl+C)
2. Start it again: `npm start`

### Step 6: Test the Configuration

Add this temporary test code to verify the password is being read:

In `send-invitation.js`, add after the GMAIL_CONFIG:

```javascript
console.log('Email:', GMAIL_CONFIG.email);
console.log('Password length:', GMAIL_CONFIG.password.length);
console.log('Password starts with:', GMAIL_CONFIG.password.substring(0, 4) + '...');
```

**Expected output:**
```
Email: tanzaniabasketball@gmail.com
Password length: 16
Password starts with: vfwk...
```

If password length is 0, the .env file isn't being read correctly.

### Step 7: Common Issues

#### Issue: Password has spaces
**Fix:** Remove all spaces. Google shows `abcd efgh ijkl mnop` but use `abcdefghijklmnop`

#### Issue: Wrong email address
**Fix:** The email must match the Gmail account where you generated the App Password

#### Issue: App Password expired or revoked
**Fix:** Generate a new App Password

#### Issue: 2-Step Verification not enabled
**Fix:** Enable 2-Step Verification first, then generate App Password

#### Issue: .env file not loading
**Fix:** 
- Make sure `require('dotenv').config();` is at the top of the file
- Make sure .env file is in the `api` folder
- Restart the server

### Step 8: Verify Server is Reading .env

When you start the server, you should see:
```
Email API server running on port 3001
Gmail configured: tanzaniabasketball@gmail.com
```

If you see an error about missing password, the .env file isn't being read.

### Still Not Working?

1. **Double-check the App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Verify the App Password exists
   - If unsure, delete it and create a new one

2. **Test with a simple Node.js script:**
   Create `test-env.js` in the `api` folder:
   ```javascript
   require('dotenv').config();
   console.log('Email:', process.env.GMAIL_EMAIL);
   console.log('Password:', process.env.GMAIL_PASSWORD ? 'Set (' + process.env.GMAIL_PASSWORD.length + ' chars)' : 'NOT SET');
   ```
   Run: `node test-env.js`
   
3. **Check for typos:**
   - Email address must be exact
   - Password must be exact (case-sensitive)
   - No extra spaces or characters

4. **Try a different App Password:**
   - Delete the current one
   - Generate a fresh one
   - Update .env
   - Restart server

## Quick Checklist

- [ ] 2-Step Verification is enabled
- [ ] App Password is 16 characters (no spaces)
- [ ] .env file is in the `api` folder
- [ ] Email in .env matches Gmail account
- [ ] No spaces around `=` in .env
- [ ] Server restarted after .env changes
- [ ] `require('dotenv').config();` is in send-invitation.js


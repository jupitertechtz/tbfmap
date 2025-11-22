# How to Generate a Gmail App Password

## The Problem

Gmail requires an **App Password** when 2-Step Verification is enabled. You cannot use your regular Gmail password for SMTP authentication.

Error message you might see:
```
Invalid login: 534-5.7.9 Application-specific password required
```

## Solution: Generate a Gmail App Password

### Step 1: Enable 2-Step Verification (if not already enabled)

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. If it's not enabled, click it and follow the setup process
5. You'll need to verify your phone number

### Step 2: Generate an App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Scroll down and click **App passwords**
   - You may need to sign in again
5. At the top, select **Mail** from the dropdown
6. Select **Other (Custom name)** from the device dropdown
7. Type a name like "TBF Email API" or "Tanzania Basketball Email"
8. Click **Generate**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important**: You can only see this password once! Copy it immediately.

### Step 3: Use the App Password in Your API

#### Option A: Using .env file (Recommended)

1. In the `api` folder, create a file named `.env` (not `.env.example`)
2. Add your configuration:

```env
GMAIL_EMAIL=tanzaniabasketball@gmail.com
GMAIL_PASSWORD=abcdefghijklmnop
PORT=3001
```

**Important Notes:**
- Remove all spaces from the App Password (it's shown with spaces but should be used without)
- The App Password is 16 characters, no spaces
- Example: If Google shows `abcd efgh ijkl mnop`, use `abcdefghijklmnop`

3. Save the file
4. Restart your API server

#### Option B: Direct in Code (Not Recommended for Production)

You can temporarily update `api/send-invitation.js`:

```javascript
const GMAIL_CONFIG = {
  email: 'tanzaniabasketball@gmail.com',
  password: 'your-16-character-app-password-here', // No spaces!
};
```

⚠️ **Warning**: Never commit passwords to version control!

### Step 4: Restart the API Server

After updating the password:

1. Stop the server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm start
   ```

### Step 5: Test the Configuration

1. Go to the Email Configuration page in your app
2. Click "Check Status" to verify API is online
3. Send a test email to yourself
4. Check your inbox (and spam folder)

## Troubleshooting

### "Invalid login" still appears

1. **Double-check the App Password**: Make sure there are no spaces
2. **Verify 2-Step Verification is enabled**: App passwords only work with 2-Step Verification
3. **Check the email address**: Make sure `GMAIL_EMAIL` matches the account where you generated the App Password
4. **Regenerate App Password**: If unsure, delete the old one and create a new one

### "Less secure app access" error

- Gmail no longer supports "Less secure app access"
- You **must** use App Passwords with 2-Step Verification
- This is the only way to authenticate now

### App Password not working

1. Make sure you copied the entire 16-character password
2. Remove all spaces
3. Verify the `.env` file is in the `api` folder
4. Restart the server after changing `.env`
5. Check that `dotenv` is loaded in `send-invitation.js`

## Security Best Practices

1. ✅ **Use App Passwords** - More secure than regular passwords
2. ✅ **Store in .env file** - Never commit to version control
3. ✅ **Add .env to .gitignore** - Keep credentials private
4. ✅ **Use different App Passwords** - One per application/service
5. ✅ **Revoke unused App Passwords** - Delete old ones you're not using

## Quick Reference

- **App Password Format**: 16 characters, no spaces (e.g., `abcdefghijklmnop`)
- **Location**: Google Account → Security → 2-Step Verification → App passwords
- **Required**: 2-Step Verification must be enabled first
- **One-time view**: Copy it immediately, you can't see it again

## Need Help?

If you're still having issues:
1. Verify 2-Step Verification is enabled
2. Generate a new App Password
3. Make sure the `.env` file is in the `api` directory
4. Restart the server after any changes
5. Check the server console for detailed error messages


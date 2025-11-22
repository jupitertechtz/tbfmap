# Restart Instructions

## To Apply the New App Password:

1. **Stop the current server** (if running):
   - Press `Ctrl+C` in the terminal where the server is running

2. **Start the server again**:
   ```bash
   npm start
   ```

3. **Verify the configuration**:
   You should see:
   ```
   Email API server running on port 3001
   Gmail configured: tanzaniabasketball@gmail.com
   Gmail password: 16 characters (loaded from .env)
   ```

4. **Test the email**:
   - Go to Email Configuration page in your app
   - Click "Check Status" - should show "Online"
   - Send a test email to yourself
   - Check your inbox!

## If you still get errors:

1. Make sure the server was restarted after updating .env
2. Verify the App Password is correct (no typos, no spaces)
3. Check that the email matches the Gmail account where you generated the App Password
4. Try generating a fresh App Password if needed


# TBF Email API Service

Backend API service for sending invitation emails via Gmail SMTP for the Tanzania Basketball Federation management system.

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Configure Gmail App Password

**⚠️ IMPORTANT**: Gmail requires an App Password when 2-Step Verification is enabled. You cannot use your regular password.

**Quick Setup:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate an App Password for "Mail"
3. Copy the 16-character password (remove spaces)
4. Create a `.env` file in the `api` directory (see Step 3)

**For detailed instructions, see:** `GMAIL_APP_PASSWORD_SETUP.md`

### 3. Set Environment Variables (Required)

Create a `.env` file in the `api` directory:

```env
GMAIL_EMAIL=tanzaniabasketball@gmail.com
GMAIL_PASSWORD=your-16-character-app-password-here
PORT=3001
```

**Important Notes:**
- The App Password should be 16 characters with NO spaces
- Example: If Google shows `abcd efgh ijkl mnop`, use `abcdefghijklmnop`
- Never commit the `.env` file to version control

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

### 5. Configure Frontend

In your frontend `.env.local` file, add:

```env
VITE_API_URL=http://localhost:3001
```

For production, update to your deployed API URL:
```env
VITE_API_URL=https://api.yourdomain.com
```

## API Endpoints

### POST `/send-invitation`

Sends an invitation email to a new user.

**Request Body:**
```json
{
  "to": "user@example.com",
  "fullName": "John Doe",
  "email": "user@example.com",
  "password": "temporary-password",
  "role": "team_manager",
  "loginUrl": "https://yourdomain.com/login"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation email sent successfully",
  "messageId": "smtp-message-id"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "email-api"
}
```

## Deployment

### Option 1: Deploy as Separate Service

Deploy this API to a hosting service like:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS Lambda (with modifications)

### Option 2: Integrate into Existing Backend

Copy the email sending logic into your existing Node.js/Express backend.

## Gmail Setup for Production

1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the App Password in your `.env` file instead of your regular password

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password, not your regular Gmail password
- Check that 2-Step Verification is enabled

### "Connection timeout"
- Check your firewall settings
- Ensure port 587 is not blocked
- Try using port 465 with `secure: true`

### Emails not received
- Check spam folder
- Verify recipient email address
- Check Gmail account for any security alerts

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use App Passwords** - More secure than regular passwords
3. **Enable HTTPS** - Encrypt API communications
4. **Rate Limiting** - Implement rate limiting to prevent abuse
5. **Authentication** - Add API key authentication for production


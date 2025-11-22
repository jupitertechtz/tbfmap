# TBF Email API Service

Backend API service for sending invitation emails via **Resend** for the Tanzania Basketball Federation management system.

**Why Resend?**
- ✅ Works on all Railway plans (no SMTP restrictions)
- ✅ Better deliverability and analytics
- ✅ Simple HTTPS API (no port/connection issues)
- ✅ Free tier: 3,000 emails/month

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

This will install `resend` package for email delivery.

### 2. Get Resend API Key

1. Go to https://resend.com
2. Sign up for a free account
3. Go to https://resend.com/api-keys
4. Click **"Create API Key"**
5. Copy the API key (starts with `re_`)
   - ⚠️ **Important**: You can only see this once! Copy it immediately.

### 3. Set Environment Variables (Required)

**For Railway Deployment:**
In Railway dashboard → Your Service → Variables, add:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=Tanzania Basketball Federation <onboarding@resend.dev>
PORT=3001
NODE_ENV=production
```

**For Local Development:**
Create a `.env` file in the `api` directory:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=Tanzania Basketball Federation <onboarding@resend.dev>
PORT=3001
```

**Important Notes:**
- The API key starts with `re_`
- For production, verify your domain in Resend and use: `FROM_EMAIL=Tanzania Basketball Federation <noreply@yourdomain.com>`
- Never commit the `.env` file to version control

**For detailed instructions, see:** `RESEND_SETUP.md`

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `https://tbfmap-production.up.railway.app` by default.

### 4. Verify Domain (Optional but Recommended)

For production, verify your domain in Resend:

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Add DNS records provided by Resend
4. Update `FROM_EMAIL` to use your verified domain

### 5. Configure Frontend

In your frontend `.env.local` file, add:

```env
VITE_API_URL=https://tbfmap-production.up.railway.app
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
  "messageId": "resend-email-id"
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

## Resend Setup for Production

1. **Sign up for Resend**: https://resend.com
2. **Get API Key**: https://resend.com/api-keys
3. **Verify Domain** (recommended):
   - Go to https://resend.com/domains
   - Add your domain and DNS records
   - Update `FROM_EMAIL` to use verified domain
4. **Set Environment Variables** in Railway:
   - `RESEND_API_KEY=re_your_key`
   - `FROM_EMAIL=Your Name <noreply@yourdomain.com>`

## Troubleshooting

### "RESEND_API_KEY is not set"
- Verify the environment variable is set in Railway
- Check the variable name is exactly `RESEND_API_KEY`
- Redeploy after adding the variable

### "Invalid API key"
- Verify you copied the full API key (starts with `re_`)
- Check for any extra spaces
- Generate a new API key if needed

### "Domain not verified"
- If using a custom domain, ensure it's verified in Resend
- Use `onboarding@resend.dev` for testing
- Check DNS records are correct

### Emails going to spam
- Verify your domain in Resend
- Use a verified sender email
- Check Resend dashboard for delivery status: https://resend.com/emails

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use App Passwords** - More secure than regular passwords
3. **Enable HTTPS** - Encrypt API communications
4. **Rate Limiting** - Implement rate limiting to prevent abuse
5. **Authentication** - Add API key authentication for production


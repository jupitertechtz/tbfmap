# Railway + Resend Email Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up (free account)
3. Go to https://resend.com/api-keys
4. Click **"Create API Key"**
5. Copy the key (starts with `re_`)

### Step 2: Set Railway Environment Variables

In Railway Dashboard:

1. Go to your Railway project
2. Click on your service (e.g., `tbfmap-production`)
3. Go to **Variables** tab
4. Click **"New Variable"**
5. Add these variables:

```env
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=Tanzania Basketball Federation <onboarding@resend.dev>
```

**Important:**
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- For testing, use `onboarding@resend.dev`
- For production, verify your domain and use your domain email

### Step 3: Redeploy

Railway will automatically redeploy when you save environment variables. Or:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment

### Step 4: Verify

1. Check Railway logs - you should see:
   ```
   ✅ Resend API key configured (re_xxxxx...)
   Email service: Resend (configured)
   ```

2. Test email sending from your app's Email Configuration page

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_abc123...` |
| `FROM_EMAIL` | Sender email address | `Tanzania Basketball Federation <onboarding@resend.dev>` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |

## Production Setup (With Custom Domain)

### Step 1: Verify Domain in Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `tanzaniabasketball.com`
4. Add the DNS records provided by Resend:
   - TXT record for domain verification
   - MX record (if needed)
   - SPF record
   - DKIM record
5. Wait for verification (usually 5-10 minutes)

### Step 2: Update FROM_EMAIL

Once domain is verified, update Railway variable:

```env
FROM_EMAIL=Tanzania Basketball Federation <noreply@tanzaniabasketball.com>
```

## Testing

### Test via API

```bash
curl -X POST https://tbfmap-production.up.railway.app/send-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "fullName": "Test User",
    "email": "your-email@example.com",
    "password": "TestPassword123",
    "role": "staff",
    "loginUrl": "https://your-app.com/login"
  }'
```

### Test via App

1. Go to Email Configuration page
2. Enter recipient email
3. Click "Send Test Email"
4. Check your inbox

## Troubleshooting

### "RESEND_API_KEY is not set"

**Solution:**
1. Verify variable is set in Railway → Variables
2. Check spelling: `RESEND_API_KEY` (not `RESEND_API` or `RESEND_KEY`)
3. Redeploy after adding variable

### "Invalid API key"

**Solution:**
1. Verify you copied the full key (starts with `re_`)
2. Check for extra spaces
3. Generate a new key from Resend dashboard

### "Domain not verified"

**Solution:**
1. Use `onboarding@resend.dev` for testing
2. For production, verify domain in Resend
3. Check DNS records are correct

### Emails not sending

**Check:**
1. Railway logs for errors
2. Resend dashboard: https://resend.com/emails
3. Verify API key is correct
4. Check FROM_EMAIL format is correct

## Benefits of Resend

✅ **Works on all Railway plans** (no Pro plan needed)  
✅ **No SMTP connection issues** (uses HTTPS API)  
✅ **Better deliverability** (99%+ delivery rate)  
✅ **Built-in analytics** (track opens, clicks, bounces)  
✅ **Free tier**: 3,000 emails/month  
✅ **Simple setup** (just API key, no SMTP config)

## Monitoring

View sent emails in Resend dashboard:
- https://resend.com/emails

Track:
- Delivery status
- Opens and clicks
- Bounces and complaints
- Email logs

## Next Steps

1. ✅ Get Resend API key
2. ✅ Set in Railway environment variables
3. ✅ Test email sending
4. ⬜ Verify domain (for production)
5. ⬜ Update FROM_EMAIL to use verified domain
6. ⬜ Monitor email delivery in Resend dashboard


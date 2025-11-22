# Resend Email Service Setup

## Overview

The email service has been migrated from Gmail SMTP to **Resend**, a modern transactional email service that:
- ✅ Works on all Railway plans (including free)
- ✅ No SMTP connection issues
- ✅ Better deliverability and analytics
- ✅ Simple HTTPS API (no port restrictions)

## Step 1: Sign Up for Resend

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your API Key

1. Go to https://resend.com/api-keys
2. Click **"Create API Key"**
3. Give it a name (e.g., "TBF Production")
4. Copy the API key (starts with `re_`)
   - ⚠️ **Important**: You can only see this once! Copy it immediately.

## Step 3: Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `tanzaniabasketball.com`)
4. Add the DNS records provided by Resend
5. Wait for verification (usually a few minutes)

**Note**: For testing, you can use the default `onboarding@resend.dev` sender, but it's limited.

## Step 4: Set Railway Environment Variables

In your Railway dashboard:

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Add these environment variables:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=Tanzania Basketball Federation <onboarding@resend.dev>
```

**For production with verified domain:**
```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=Tanzania Basketball Federation <noreply@tanzaniabasketball.com>
```

## Step 5: Install Dependencies

The code has been updated to use Resend. You need to install it:

```bash
cd api
npm install resend
```

Or if deploying on Railway, Railway will automatically install it from `package.json`.

## Step 6: Redeploy

After setting environment variables:

1. Railway will automatically redeploy when you save variables
2. Or manually trigger a redeploy from Railway dashboard
3. Check Railway logs to verify Resend is configured

## Step 7: Test Email Sending

1. Go to Email Configuration page in your app
2. Click "Send Test Email"
3. Check your email inbox
4. Check Railway logs for confirmation

## Benefits of Resend

### vs Gmail SMTP:
- ✅ No SMTP port restrictions (works on all Railway plans)
- ✅ No connection timeout issues
- ✅ Better deliverability rates
- ✅ Built-in analytics and tracking
- ✅ Email templates support
- ✅ Webhook support for delivery status

### Free Tier:
- 3,000 emails/month
- 100 emails/day
- Perfect for most applications

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
- Check Resend dashboard for delivery status

## Migration Checklist

- [x] Code updated to use Resend
- [x] Package.json updated
- [ ] Resend account created
- [ ] API key obtained
- [ ] Railway environment variables set
- [ ] Dependencies installed (`npm install` in api folder)
- [ ] Service redeployed
- [ ] Test email sent successfully

## Next Steps

1. **Get Resend API key**: https://resend.com/api-keys
2. **Set in Railway**: Add `RESEND_API_KEY` to environment variables
3. **Redeploy**: Railway will auto-redeploy
4. **Test**: Send a test email from Email Configuration page

## Support

- Resend Documentation: https://resend.com/docs
- Resend Dashboard: https://resend.com/emails (view sent emails)
- Railway Logs: Check for any errors


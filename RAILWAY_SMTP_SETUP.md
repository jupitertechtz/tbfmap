# Railway SMTP Configuration Guide

## Important: Railway SMTP Restrictions

**Railway blocks outbound SMTP connections on Free, Trial, and Hobby plans.**

Outbound SMTP (ports 25, 465, 587) is **only available on Pro plan and above** to prevent spam and abuse.

## Option 1: Upgrade to Railway Pro Plan

If you need direct SMTP access:

1. **Upgrade your Railway account** to Pro plan ($20/month)
2. **Verify SMTP access** - After upgrading, SMTP ports should be automatically enabled
3. **Test connectivity** using the test script below

### Test SMTP Connectivity on Railway

Add this to your Railway service to test SMTP connectivity:

```bash
# Test script to check SMTP port reachability
SMTP_HOST="smtp.gmail.com" bash -c '
for port in 25 465 587 2525; do
  timeout 1 bash -c "</dev/tcp/$SMTP_HOST/$port" 2>/dev/null && \
    echo "$SMTP_HOST port $port reachable" || \
    echo "$SMTP_HOST port $port unreachable"
done
'
```

## Option 2: Use Transactional Email Service (Recommended)

Railway recommends using transactional email services with HTTPS APIs instead of SMTP. These services:
- ✅ Work on all Railway plans (including free)
- ✅ Provide better analytics and delivery tracking
- ✅ Have better deliverability rates
- ✅ Are more reliable than SMTP

### Recommended Services:

1. **Resend** (Recommended)
   - Free tier: 3,000 emails/month
   - Simple API
   - Great documentation
   - Railway template available

2. **SendGrid**
   - Free tier: 100 emails/day
   - Industry standard
   - Good analytics

3. **Mailgun**
   - Free tier: 5,000 emails/month (first 3 months)
   - Good for transactional emails

4. **Postmark**
   - Paid but excellent deliverability
   - Great for critical emails

## Option 3: Use Resend SMTP Gateway (Best of Both Worlds)

Railway provides a template to deploy a **Resend SMTP Gateway** that:
- Accepts SMTP messages (port 587)
- Relays them via Resend's HTTPS API
- Works on all Railway plans

**Deploy Resend SMTP Gateway:**
1. Go to: https://railway.com/deploy/resend-railway-smtp-gateway
2. Follow the setup instructions
3. Update your email service to use the gateway's SMTP endpoint

## Current Setup: Gmail SMTP

If you're on Railway Pro plan and want to continue using Gmail SMTP:

### Verify Your Plan

1. Go to Railway Dashboard
2. Check your plan in Settings → Billing
3. Ensure you're on **Pro plan** or higher

### Check Environment Variables

In Railway dashboard → Your Service → Variables, ensure:

```env
GMAIL_EMAIL=tanzaniabasketball@gmail.com
GMAIL_PASSWORD=your-16-character-app-password
PORT=3001
NODE_ENV=production
```

**Important:**
- Gmail App Password must be 16 characters with NO spaces
- Generate App Password: https://myaccount.google.com/apppasswords

### Test SMTP Connection

You can test if SMTP is working by checking Railway logs when sending an email. Look for:
- ✅ "Email sent successfully" - SMTP is working
- ❌ "Connection timeout" or "ETIMEDOUT" - SMTP is blocked or not configured

## Recommended: Migrate to Resend

For better reliability and to work on all Railway plans, consider migrating to Resend:

### Step 1: Sign up for Resend

1. Go to https://resend.com
2. Sign up for free account
3. Get your API key from dashboard

### Step 2: Update Railway Environment Variables

Add to Railway Variables:
```env
RESEND_API_KEY=re_your_api_key_here
```

### Step 3: Update Email Service Code

The code can be updated to use Resend's API instead of SMTP. This would:
- Work on all Railway plans
- Provide better delivery rates
- Include analytics and tracking

## Troubleshooting

### "Connection timeout" on Railway

**Possible causes:**
1. ❌ You're on Free/Trial/Hobby plan (SMTP blocked)
2. ❌ Gmail App Password incorrect or missing
3. ❌ Network issue (temporary)

**Solutions:**
- Upgrade to Pro plan, OR
- Migrate to Resend/SendGrid API

### "Invalid login" error

- Verify Gmail App Password is correct (16 chars, no spaces)
- Ensure 2-Step Verification is enabled
- Generate a new App Password if needed

### Emails not sending

- Check Railway logs for detailed errors
- Verify environment variables are set correctly
- Test with a simple email first

## Next Steps

1. **Check your Railway plan** - Are you on Pro or higher?
2. **If on Free/Trial/Hobby**: Migrate to Resend (recommended)
3. **If on Pro**: Verify Gmail credentials and test connectivity
4. **Consider Resend anyway**: Better features, analytics, and reliability


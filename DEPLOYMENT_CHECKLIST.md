# Quick Deployment Checklist

Use this checklist to deploy the TBF Registration System step by step.

## Pre-Deployment

- [ ] All code is committed to Git
- [ ] All database migrations are run in Supabase
- [ ] Local testing passes (frontend and backend work locally)
- [ ] Environment variables documented

## Step 1: Deploy Backend API

### Choose Platform: Railway / Render / Heroku

- [ ] Sign up for chosen platform
- [ ] Create new project/service
- [ ] Connect GitHub repository
- [ ] Set root directory to `api`
- [ ] Set start command to `npm start`
- [ ] Add environment variables:
  - [ ] `PORT=3001`
  - [ ] `NODE_ENV=production`
  - [ ] `SUPABASE_URL=...`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=...`
  - [ ] `GMAIL_EMAIL=...`
  - [ ] `GMAIL_PASSWORD=...`
- [ ] Deploy backend
- [ ] Copy backend URL (e.g., `https://your-api.railway.app`)
- [ ] Test backend health endpoint

## Step 2: Deploy Frontend

### Choose Platform: Vercel / Netlify

- [ ] Sign up for chosen platform
- [ ] Create new project
- [ ] Connect GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `build`
- [ ] Add environment variables:
  - [ ] `VITE_SUPABASE_URL=...`
  - [ ] `VITE_SUPABASE_ANON_KEY=...`
  - [ ] `VITE_API_URL=https://your-api.railway.app` (from Step 1)
- [ ] Deploy frontend
- [ ] Copy frontend URL

## Step 3: Configure File Storage

**⚠️ IMPORTANT**: Local file storage won't persist. Choose one:

- [ ] **Option A**: Set up Supabase Storage buckets
  - [ ] Create `team-documents` bucket
  - [ ] Create `player-photos` bucket
  - [ ] Create `league-documents` bucket
  - [ ] Create `official-documents` bucket
  - [ ] Update services to use Supabase Storage

- [ ] **Option B**: Use AWS S3 / Cloudinary
  - [ ] Set up cloud storage account
  - [ ] Update `upload-files.js` to use cloud storage

- [ ] **Option C**: Use persistent volume (Railway/Render)
  - [ ] Configure persistent storage
  - [ ] Keep current local storage setup

## Step 4: Post-Deployment Testing

- [ ] Frontend loads correctly
- [ ] Can login with existing account
- [ ] Can create new user (backend API works)
- [ ] Can upload team logo (file storage works)
- [ ] Can upload player photo (file storage works)
- [ ] Email invitations are sent (email service works)
- [ ] Database queries work (Supabase connection)
- [ ] All pages load without errors

## Step 5: Security & Optimization

- [ ] All environment variables are set (no hardcoded secrets)
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] CORS is configured correctly
- [ ] Supabase RLS policies are enabled
- [ ] Error tracking is set up (optional: Sentry)
- [ ] Analytics is configured (optional)

## Step 6: Custom Domain (Optional)

- [ ] Purchase domain
- [ ] Configure DNS for frontend
- [ ] Configure DNS for backend
- [ ] Update environment variables with new domains
- [ ] Test custom domain

## Step 7: Monitoring

- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure error alerts
- [ ] Set up log aggregation (optional)
- [ ] Document deployment process

## Troubleshooting

If something fails:

1. **Check logs** in deployment platform dashboard
2. **Verify environment variables** are set correctly
3. **Test locally** to isolate the issue
4. **Check CORS** if API calls fail
5. **Verify database** connection and migrations
6. **Check file storage** permissions and configuration

## Quick Reference

### Environment Variables Needed

**Frontend (.env or platform settings):**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=...
```

**Backend (platform settings):**
```
PORT=3001
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GMAIL_EMAIL=...
GMAIL_PASSWORD=...
```

### Important URLs

- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-api.railway.app`
- Supabase: `https://app.supabase.com`

### Test Endpoints

- Backend Health: `https://your-api.railway.app/health`
- Email Health: `https://your-api.railway.app/health-email`
- File Upload Health: `https://your-api.railway.app/health-upload`

---

**Ready to deploy?** Follow the detailed guide in `DEPLOYMENT_GUIDE.md` for step-by-step instructions.


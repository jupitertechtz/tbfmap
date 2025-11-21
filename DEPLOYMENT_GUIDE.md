# Deployment Guide - TBF Registration System

This guide covers deploying the Tanzania Basketball Federation registration system to production.

## Architecture Overview

The application consists of:
1. **Frontend**: React/Vite application
2. **Backend API**: Node.js/Express server (email, file uploads, user creation)
3. **Database**: Supabase (already cloud-hosted)
4. **File Storage**: Local file system (needs persistent storage in production)

---

## Deployment Options

### Recommended Setup

- **Frontend**: Vercel or Netlify (free tier available)
- **Backend API**: Railway, Render, or Heroku (free/paid tiers)
- **File Storage**: Use cloud storage (AWS S3, Cloudinary, or Supabase Storage) for production

---

## Part 1: Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `./` (root)
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Install Command**: `npm install`

4. **Set Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     VITE_API_URL=https://your-api-domain.com
     ```

5. **Deploy**: Click "Deploy"

### Option B: Deploy to Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Create `netlify.toml`** in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy via Netlify Dashboard**:
   - Go to https://app.netlify.com
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Connect your repository
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `build`

4. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add the same variables as Vercel

5. **Deploy**: Netlify will auto-deploy on git push

---

## Part 2: Backend API Deployment

### Option A: Deploy to Railway (Recommended)

1. **Sign up**: Go to https://railway.app

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**:
   - Railway will auto-detect Node.js
   - Set **Root Directory**: `api`
   - Set **Start Command**: `npm start`

4. **Set Environment Variables**:
   - Go to Variables tab
   - Add:
     ```
     PORT=3001
     SUPABASE_URL=your-supabase-url
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     GMAIL_EMAIL=your-email@gmail.com
     GMAIL_PASSWORD=your-app-password
     NODE_ENV=production
     ```

5. **Deploy**: Railway will auto-deploy

6. **Get API URL**: Railway provides a URL like `https://your-app.railway.app`

### Option B: Deploy to Render

1. **Sign up**: Go to https://render.com

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**:
   - **Name**: `tbf-api`
   - **Root Directory**: `api`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   - Same as Railway (see above)

5. **Deploy**: Render will auto-deploy

6. **Get API URL**: Render provides a URL like `https://your-app.onrender.com`

### Option C: Deploy to Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   cd api
   heroku create tbf-api
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set SUPABASE_URL=your-supabase-url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   heroku config:set GMAIL_EMAIL=your-email@gmail.com
   heroku config:set GMAIL_PASSWORD=your-app-password
   heroku config:set NODE_ENV=production
   ```

5. **Create `Procfile`** in `api/` directory:
   ```
   web: node server.js
   ```

6. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

---

## Part 3: File Storage Configuration

### ⚠️ Important: Local File Storage Limitation

The current setup uses local file storage (`api/uploads/`), which **will be lost** on server restarts in most cloud platforms. You need to migrate to cloud storage.

### Option A: Use Supabase Storage (Recommended)

1. **Create Storage Buckets** in Supabase:
   - Go to Supabase Dashboard → Storage
   - Create buckets:
     - `team-documents` (public)
     - `player-photos` (public)
     - `league-documents` (public)
     - `official-documents` (public)

2. **Update `teamService.js`** to use Supabase Storage instead of local API

3. **Update `playerService.js`** similarly

### Option B: Use AWS S3

1. **Create S3 Bucket** in AWS
2. **Install AWS SDK**:
   ```bash
   cd api
   npm install aws-sdk
   ```
3. **Update upload-files.js** to use S3 instead of local storage

### Option C: Use Cloudinary

1. **Sign up**: https://cloudinary.com
2. **Install Cloudinary**:
   ```bash
   cd api
   npm install cloudinary
   ```
3. **Update upload-files.js** to use Cloudinary

### Temporary Solution (For Testing)

If you need a quick deployment with local storage:
- Use **Railway** or **Render** with persistent volumes
- Or use a VPS (DigitalOcean, Linode) with persistent disk storage

---

## Part 4: Environment Variables Summary

### Frontend Environment Variables

Create in Vercel/Netlify dashboard:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-api-domain.com
```

### Backend Environment Variables

Create in Railway/Render/Heroku dashboard:

```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-gmail-app-password
```

---

## Part 5: Post-Deployment Checklist

### 1. Update Frontend API URL

After deploying backend, update frontend environment variable:
```
VITE_API_URL=https://your-deployed-api-url.com
```

### 2. Test API Endpoints

```bash
# Health check
curl https://your-api-url.com/health

# Email service
curl https://your-api-url.com/health-email

# File upload service
curl https://your-api-url.com/health-upload
```

### 3. Configure CORS

If you get CORS errors, update `api/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:4028'],
  credentials: true
}));
```

### 4. Test File Uploads

- Upload a team logo
- Upload a player photo
- Verify files are accessible via API URL

### 5. Test Email Service

- Create a new user
- Verify invitation email is sent

### 6. Database Migrations

Ensure all migrations are run in Supabase:
- Go to Supabase Dashboard → SQL Editor
- Run all migration files from `supabase/migrations/`

---

## Part 6: Custom Domain Setup

### Frontend (Vercel)

1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Backend (Railway)

1. Go to Project Settings → Domains
2. Add custom domain
3. Configure DNS records

---

## Part 7: Monitoring & Maintenance

### Recommended Tools

1. **Error Tracking**: Sentry (free tier)
2. **Analytics**: Google Analytics or Plausible
3. **Uptime Monitoring**: UptimeRobot (free)

### Logs

- **Vercel**: View logs in dashboard
- **Railway**: View logs in dashboard
- **Render**: View logs in dashboard

---

## Troubleshooting

### Frontend Issues

**Build Fails**:
- Check environment variables are set
- Verify `npm run build` works locally
- Check build logs in deployment platform

**API Calls Fail**:
- Verify `VITE_API_URL` is correct
- Check CORS configuration in backend
- Verify backend is running

### Backend Issues

**Server Won't Start**:
- Check environment variables
- Verify all dependencies are installed
- Check logs for errors

**File Uploads Fail**:
- Verify uploads directory exists
- Check file permissions
- Consider migrating to cloud storage

**Email Sending Fails**:
- Verify Gmail app password is correct
- Check Gmail account settings
- Verify SMTP settings

---

## Security Best Practices

1. ✅ **Never commit `.env` files** to version control
2. ✅ **Use environment variables** for all secrets
3. ✅ **Enable HTTPS** (automatic on Vercel/Netlify/Railway)
4. ✅ **Use Supabase RLS** policies for database security
5. ✅ **Keep service role key** in backend only
6. ✅ **Use strong passwords** for Gmail app passwords
7. ✅ **Regularly update dependencies**

---

## Cost Estimates

### Free Tier Options

- **Vercel**: Free (with limitations)
- **Netlify**: Free (with limitations)
- **Railway**: $5/month (after free trial)
- **Render**: Free (with limitations, sleeps after inactivity)
- **Heroku**: $7/month (no free tier anymore)

### Recommended Production Setup

- **Frontend**: Vercel Pro ($20/month) or Netlify Pro ($19/month)
- **Backend**: Railway ($5/month) or Render ($7/month)
- **Database**: Supabase (free tier available)
- **File Storage**: Supabase Storage (free tier) or AWS S3 ($0.023/GB)

**Total**: ~$25-30/month for small to medium traffic

---

## Quick Start Commands

### Local Testing Before Deployment

```bash
# Frontend
npm install
npm run build
npm run serve

# Backend
cd api
npm install
npm start
```

### Deployment Commands

```bash
# Build frontend
npm run build

# Test backend locally
cd api
npm start

# Deploy (platform-specific)
# Vercel: vercel
# Netlify: netlify deploy
# Railway: railway up
```

---

## Support

For issues or questions:
1. Check deployment platform documentation
2. Review error logs in platform dashboard
3. Verify environment variables are set correctly
4. Test locally first before deploying

---

## Next Steps

1. ✅ Deploy frontend to Vercel/Netlify
2. ✅ Deploy backend to Railway/Render
3. ✅ Configure environment variables
4. ✅ Migrate file storage to cloud (Supabase Storage recommended)
5. ✅ Test all functionality
6. ✅ Set up custom domain
7. ✅ Configure monitoring
8. ✅ Set up backups

Good luck with your deployment! 🚀


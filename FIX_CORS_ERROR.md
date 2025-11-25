# Fix: CORS Error - Access-Control-Allow-Origin Header Missing

## Problem
You're seeing this error in the browser console:
```
Access to fetch at 'https://twrxgvhtxxzwhutpkomh.supabase.co/rest/v1/teams?select=*' 
from origin 'https://tbfmap.tanzaniabasketball.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
Supabase blocks requests from origins that aren't explicitly allowed in the CORS configuration. Your production domain `https://tbfmap.tanzaniabasketball.com` needs to be added to the allowed origins list in your Supabase project settings.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project (the one with URL `twrxgvhtxxzwhutpkomh.supabase.co`)

### Step 2: Navigate to API Settings
1. In your project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. Scroll down to find the **CORS Configuration** section

### Step 3: Add Your Production Domain
1. In the **Additional Allowed Origins** field, you'll see a list of allowed origins
2. Add your production domain:
   ```
   https://tbfmap.tanzaniabasketball.com
   ```
3. If you also want to allow the www subdomain, add:
   ```
   https://www.tbfmap.tanzaniabasketball.com
   ```
4. Click **Save** to apply the changes

### Step 4: Verify Configuration
Your allowed origins should include:
- `http://localhost:5173` (for local development with Vite)
- `http://localhost:3000` (if you use this port)
- `https://tbfmap.tanzaniabasketball.com` (your production domain)

### Step 5: Test
1. Clear your browser cache or use an incognito window
2. Visit `https://tbfmap.tanzaniabasketball.com`
3. Try to load the teams or any other data
4. The CORS error should be resolved

## Alternative: Using Supabase CLI (If Available)

If you have Supabase CLI configured, you can also update CORS settings via the CLI, but the dashboard method above is recommended as it's more straightforward.

## Important Notes

1. **Wildcards**: Supabase doesn't support wildcard domains (`*.tanzaniabasketball.com`). You must add each specific domain.

2. **Protocol Matters**: Make sure to include the protocol (`https://` or `http://`). For production, always use `https://`.

3. **Subdomains**: If you have multiple subdomains, add each one separately:
   - `https://tbfmap.tanzaniabasketball.com`
   - `https://api.tanzaniabasketball.com` (if needed)
   - `https://www.tbfmap.tanzaniabasketball.com` (if you use www)

4. **Local Development**: Keep `http://localhost:5173` (or your local port) in the allowed origins for development.

5. **Changes Take Effect Immediately**: Once you save the CORS settings, the changes should take effect immediately. No restart or redeployment needed.

## Troubleshooting

### Still Getting CORS Errors?
1. **Check the exact origin**: Open browser DevTools → Network tab → Check the exact origin in the error message
2. **Verify HTTPS**: Make sure your production site is using HTTPS (not HTTP)
3. **Clear Cache**: Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check Supabase URL**: Verify that `VITE_SUPABASE_URL` in your production environment matches your Supabase project URL

### Common Mistakes
- Forgetting to include `https://` or `http://`
- Adding a trailing slash (don't add `/` at the end)
- Typo in the domain name
- Not saving the changes in Supabase dashboard

## Verification Checklist
- [ ] Added `https://tbfmap.tanzaniabasketball.com` to Supabase allowed origins
- [ ] Saved the changes in Supabase dashboard
- [ ] Cleared browser cache or used incognito mode
- [ ] Verified the site is using HTTPS
- [ ] Tested loading data from the production site

## Additional Resources
- [Supabase CORS Documentation](https://supabase.com/docs/guides/api/api-rest#cors)
- [Supabase API Settings](https://supabase.com/dashboard/project/_/settings/api)


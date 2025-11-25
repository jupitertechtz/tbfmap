# How to Access CORS Configuration in Supabase

## Step-by-Step Guide

### Step 1: Log in to Supabase
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in with your Supabase account credentials

### Step 2: Select Your Project
1. You'll see a list of your projects on the dashboard
2. Click on the project that matches your Supabase URL:
   - Your URL: `twrxgvhtxxzwhutpkomh.supabase.co`
   - Look for a project with a similar reference ID

### Step 3: Navigate to Settings
1. In the left sidebar, look for the **Settings** icon (⚙️ gear icon)
2. Click on **Settings**
3. This will open the Settings menu

### Step 4: Go to API Settings
1. In the Settings menu, you'll see several options:
   - General
   - API ← **Click this one**
   - Database
   - Auth
   - Storage
   - Edge Functions
   - etc.
2. Click on **API**

### Step 5: Find CORS Configuration
1. On the API settings page, scroll down
2. Look for a section titled:
   - **"CORS Configuration"** or
   - **"Additional Allowed Origins"** or
   - **"Allowed Origins"**
3. You'll see a text area or input field where you can add domains

### Step 6: Add Your Domain
1. In the CORS configuration field, you'll likely see:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
2. Add your production domain on a new line:
   ```
   https://tbfmap.tanzaniabasketball.com
   ```
3. Make sure each domain is on its own line

### Step 7: Save Changes
1. Scroll to the bottom of the page
2. Click the **Save** button (usually at the bottom right)
3. Wait for the confirmation message

## Visual Navigation Path

```
Supabase Dashboard
  └── Your Project (twrxgvhtxxzwhutpkomh)
      └── Settings (⚙️ icon in left sidebar)
          └── API (in settings menu)
              └── Scroll down to "CORS Configuration"
                  └── Add: https://tbfmap.tanzaniabasketball.com
                      └── Click "Save"
```

## Alternative: Direct URL Method

If you know your project reference ID, you can go directly to:
```
https://supabase.com/dashboard/project/[YOUR_PROJECT_REF]/settings/api
```

Replace `[YOUR_PROJECT_REF]` with your project reference (the part before `.supabase.co` in your URL).

## What You Should See

The CORS configuration section typically looks like this:

```
┌─────────────────────────────────────────┐
│ CORS Configuration                      │
├─────────────────────────────────────────┤
│ Additional Allowed Origins              │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:5173                │ │
│ │ http://localhost:3000                │ │
│ │ https://tbfmap.tanzaniabasketball.com│ │ ← Add this
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save] button                           │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Can't Find the Settings Icon?
- Look in the **left sidebar** (not the top navigation)
- The icon is usually near the bottom of the sidebar
- It might be collapsed - click the expand button (☰) if you see it

### Can't Find API in Settings?
- Make sure you're in the correct project
- The API option should be visible in the settings menu
- If you don't see it, you might not have the right permissions - contact your project admin

### Can't Find CORS Configuration?
- Scroll down on the API settings page
- It might be under a different name like:
  - "Allowed Origins"
  - "CORS Settings"
  - "Additional Origins"
- Look for any field that mentions "origin" or "CORS"

### Still Having Issues?
1. Check that you're logged in with the correct account
2. Verify you have admin/owner permissions on the project
3. Try refreshing the page
4. Check if there's a search bar in settings - search for "CORS"

## Quick Checklist

- [ ] Logged into Supabase Dashboard
- [ ] Selected the correct project
- [ ] Clicked Settings (⚙️) in left sidebar
- [ ] Clicked API in settings menu
- [ ] Scrolled to CORS Configuration section
- [ ] Added `https://tbfmap.tanzaniabasketball.com`
- [ ] Clicked Save button
- [ ] Received confirmation message

## After Saving

Once you've saved:
1. The changes take effect immediately
2. No restart or redeployment needed
3. Test by refreshing your production site
4. The CORS error should be gone

## Need More Help?

If you still can't find the CORS configuration:
- Check the Supabase documentation: [https://supabase.com/docs/guides/api/api-rest#cors](https://supabase.com/docs/guides/api/api-rest#cors)
- Contact Supabase support through their dashboard
- Verify your account has the necessary permissions


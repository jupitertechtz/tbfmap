# Fix RLS Policy Error for Player Photos Upload

## Error Message
```
new row violates row-level security policy
POST .../storage/v1/object/player-photos/... 400 (Bad Request)
```

## Quick Fix (Choose One)

### Option 1: Make Bucket Public (Fastest - 30 seconds)

1. Go to **Supabase Dashboard** → **Storage**
2. Click on **`player-photos`** bucket
3. Click **Settings** (gear icon)
4. Check **"Public bucket"** checkbox
5. Click **Save**

✅ **Done!** Try uploading again.

---

### Option 2: Add RLS Policies (Recommended for Production)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `QUICK_FIX_RLS_POLICIES.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success" message

✅ **Done!** Try uploading again.

---

## Verify the Fix

After applying either fix:

1. Go to **Storage** → **Policies** in Supabase Dashboard
2. Select **`player-photos`** bucket
3. You should see policies listed (if using Option 2)
4. Or the bucket should show as "Public" (if using Option 1)

---

## Still Getting Errors?

### Check 1: Is the bucket created?
- Go to **Storage** in Supabase Dashboard
- Verify `player-photos` bucket exists
- If not, create it (name must be exactly `player-photos`)

### Check 2: Are you logged in?
- Make sure you're authenticated in the app
- Check browser console for authentication errors

### Check 3: Check bucket settings
- Go to **Storage** → **`player-photos`** → **Settings**
- If using RLS: Policies should be listed
- If using Public: "Public bucket" should be checked

### Check 4: Try the SQL policies again
- Go to **SQL Editor**
- Run `QUICK_FIX_RLS_POLICIES.sql` again
- Make sure you see "Success" message

---

## What the Error Means

The error occurs because:
- Your `player-photos` bucket has RLS (Row-Level Security) enabled
- But no policies are configured to allow uploads
- Supabase blocks the upload to protect your data

**Solution**: Either make the bucket public OR add RLS policies that allow authenticated users to upload.

---

## Need More Help?

If you're still having issues:
1. Check the Supabase Dashboard → Storage → Policies for any error messages
2. Verify your user is authenticated (check browser console)
3. Try making the bucket public first (Option 1) to test if uploads work
4. Then switch to RLS policies (Option 2) for better security


# Supabase Storage Bucket Setup Guide

## Overview

You **do NOT need to manually create folders** in Supabase Storage. The folder structure is automatically created by the code when files are uploaded. You only need to create the **buckets** themselves.

## Step-by-Step Setup

### Step 1: Access Supabase Storage

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Storage** in the left sidebar

### Step 2: Create Buckets

Create these 4 buckets (one at a time):

#### Bucket 1: `team-documents`

1. Click **"New bucket"** button
2. **Bucket name**: `team-documents` (exactly as shown, case-sensitive)
3. **Public bucket**: ✅ Check this box (or configure RLS policies if you prefer)
4. Click **"Create bucket"**

**What gets stored here:**
- Team logos: `teams/{teamId}/logo/{filename}.png`
- Team documents: `teams/{teamId}/documents/{filename}.pdf`

#### Bucket 2: `player-photos`

1. Click **"New bucket"** button
2. **Bucket name**: `player-photos` (exactly as shown, case-sensitive)
3. **Public bucket**: ✅ Check this box
4. Click **"Create bucket"**

**What gets stored here:**
- Player photos: `players/{playerId}/photo/{filename}.jpg`
- Player documents: `players/{playerId}/documents/{filename}.pdf`

#### Bucket 3: `league-documents`

1. Click **"New bucket"** button
2. **Bucket name**: `league-documents` (exactly as shown, case-sensitive)
3. **Public bucket**: ✅ Check this box
4. Click **"Create bucket"**

**What gets stored here:**
- League documents: `leagues/{leagueId}/documents/{filename}.pdf`

#### Bucket 4: `official-documents`

1. Click **"New bucket"** button
2. **Bucket name**: `official-documents` (exactly as shown, case-sensitive)
3. **Public bucket**: ✅ Check this box
4. Click **"Create bucket"**

**What gets stored here:**
- Official photos: `officials/{officialId}/photo/{filename}.jpg`
- Official documents: `officials/{officialId}/documents/{filename}.pdf`

## Folder Structure (Automatic)

The folder structure is **automatically created** by the code when you upload files. You don't need to create any folders manually.

### Example Structure After Uploads:

```
team-documents/
├── teams/
│   ├── {teamId1}/
│   │   ├── logo/
│   │   │   └── 1763311511628-m77d17jz4-team-logo.png
│   │   └── documents/
│   │       ├── 1763311511628-abc123-registration.pdf
│   │       └── 1763311511628-def456-tax-clearance.pdf
│   └── {teamId2}/
│       ├── logo/
│       └── documents/

player-photos/
├── players/
│   ├── {playerId1}/
│   │   ├── photo/
│   │   │   └── 1763311511628-xyz789-player-photo.jpg
│   │   └── documents/
│   │       └── 1763311511628-ghi789-id-document.pdf
│   └── {playerId2}/
│       ├── photo/
│       └── documents/

league-documents/
├── leagues/
│   ├── {leagueId1}/
│   │   └── documents/
│   │       └── 1763311511628-jkl012-league-rules.pdf
│   └── {leagueId2}/
│       └── documents/

official-documents/
├── officials/
│   ├── {officialId1}/
│   │   ├── photo/
│   │   │   └── 1763311511628-mno345-official-photo.jpg
│   │   └── documents/
│   │       └── 1763311511628-pqr678-license.pdf
│   └── {officialId2}/
│       ├── photo/
│       └── documents/
```

## How It Works

1. **You create the buckets** (4 buckets total)
2. **Code automatically creates folders** when files are uploaded
3. **Files are organized** by entity ID and type automatically

### Example Upload Flow:

When a team manager uploads a logo:
1. Code generates path: `teams/{teamId}/logo/{timestamp}-{random}-{filename}.png`
2. Code uploads to `team-documents` bucket
3. Supabase automatically creates the folder structure
4. File is stored at the full path

## Bucket Configuration

### Public vs Private Buckets

**Option A: Public Buckets (Recommended for Quick Setup)**
- ✅ Check "Public bucket" when creating
- Files are accessible via public URLs
- No RLS policies needed
- **Use this if you want files accessible to everyone**

**Option B: Private Buckets with RLS (More Secure)**
- ❌ Don't check "Public bucket"
- Configure Row Level Security (RLS) policies
- Files require authentication to access
- **Use this for sensitive documents**

### RLS Policy Setup (REQUIRED if buckets are not public)

**IMPORTANT**: If your buckets are NOT public, you MUST configure RLS policies or you'll get "new row violates row-level security policy" errors.

#### Quick Setup (Recommended for Development)

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Copy and paste the policies from `SUPABASE_STORAGE_RLS_POLICIES.sql`
3. Run the SQL statements

#### Manual Setup

If you want to set up policies manually, use these for each bucket:

**For player-photos bucket:**
```sql
-- Allow authenticated users to upload player files
CREATE POLICY "Authenticated users can upload player files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'player-photos' AND
  (storage.foldername(name))[1] = 'players'
);

-- Allow authenticated users to read player files
CREATE POLICY "Authenticated users can read player files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'player-photos');
```

**For team-documents bucket:**
```sql
-- Allow authenticated users to upload team documents
CREATE POLICY "Authenticated users can upload team documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-documents' AND
  (storage.foldername(name))[1] = 'teams'
);

-- Allow authenticated users to read team documents
CREATE POLICY "Authenticated users can read team documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'team-documents');
```

**For league-documents bucket:**
```sql
-- Allow authenticated users to upload league documents
CREATE POLICY "Authenticated users can upload league documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'league-documents' AND
  (storage.foldername(name))[1] = 'leagues'
);

-- Allow authenticated users to read league documents
CREATE POLICY "Authenticated users can read league documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'league-documents');
```

**For official-documents bucket:**
```sql
-- Allow authenticated users to upload official documents
CREATE POLICY "Authenticated users can upload official documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'official-documents' AND
  (storage.foldername(name))[1] = 'officials'
);

-- Allow authenticated users to read official documents
CREATE POLICY "Authenticated users can read official documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'official-documents');
```

**See `SUPABASE_STORAGE_RLS_POLICIES.sql` for complete policy setup with role-based permissions.**

## Verification

After creating buckets, verify they exist:

1. Go to **Storage** in Supabase Dashboard
2. You should see 4 buckets:
   - ✅ `team-documents`
   - ✅ `player-photos`
   - ✅ `league-documents`
   - ✅ `official-documents`

## Testing

1. **Test Team Logo Upload**:
   - Go to Team Registration or Team Management
   - Upload a team logo
   - Check `team-documents` bucket → `teams/{teamId}/logo/` folder should appear

2. **Test Player Photo Upload**:
   - Go to Player Registration
   - Upload a player photo
   - Check `player-photos` bucket → `players/{playerId}/photo/` folder should appear

3. **Test League Document Upload**:
   - Go to League Setup
   - Upload a document
   - Check `league-documents` bucket → `leagues/{leagueId}/documents/` folder should appear

4. **Test Official Photo Upload**:
   - Go to Official Registration
   - Upload an official photo
   - Check `official-documents` bucket → `officials/{officialId}/photo/` folder should appear

## Troubleshooting

### "Bucket not found" Error

**Solution:**
- Verify bucket name matches exactly (case-sensitive)
- Check you're in the correct Supabase project
- Ensure bucket was created successfully

### "Permission denied" or "new row violates row-level security policy" Error

**Solution:**
- If using public buckets: Ensure "Public bucket" is checked when creating the bucket
- If using private buckets: **You MUST configure RLS policies** - see RLS Policy Setup section above
- Run the SQL policies from `SUPABASE_STORAGE_RLS_POLICIES.sql` in Supabase SQL Editor
- Check user authentication status - user must be logged in
- Verify policies are active in Storage > Policies section

### Files Not Appearing

**Solution:**
- Check browser console for errors
- Verify file size (max 5MB for photos, 10MB for documents)
- Verify file type is allowed
- Check Supabase Storage logs

### Folder Structure Not Created

**This shouldn't happen** - folders are created automatically. If files upload but folders don't appear:
- Refresh the Supabase Storage page
- Check if files are in the root of the bucket (shouldn't happen)
- Verify the upload code is using the correct path format

## Summary

✅ **What you need to do:**
1. Create 4 buckets in Supabase Storage
2. Make them public (or configure RLS)
3. That's it!

❌ **What you DON'T need to do:**
- Create folders manually
- Set up folder structure
- Configure paths

The code handles all folder creation automatically when files are uploaded!


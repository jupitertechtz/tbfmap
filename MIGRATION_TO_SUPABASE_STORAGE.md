# Migration to Supabase Storage - Complete

## ✅ Migration Status: COMPLETE

All file uploads have been successfully migrated from backend API to frontend Supabase Storage.

## What Changed

### Code Changes

1. **`src/services/teamService.js`**
   - ✅ `uploadFile()` - Now uploads directly to Supabase Storage bucket `team-documents`
   - ✅ `getFileUrl()` - Now returns Supabase Storage public URLs
   - ✅ `deleteFile()` - Now deletes from Supabase Storage

2. **`src/services/playerService.js`**
   - ✅ `uploadFile()` - Now uploads directly to Supabase Storage bucket `player-photos`
   - ✅ `getFileUrl()` and `getFileUrlHelper()` - Now return Supabase Storage public URLs
   - ✅ `deleteFile()` - Now deletes from Supabase Storage

3. **`src/services/leagueService.js`**
   - ✅ `uploadFile()` - Now uploads directly to Supabase Storage bucket `league-documents`
   - ✅ `getFileUrl()` - Now returns Supabase Storage public URLs

4. **`src/services/officialService.js`**
   - ✅ `uploadFile()` - Now uploads directly to Supabase Storage bucket `official-documents`
   - ✅ `getFileUrlHelper()` - Now returns Supabase Storage public URLs
   - ✅ `deleteFile()` - Now deletes from Supabase Storage

## Required Supabase Storage Buckets

You need to create the following buckets in Supabase Storage:

### 1. `team-documents`
- **Purpose**: Store team logos and documents
- **Structure**: `teams/{teamId}/logo/{filename}` or `teams/{teamId}/documents/{filename}`
- **Public**: Yes (or configure RLS policies)

### 2. `player-photos`
- **Purpose**: Store player photos and documents
- **Structure**: `players/{playerId}/photo/{filename}` or `players/{playerId}/documents/{filename}`
- **Public**: Yes (or configure RLS policies)

### 3. `league-documents`
- **Purpose**: Store league documents
- **Structure**: `leagues/{leagueId}/documents/{filename}`
- **Public**: Yes (or configure RLS policies)

### 4. `official-documents`
- **Purpose**: Store official photos and documents
- **Structure**: `officials/{officialId}/photo/{filename}` or `officials/{officialId}/documents/{filename}`
- **Public**: Yes (or configure RLS policies)

## How to Create Buckets

**Important:** You only need to create the buckets. The folder structure (`teams/{teamId}/logo/`, etc.) is automatically created by the code when files are uploaded.

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket** for each bucket
4. Enter the bucket name (e.g., `team-documents`)
5. **Make bucket public**: Check "Public bucket" (or configure RLS policies)
6. Click **Create bucket**

**See `SUPABASE_STORAGE_SETUP.md` for detailed step-by-step instructions.**

## File Validation

All uploads now include client-side validation:

- **Logos/Photos**: 
  - Types: JPEG, PNG, GIF, WebP
  - Max size: 5MB

- **Documents**:
  - Types: PDF, Images, Word documents
  - Max size: 10MB

## Benefits

✅ **No backend API needed** - Files upload directly from frontend  
✅ **Scalable** - Supabase Storage handles scaling automatically  
✅ **CDN** - Files are served via Supabase CDN for fast access  
✅ **Persistent** - Files persist across deployments  
✅ **Secure** - Can use RLS policies for access control  
✅ **Cost-effective** - Supabase free tier includes storage

## Backward Compatibility

The code maintains backward compatibility:
- Old URLs (including `localhost:3001`) are automatically normalized
- Existing file paths in the database will work with Supabase Storage URLs
- The `getFileUrl()` methods handle both old and new URL formats

## Next Steps

1. ✅ Code migration complete
2. ⬜ Create Supabase Storage buckets (see above)
3. ⬜ Test file uploads for each service
4. ⬜ (Optional) Migrate existing files from backend to Supabase Storage
5. ⬜ (Optional) Remove backend file upload API (`api/upload-files.js`) if no longer needed

## Testing

After creating the buckets, test file uploads:

1. **Team Logo Upload**: Go to team registration/management
2. **Player Photo Upload**: Go to player registration/management
3. **League Document Upload**: Go to league setup
4. **Official Photo Upload**: Go to official registration

All uploads should now work directly from the frontend without requiring the backend API.

## Troubleshooting

### "Bucket not found" error
- Verify the bucket exists in Supabase Storage
- Check the bucket name matches exactly (case-sensitive)
- Ensure the bucket is public or RLS policies are configured

### "Upload failed" error
- Check file size (max 5MB for photos, 10MB for documents)
- Verify file type is allowed
- Check browser console for detailed error messages

### Files not displaying
- Verify bucket is public or RLS policies allow read access
- Check that `getFileUrl()` is returning correct Supabase Storage URLs
- Verify file paths in database match Supabase Storage paths


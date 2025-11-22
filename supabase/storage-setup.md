# Supabase Storage Bucket Setup Guide

## Creating the Team Documents Storage Bucket

To enable file uploads for team logos and documents, you need to create a storage bucket in Supabase.

### Step 1: Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Enter the bucket name: `team-documents`
5. **Important**: Make sure **Public bucket** is **UNCHECKED** (we'll use RLS policies for security)
6. Click **Create bucket**

### Step 2: Configure RLS Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies to allow authenticated users to upload and read files.

#### Policy 1: Allow Authenticated Users to Upload Files

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload team documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-documents' AND
  (storage.foldername(name))[1] = 'teams'
);
```

#### Policy 2: Allow Authenticated Users to Read Files

```sql
-- Allow authenticated users to read files
CREATE POLICY "Authenticated users can read team documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'team-documents');
```

#### Policy 3: Allow Authenticated Users to Update Their Files

```sql
-- Allow authenticated users to update files they uploaded
CREATE POLICY "Users can update their own team documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-documents' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

#### Policy 4: Allow Authenticated Users to Delete Their Files

```sql
-- Allow authenticated users to delete files they uploaded
CREATE POLICY "Users can delete their own team documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-documents' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

### Step 3: Make Files Publicly Accessible (Optional)

If you want team logos and documents to be publicly accessible (for display on public pages), you can add a public read policy:

```sql
-- Allow public read access to team documents
CREATE POLICY "Public can read team documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'team-documents');
```

**Note**: Only enable this if you want files to be publicly accessible without authentication.

### Alternative: Simpler Policy (Less Secure)

If you want a simpler setup for development/testing, you can use this more permissive policy:

```sql
-- Allow all authenticated users to manage files in team-documents bucket
CREATE POLICY "Authenticated users can manage team documents"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'team-documents')
WITH CHECK (bucket_id = 'team-documents');
```

**Warning**: This policy is less secure as it allows any authenticated user to modify any file. Use only for development.

### Step 4: Verify the Setup

1. Go to **Storage** > **Policies** in your Supabase Dashboard
2. Select the `team-documents` bucket
3. Verify that your policies are active
4. Test uploading a file through the application

### Troubleshooting

#### Error: "Bucket not found"
- Make sure the bucket name is exactly `team-documents` (case-sensitive)
- Check that the bucket exists in your Supabase project

#### Error: "new row violates row-level security"
- Check that RLS policies are enabled for the bucket
- Verify that the policies allow the current user's role
- Make sure you're authenticated when uploading

#### Error: "400 Bad Request"
- Check bucket permissions
- Verify RLS policies are correctly configured
- Ensure the file path format is correct
- Check file size limits (default is usually 50MB per file)

#### Error: "413 Payload Too Large"
- Reduce file size (max 10MB for documents, 5MB for logos)
- Check Supabase storage limits

### File Path Structure

Files are organized in the following structure:
```
team-documents/
├── teams/
│   ├── {teamId}/
│   │   ├── logo/
│   │   │   └── {timestamp}-{random}-{filename}.png
│   │   └── documents/
│   │       ├── {timestamp}-{random}-{filename}.pdf
│   │       └── ...
```

### Security Best Practices

1. **Use RLS Policies**: Always use Row Level Security instead of making buckets public
2. **Limit Access**: Only allow authenticated users to upload files
3. **Validate File Types**: Check file extensions on the client and server side
4. **File Size Limits**: Enforce size limits (5MB for logos, 10MB for documents)
5. **Sanitize Filenames**: Remove special characters from filenames before upload


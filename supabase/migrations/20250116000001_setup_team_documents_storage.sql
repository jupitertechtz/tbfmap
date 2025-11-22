-- Migration: Setup team-documents storage bucket and policies
-- This migration sets up the storage bucket for team logos and documents
-- 
-- IMPORTANT: Storage buckets cannot be created via SQL migrations.
-- You must create the bucket manually in the Supabase Dashboard:
-- 1. Go to Storage > New bucket
-- 2. Name: team-documents
-- 3. Public: Unchecked (we use RLS policies)
-- 4. Click Create bucket
--
-- After creating the bucket, run this migration to set up the RLS policies.

-- Enable RLS on storage.objects if not already enabled
-- Note: RLS is typically enabled by default on storage.objects

-- Policy 1: Allow authenticated users to upload files to team-documents bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload team documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-documents' AND
  (storage.foldername(name))[1] = 'teams'
);

-- Policy 2: Allow authenticated users to read files from team-documents bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can read team documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'team-documents');

-- Policy 3: Allow authenticated users to update files they uploaded
-- This allows team managers to update their team's files
CREATE POLICY IF NOT EXISTS "Users can update team documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-documents' AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Allow if user is the team manager for this team
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id::text = (storage.foldername(name))[2]
      AND team_manager_id = auth.uid()
    )
  )
);

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY IF NOT EXISTS "Users can delete team documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-documents' AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Allow if user is the team manager for this team
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id::text = (storage.foldername(name))[2]
      AND team_manager_id = auth.uid()
    )
  )
);

-- Policy 5: Allow public read access (for displaying logos on public pages)
-- This allows team logos to be displayed on public team profile pages
CREATE POLICY IF NOT EXISTS "Public can read team documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'team-documents');

-- Add comments for documentation
COMMENT ON POLICY "Authenticated users can upload team documents" ON storage.objects IS 
  'Allows authenticated users to upload files to the teams folder in team-documents bucket';

COMMENT ON POLICY "Authenticated users can read team documents" ON storage.objects IS 
  'Allows authenticated users to read files from team-documents bucket';

COMMENT ON POLICY "Users can update team documents" ON storage.objects IS 
  'Allows admins and team managers to update files for their teams';

COMMENT ON POLICY "Users can delete team documents" ON storage.objects IS 
  'Allows admins and team managers to delete files for their teams';

COMMENT ON POLICY "Public can read team documents" ON storage.objects IS 
  'Allows public access to read files (for displaying logos on public pages)';


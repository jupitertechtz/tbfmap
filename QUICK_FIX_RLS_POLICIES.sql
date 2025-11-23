-- ============================================================================
-- QUICK FIX: RLS Policies for Player Photos Upload
-- ============================================================================
-- Run this SQL in Supabase SQL Editor to fix the upload error immediately
-- ============================================================================

-- First, drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Authenticated users can upload player files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read player files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update player files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete player files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read player photos" ON storage.objects;

-- Simple policy: Allow all authenticated users to upload to player-photos bucket
CREATE POLICY "Authenticated users can upload player files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'player-photos');

-- Simple policy: Allow all authenticated users to read from player-photos bucket
CREATE POLICY "Authenticated users can read player files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'player-photos');

-- Simple policy: Allow all authenticated users to update files in player-photos bucket
CREATE POLICY "Users can update player files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'player-photos')
WITH CHECK (bucket_id = 'player-photos');

-- Simple policy: Allow all authenticated users to delete files in player-photos bucket
CREATE POLICY "Users can delete player files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'player-photos');

-- Allow public read access (for displaying photos)
CREATE POLICY "Public can read player photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'player-photos');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, verify:
-- 1. Go to Storage > Policies in Supabase Dashboard
-- 2. Select 'player-photos' bucket
-- 3. You should see 5 policies listed
-- 4. Try uploading a player photo again
-- ============================================================================


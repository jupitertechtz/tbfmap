-- ============================================================================
-- Supabase Storage RLS Policies Setup
-- ============================================================================
-- This file contains all the Row-Level Security (RLS) policies needed
-- for the 4 storage buckets used in the application.
--
-- IMPORTANT: Storage buckets must be created manually in Supabase Dashboard
-- before running these policies. The buckets are:
-- 1. team-documents
-- 2. player-photos
-- 3. league-documents
-- 4. official-documents
--
-- To apply these policies:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste the policies for each bucket
-- 3. Run the SQL statements
-- ============================================================================

-- ============================================================================
-- PLAYER-PHOTOS BUCKET POLICIES
-- ============================================================================

-- Policy 1: Allow authenticated users to upload player photos/documents
CREATE POLICY IF NOT EXISTS "Authenticated users can upload player files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'player-photos' AND
  (storage.foldername(name))[1] = 'players'
);

-- Policy 2: Allow authenticated users to read player photos/documents
CREATE POLICY IF NOT EXISTS "Authenticated users can read player files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'player-photos');

-- Policy 3: Allow authenticated users to update player files
-- Admins can update any player's files, team managers can update their team's players
CREATE POLICY IF NOT EXISTS "Users can update player files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'player-photos' AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Allow if user is team manager for the player's team
    EXISTS (
      SELECT 1 FROM public.players p
      INNER JOIN public.teams t ON p.team_id = t.id
      WHERE p.id::text = (storage.foldername(name))[2]
      AND t.team_manager_id = auth.uid()
    )
    OR
    -- Allow if user is the player themselves
    EXISTS (
      SELECT 1 FROM public.players
      WHERE id::text = (storage.foldername(name))[2]
      AND user_profile_id = auth.uid()
    )
  )
);

-- Policy 4: Allow authenticated users to delete player files
CREATE POLICY IF NOT EXISTS "Users can delete player files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'player-photos' AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Allow if user is team manager for the player's team
    EXISTS (
      SELECT 1 FROM public.players p
      INNER JOIN public.teams t ON p.team_id = t.id
      WHERE p.id::text = (storage.foldername(name))[2]
      AND t.team_manager_id = auth.uid()
    )
    OR
    -- Allow if user is the player themselves
    EXISTS (
      SELECT 1 FROM public.players
      WHERE id::text = (storage.foldername(name))[2]
      AND user_profile_id = auth.uid()
    )
  )
);

-- Policy 5: Allow public read access (for displaying photos on public pages)
CREATE POLICY IF NOT EXISTS "Public can read player photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'player-photos');

-- ============================================================================
-- TEAM-DOCUMENTS BUCKET POLICIES
-- ============================================================================

-- Policy 1: Allow authenticated users to upload team documents
CREATE POLICY IF NOT EXISTS "Authenticated users can upload team documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-documents' AND
  (storage.foldername(name))[1] = 'teams'
);

-- Policy 2: Allow authenticated users to read team documents
CREATE POLICY IF NOT EXISTS "Authenticated users can read team documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'team-documents');

-- Policy 3: Allow authenticated users to update team documents
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

-- Policy 4: Allow authenticated users to delete team documents
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
CREATE POLICY IF NOT EXISTS "Public can read team documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'team-documents');

-- ============================================================================
-- LEAGUE-DOCUMENTS BUCKET POLICIES
-- ============================================================================

-- Policy 1: Allow authenticated users to upload league documents
CREATE POLICY IF NOT EXISTS "Authenticated users can upload league documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'league-documents' AND
  (storage.foldername(name))[1] = 'leagues'
);

-- Policy 2: Allow authenticated users to read league documents
CREATE POLICY IF NOT EXISTS "Authenticated users can read league documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'league-documents');

-- Policy 3: Allow admins and staff to update league documents
CREATE POLICY IF NOT EXISTS "Admins and staff can update league documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'league-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Policy 4: Allow admins and staff to delete league documents
CREATE POLICY IF NOT EXISTS "Admins and staff can delete league documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'league-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Policy 5: Allow public read access (for displaying documents on public pages)
CREATE POLICY IF NOT EXISTS "Public can read league documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'league-documents');

-- ============================================================================
-- OFFICIAL-DOCUMENTS BUCKET POLICIES
-- ============================================================================

-- Policy 1: Allow authenticated users to upload official documents
CREATE POLICY IF NOT EXISTS "Authenticated users can upload official documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'official-documents' AND
  (storage.foldername(name))[1] = 'officials'
);

-- Policy 2: Allow authenticated users to read official documents
CREATE POLICY IF NOT EXISTS "Authenticated users can read official documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'official-documents');

-- Policy 3: Allow users to update their own official documents
CREATE POLICY IF NOT EXISTS "Users can update their own official documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'official-documents' AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Allow if user is the official themselves
    EXISTS (
      SELECT 1 FROM public.officials
      WHERE id::text = (storage.foldername(name))[2]
      AND user_profile_id = auth.uid()
    )
  )
);

-- Policy 4: Allow users to delete their own official documents
CREATE POLICY IF NOT EXISTS "Users can delete their own official documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'official-documents' AND
  (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Allow if user is the official themselves
    EXISTS (
      SELECT 1 FROM public.officials
      WHERE id::text = (storage.foldername(name))[2]
      AND user_profile_id = auth.uid()
    )
  )
);

-- Policy 5: Allow public read access (for displaying photos on public pages)
CREATE POLICY IF NOT EXISTS "Public can read official documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'official-documents');

-- ============================================================================
-- QUICK SETUP (Simplified Policies for Development)
-- ============================================================================
-- If you want simpler policies for development/testing, you can use these
-- instead of the detailed policies above. These are less secure but easier
-- to set up.
-- ============================================================================

-- Uncomment these if you want simpler policies:

/*
-- Simple policy for player-photos bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can manage player files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'player-photos')
WITH CHECK (bucket_id = 'player-photos');

-- Simple policy for team-documents bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can manage team documents"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'team-documents')
WITH CHECK (bucket_id = 'team-documents');

-- Simple policy for league-documents bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can manage league documents"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'league-documents')
WITH CHECK (bucket_id = 'league-documents');

-- Simple policy for official-documents bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can manage official documents"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'official-documents')
WITH CHECK (bucket_id = 'official-documents');
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running these policies, verify they're active:
-- 1. Go to Supabase Dashboard > Storage > Policies
-- 2. Select each bucket and verify the policies are listed
-- 3. Test file uploads through the application
-- ============================================================================


-- Migration: Enable public access to player information (names and photos)
-- This allows portal visitors to see player names and photos on the statistics page
--
-- Note: RLS policies control row-level access, not column-level access.
-- The application service layer (playerService) controls which columns are selected.
-- This policy allows public read access to user_profiles for active players only.

-- Add public read policy for user_profiles
-- Restricts access to profiles associated with active players only
CREATE POLICY "public_can_read_player_user_profiles"
ON public.user_profiles
FOR SELECT
TO public
USING (
    -- Only allow reading profiles that are associated with active players
    EXISTS (
        SELECT 1 FROM public.players p
        WHERE p.user_profile_id = user_profiles.id
        AND p.player_status = 'active'
    )
);

-- Add public read policy for player_documents
-- Only allow reading player photos (not other sensitive documents)
CREATE POLICY "public_can_read_player_photos"
ON public.player_documents
FOR SELECT
TO public
USING (
    -- Only allow reading player photos for active players
    document_type = 'player_photo'
    AND EXISTS (
        SELECT 1 FROM public.players p
        WHERE p.id = player_documents.player_id
        AND p.player_status = 'active'
    )
);


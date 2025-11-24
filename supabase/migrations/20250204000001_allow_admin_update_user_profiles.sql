-- Migration: Allow admins to update user_profiles
-- This enables admins to update player information (name, email, phone) when editing player profiles
--
-- The existing policy "admin_view_all_user_profiles" only allows SELECT.
-- This policy adds UPDATE capability for admins.

-- Add admin update policy for user_profiles
CREATE POLICY "admin_update_user_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Also allow team managers to update user_profiles for players in their teams
-- This enables team managers to update player information for players on their team
CREATE POLICY "team_managers_update_team_player_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.players p
        JOIN public.teams t ON t.id = p.team_id
        WHERE p.user_profile_id = user_profiles.id
        AND t.team_manager_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.players p
        JOIN public.teams t ON t.id = p.team_id
        WHERE p.user_profile_id = user_profiles.id
        AND t.team_manager_id = auth.uid()
    )
);


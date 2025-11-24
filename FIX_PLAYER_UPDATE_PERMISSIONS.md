# Fix: Unable to Update Player Information (Name, Email, Phone)

## Problem
When trying to update a player's name, email, or phone number through the player edit form, the update fails silently or with a permission error. This is because Row Level Security (RLS) policies in Supabase don't allow admins or team managers to update other users' profiles.

## Root Cause
The existing RLS policies on the `user_profiles` table only allow:
- Users to update their own profile (`users_manage_own_user_profiles`)
- Admins to **view** all profiles (`admin_view_all_user_profiles` - SELECT only)

There is no policy allowing admins or team managers to **update** other users' profiles.

## Solution
A new migration file has been created: `supabase/migrations/20250204000001_allow_admin_update_user_profiles.sql`

This migration adds two new RLS policies:
1. **`admin_update_user_profiles`** - Allows admins to update any user profile
2. **`team_managers_update_team_player_profiles`** - Allows team managers to update profiles of players on their team

## How to Apply the Fix

### Option 1: Apply via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/20250204000001_allow_admin_update_user_profiles.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Apply via Supabase CLI
If you have Supabase CLI set up:
```bash
supabase db push
```

This will apply all pending migrations including the new one.

### Option 3: Manual SQL Execution
Run the following SQL in your Supabase SQL Editor:

```sql
-- Add admin update policy for user_profiles
CREATE POLICY "admin_update_user_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Also allow team managers to update user_profiles for players in their teams
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
```

## Verification
After applying the migration:
1. Try updating a player's name, email, or phone through the player edit form
2. The update should now succeed
3. Check the browser console for any error messages (improved error handling has been added)

## Additional Improvements
The `playerService.update()` function has also been improved to:
- Provide better error messages if permission is denied
- Verify that updates were successful
- Log errors for debugging

## Notes
- The migration is idempotent - if the policies already exist, it will show an error but won't break anything
- If you see "policy already exists" errors, you can safely ignore them
- Team managers can only update profiles of players who are on teams they manage
- Admins can update any user profile


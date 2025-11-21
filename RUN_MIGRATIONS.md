# How to Run Database Migrations

## Quick Fix for Missing `file_path` Column

The error "Could not find the 'file_path' column" means the migration hasn't been applied to your database yet.

### Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New query**
4. Copy and paste the contents of: 
   - `supabase/migrations/20250116000000_add_file_path_to_team_documents.sql`
   - `supabase/migrations/20250118000002_add_file_path_to_player_documents.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Verify the migration succeeded

### Option 2: Run via Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to project root
cd C:\tbfmap

# Run the migration
supabase db push
```

Or run a specific migration:

```bash
supabase migration up
```

### Option 3: Manual SQL Execution

1. Open Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Add file_path column to team_documents table
ALTER TABLE public.team_documents 
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Add index on file_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_documents_file_path ON public.team_documents(file_path);

-- Add comment for documentation
COMMENT ON COLUMN public.team_documents.file_path IS 'Storage bucket path (e.g., teams/{teamId}/documents/filename.pdf)';
COMMENT ON COLUMN public.team_documents.file_url IS 'Public URL for accessing the file';

-- Add file_path column to player_documents table
ALTER TABLE public.player_documents 
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Add index on file_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_player_documents_file_path ON public.player_documents(file_path);

-- Add comment for documentation
COMMENT ON COLUMN public.player_documents.file_path IS 'Storage path (e.g., players/{playerId}/documents/filename.pdf)';
COMMENT ON COLUMN public.player_documents.file_url IS 'Public URL for accessing the file';
```

## Verify Migration

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase Dashboard
2. Select `team_documents` table
3. Check that the `file_path` column exists

## Required Migrations

Make sure these migrations have been run:

1. ✅ `20241112163131_tbf_basketball_complete_system.sql` - Base schema
2. ✅ `20250115000000_add_team_registration_fields.sql` - Team fields
3. ⚠️ `20250116000000_add_file_path_to_team_documents.sql` - **File path column (REQUIRED)**
4. ⚠️ `20250116000001_setup_team_documents_storage.sql` - Storage policies (after creating bucket)
5. ⚠️ `20250118000002_add_file_path_to_player_documents.sql` - **Player documents file path (REQUIRED)**

## Troubleshooting

### "Column already exists"
- This is fine! The migration uses `IF NOT EXISTS`, so it's safe to run multiple times.

### "Permission denied"
- Make sure you're logged in as a user with admin privileges in Supabase
- Or use the service role key for migrations

### "Table does not exist"
- Run the base schema migration first: `20241112163131_tbf_basketball_complete_system.sql`


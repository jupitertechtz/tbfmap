# Run League Documents Migration

The `league_documents` table needs to be created in your Supabase database to enable file uploads for league supporting documents.

## Quick Steps

1. **Open Supabase Dashboard**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy and paste the SQL from `supabase/migrations/20250119000003_create_league_documents.sql`
   - Or copy the SQL below:

```sql
-- Migration: Create league_documents table for storing supporting files
-- This enables uploading league rules, regulations, and other documents

CREATE TABLE IF NOT EXISTS public.league_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL DEFAULT 'supporting',
    file_name TEXT,
    file_size BIGINT,
    file_url TEXT,
    file_path TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_league_documents_league_id
    ON public.league_documents (league_id);

CREATE INDEX IF NOT EXISTS idx_league_documents_document_type
    ON public.league_documents (document_type);

COMMENT ON TABLE public.league_documents IS 'Stores supporting documents for leagues (rules, regulations, approvals, etc)';
COMMENT ON COLUMN public.league_documents.file_path IS 'Local storage path (e.g., leagues/{leagueId}/documents/file.pdf)';
COMMENT ON COLUMN public.league_documents.file_url IS 'Public URL for accessing the file';
COMMENT ON COLUMN public.league_documents.document_type IS 'Document category (rules, regulations, permit, etc)';
```

4. **Execute the Query**
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Wait for the success message

5. **Verify the Table**
   - Go to "Table Editor" in the left sidebar
   - You should see `league_documents` in the list of tables

## What This Migration Does

- Creates the `league_documents` table to store league supporting files
- Sets up foreign key relationship with `leagues` table
- Creates indexes for better query performance
- Adds helpful comments for documentation

## After Running the Migration

Once the migration is complete, you can:
- Upload league rules and regulations documents
- View existing documents when editing a league
- Manage league supporting documentation

The application will automatically use this table once it's created.


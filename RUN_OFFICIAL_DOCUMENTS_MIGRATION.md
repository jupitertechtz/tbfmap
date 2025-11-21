# Run Official Documents Migration

The `official_documents` table needs to be created in your Supabase database to enable file uploads for official photos and documents (passports, IDs, etc.).

## Quick Steps

1. **Open Supabase Dashboard**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy and paste the SQL from `supabase/migrations/20250202000001_create_official_documents.sql`
   - Or copy the SQL below:

```sql
-- Migration: Create official_documents table for storing official photos and documents
-- This enables uploading official photos, passports, IDs, and other supporting documents

CREATE TABLE IF NOT EXISTS public.official_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    official_id UUID NOT NULL REFERENCES public.officials(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL DEFAULT 'other',
    file_name TEXT,
    file_size BIGINT,
    file_url TEXT,
    file_path TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_official_documents_official_id
    ON public.official_documents (official_id);

CREATE INDEX IF NOT EXISTS idx_official_documents_document_type
    ON public.official_documents (document_type);

CREATE INDEX IF NOT EXISTS idx_official_documents_file_path
    ON public.official_documents (file_path);

-- Documentation comments
COMMENT ON TABLE public.official_documents IS 'Stores documents for officials (photos, passports, IDs, certificates, etc)';
COMMENT ON COLUMN public.official_documents.file_path IS 'Local storage path (e.g., officials/{officialId}/photo/{filename} or officials/{officialId}/documents/{filename})';
COMMENT ON COLUMN public.official_documents.file_url IS 'Public URL for accessing the file';
COMMENT ON COLUMN public.official_documents.document_type IS 'Document category (official_photo, passport, id_document, certificate, etc)';
```

4. **Execute the Query**
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - You should see a success message

5. **Verify the Table**
   - Go to "Table Editor" in the left sidebar
   - You should see `official_documents` in the list of tables
   - Click on it to view the structure

## What This Migration Does

- Creates the `official_documents` table to store:
  - Official photos (`document_type: 'official_photo'`)
  - Passport/ID documents (`document_type: 'passport'`)
  - Other supporting documents
- Adds indexes for faster queries
- Sets up foreign key relationships with `officials` and `user_profiles` tables
- Enables tracking of who uploaded each document and when

## After Running the Migration

Once the migration is complete, the official registration form will be able to:
- Upload and save official photos to the database
- Upload and save passport/ID documents to the database
- Track document metadata (file name, size, path, URL)
- Link documents to specific officials

## Troubleshooting

If you encounter any errors:
1. Make sure you're running the SQL in the Supabase SQL Editor
2. Check that the `officials` table exists
3. Verify that you have the necessary permissions
4. Check the error message for specific issues


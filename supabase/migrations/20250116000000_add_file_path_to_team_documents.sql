-- Migration: Add file_path column to team_documents table
-- This allows storing the storage path separately from the URL for better organization

-- Add file_path column to store the storage bucket path
ALTER TABLE public.team_documents 
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Update existing records to extract path from URL if possible
-- This is a one-time migration for existing data
UPDATE public.team_documents 
SET file_path = SUBSTRING(file_url FROM 'files/(.*)')
WHERE file_path IS NULL AND file_url IS NOT NULL;

-- Add index on file_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_documents_file_path ON public.team_documents(file_path);

-- Add comment for documentation
COMMENT ON COLUMN public.team_documents.file_path IS 'Storage bucket path (e.g., teams/{teamId}/documents/filename.pdf)';
COMMENT ON COLUMN public.team_documents.file_url IS 'Public URL for accessing the file';


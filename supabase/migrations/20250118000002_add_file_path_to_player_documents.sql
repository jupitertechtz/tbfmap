-- Migration: Add file_path column to player_documents table
-- This aligns player document storage with the local file storage system

-- Add file_path column if it doesn't exist
ALTER TABLE public.player_documents
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Populate file_path for existing records by extracting from file_url (if possible)
UPDATE public.player_documents
SET file_path = SUBSTRING(file_url FROM 'files/(.*)')
WHERE file_path IS NULL
  AND file_url IS NOT NULL;

-- Add index to speed up lookups by file_path
CREATE INDEX IF NOT EXISTS idx_player_documents_file_path
  ON public.player_documents(file_path);

-- Documentation comments
COMMENT ON COLUMN public.player_documents.file_path IS 'Storage path (e.g., players/{playerId}/documents/filename.pdf)';
COMMENT ON COLUMN public.player_documents.file_url IS 'Public URL for accessing the file';


-- Migration: Add supporting document fields to leagues table
-- This supports uploading structured files (rules, regulations, etc.)

ALTER TABLE public.leagues
  ADD COLUMN IF NOT EXISTS supporting_document_path TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document_url TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document_name TEXT;

COMMENT ON COLUMN public.leagues.supporting_document_path IS 'Relative file path for supporting league documents (e.g., leagues/{leagueId}/documents/{filename})';
COMMENT ON COLUMN public.leagues.supporting_document_url IS 'Public URL for supporting league documents';
COMMENT ON COLUMN public.leagues.supporting_document_name IS 'Original file name for supporting league documents';


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


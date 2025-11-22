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


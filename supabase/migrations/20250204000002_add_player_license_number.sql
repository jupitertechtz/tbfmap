-- Migration: Add player license number to players table
-- Ensures every registered player has a unique TBF-issued license number

ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS license_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_license_number
  ON public.players(license_number)
  WHERE license_number IS NOT NULL;

COMMENT ON COLUMN public.players.license_number IS 'Auto-generated TBF license number for each player';

WITH missing_licenses AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM public.players
  WHERE license_number IS NULL OR license_number = ''
)
UPDATE public.players AS p
SET license_number = CONCAT(
    'TBF-',
    TO_CHAR(CURRENT_DATE, 'YYYY'),
    LPAD(rn::text, 6, '0')
  )
FROM missing_licenses ml
WHERE p.id = ml.id;


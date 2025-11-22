-- Migration: Add team registration form fields to teams table
-- This migration adds all fields from the team registration form to match the complete registration data

-- Add basic team info fields
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS division TEXT,
  ADD COLUMN IF NOT EXISTS venue_address TEXT;

-- Add contact details fields
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;

-- Add organizational structure fields
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS president_name TEXT,
  ADD COLUMN IF NOT EXISTS president_phone TEXT,
  ADD COLUMN IF NOT EXISTS president_email TEXT,
  ADD COLUMN IF NOT EXISTS president_id TEXT,
  ADD COLUMN IF NOT EXISTS secretary_name TEXT,
  ADD COLUMN IF NOT EXISTS secretary_phone TEXT,
  ADD COLUMN IF NOT EXISTS secretary_email TEXT,
  ADD COLUMN IF NOT EXISTS secretary_id TEXT,
  ADD COLUMN IF NOT EXISTS coach_name TEXT,
  ADD COLUMN IF NOT EXISTS coach_phone TEXT,
  ADD COLUMN IF NOT EXISTS coach_email TEXT,
  ADD COLUMN IF NOT EXISTS coach_license TEXT;

-- Add visual identity fields
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- Add banking information fields
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS account_type TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS branch_code TEXT,
  ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- Update contact_phone to be primary_phone for consistency (keeping contact_phone for backward compatibility)
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS primary_phone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.teams.category IS 'Team category (e.g., Men, Women, Youth)';
COMMENT ON COLUMN public.teams.division IS 'Team division/league level';
COMMENT ON COLUMN public.teams.venue_address IS 'Full address of the home venue';
COMMENT ON COLUMN public.teams.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN public.teams.secondary_phone IS 'Secondary contact phone number';
COMMENT ON COLUMN public.teams.website IS 'Team website URL';
COMMENT ON COLUMN public.teams.president_name IS 'Name of team president';
COMMENT ON COLUMN public.teams.president_phone IS 'Phone number of team president';
COMMENT ON COLUMN public.teams.president_email IS 'Email of team president';
COMMENT ON COLUMN public.teams.president_id IS 'ID number of team president';
COMMENT ON COLUMN public.teams.secretary_name IS 'Name of team secretary';
COMMENT ON COLUMN public.teams.secretary_phone IS 'Phone number of team secretary';
COMMENT ON COLUMN public.teams.secretary_email IS 'Email of team secretary';
COMMENT ON COLUMN public.teams.secretary_id IS 'ID number of team secretary';
COMMENT ON COLUMN public.teams.coach_name IS 'Name of head coach';
COMMENT ON COLUMN public.teams.coach_phone IS 'Phone number of head coach';
COMMENT ON COLUMN public.teams.coach_email IS 'Email of head coach';
COMMENT ON COLUMN public.teams.coach_license IS 'Coach license number';
COMMENT ON COLUMN public.teams.primary_color IS 'Primary team color (hex code)';
COMMENT ON COLUMN public.teams.secondary_color IS 'Secondary team color (hex code)';
COMMENT ON COLUMN public.teams.account_holder_name IS 'Bank account holder name';
COMMENT ON COLUMN public.teams.bank_name IS 'Bank name';
COMMENT ON COLUMN public.teams.account_number IS 'Bank account number';
COMMENT ON COLUMN public.teams.account_type IS 'Account type (e.g., Savings, Checking)';
COMMENT ON COLUMN public.teams.branch_name IS 'Bank branch name';
COMMENT ON COLUMN public.teams.branch_code IS 'Bank branch code';
COMMENT ON COLUMN public.teams.swift_code IS 'SWIFT/BIC code';


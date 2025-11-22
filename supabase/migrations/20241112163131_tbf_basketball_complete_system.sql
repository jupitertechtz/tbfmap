-- TBF Basketball Management System - Complete Database Schema
-- Schema Analysis: Database empty - Creating complete schema from scratch
-- Integration Type: Fresh project - All tables needed
-- Dependencies: None - Starting fresh

-- ===========================================
-- 1. TYPES & ENUMS
-- ===========================================

CREATE TYPE public.user_role AS ENUM ('admin', 'team_manager', 'player', 'official', 'staff');
CREATE TYPE public.team_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');
CREATE TYPE public.league_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');
CREATE TYPE public.match_status AS ENUM ('scheduled', 'live', 'completed', 'postponed', 'cancelled');
CREATE TYPE public.player_position AS ENUM ('point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center');
CREATE TYPE public.player_status AS ENUM ('active', 'inactive', 'injured', 'suspended', 'transferred');
CREATE TYPE public.registration_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_changes');
CREATE TYPE public.document_type AS ENUM ('team_logo', 'player_photo', 'id_document', 'medical_certificate', 'transfer_certificate', 'other');
CREATE TYPE public.match_event_type AS ENUM ('goal_2pt', 'goal_3pt', 'free_throw', 'foul', 'technical_foul', 'timeout', 'substitution', 'quarter_end');

-- ===========================================
-- 2. CORE USER TABLES
-- ===========================================

-- Critical intermediary table for PostgREST compatibility
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role NOT NULL DEFAULT 'player'::public.user_role,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 3. TEAM MANAGEMENT TABLES
-- ===========================================

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    founded_year INTEGER,
    home_venue TEXT,
    team_manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    logo_url TEXT,
    team_status public.team_status DEFAULT 'pending_approval'::public.team_status,
    registration_status public.registration_status DEFAULT 'draft'::public.registration_status,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.team_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    document_type public.document_type NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 4. LEAGUE MANAGEMENT TABLES
-- ===========================================

CREATE TABLE public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    season TEXT NOT NULL,
    league_status public.league_status DEFAULT 'upcoming'::public.league_status,
    start_date DATE,
    end_date DATE,
    max_teams INTEGER DEFAULT 12,
    current_teams INTEGER DEFAULT 0,
    entry_fee DECIMAL(10,2),
    prize_pool DECIMAL(10,2),
    rules TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.league_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    joined_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(league_id, team_id)
);

CREATE TABLE public.league_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    point_difference INTEGER DEFAULT 0,
    win_percentage DECIMAL(5,3) DEFAULT 0.000,
    position INTEGER,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, team_id)
);

-- ===========================================
-- 5. PLAYER MANAGEMENT TABLES
-- ===========================================

CREATE TABLE public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    jersey_number INTEGER,
    player_position public.player_position,
    player_status public.player_status DEFAULT 'active'::public.player_status,
    height_cm INTEGER,
    weight_kg INTEGER,
    date_of_birth DATE,
    place_of_birth TEXT,
    nationality TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_conditions TEXT,
    registration_status public.registration_status DEFAULT 'draft'::public.registration_status,
    registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMPTZ,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, jersey_number)
);

CREATE TABLE public.player_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    document_type public.document_type NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.player_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    three_pointers_made INTEGER DEFAULT 0,
    three_pointers_attempted INTEGER DEFAULT 0,
    free_throws_made INTEGER DEFAULT 0,
    free_throws_attempted INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, league_id)
);

-- ===========================================
-- 6. MATCH MANAGEMENT TABLES
-- ===========================================

CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMPTZ NOT NULL,
    venue TEXT,
    match_status public.match_status DEFAULT 'scheduled'::public.match_status,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    quarter INTEGER DEFAULT 1,
    time_remaining TEXT DEFAULT '12:00',
    referee_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    umpire1_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    umpire2_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    match_notes TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    event_type public.match_event_type NOT NULL,
    quarter INTEGER NOT NULL,
    time_remaining TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    description TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 7. OFFICIALS MANAGEMENT
-- ===========================================

CREATE TABLE public.officials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    license_number TEXT UNIQUE,
    certification_level TEXT,
    experience_years INTEGER DEFAULT 0,
    specialization TEXT,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 8. INDEXES FOR PERFORMANCE
-- ===========================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- Teams indexes
CREATE INDEX idx_teams_manager ON public.teams(team_manager_id);
CREATE INDEX idx_teams_status ON public.teams(team_status);
CREATE INDEX idx_team_documents_team ON public.team_documents(team_id);

-- League indexes
CREATE INDEX idx_leagues_status ON public.leagues(league_status);
CREATE INDEX idx_league_teams_league ON public.league_teams(league_id);
CREATE INDEX idx_league_teams_team ON public.league_teams(team_id);
CREATE INDEX idx_league_standings_league ON public.league_standings(league_id);

-- Player indexes
CREATE INDEX idx_players_team ON public.players(team_id);
CREATE INDEX idx_players_user ON public.players(user_profile_id);
CREATE INDEX idx_players_status ON public.players(player_status);
CREATE INDEX idx_player_documents_player ON public.player_documents(player_id);
CREATE INDEX idx_player_statistics_player ON public.player_statistics(player_id);
CREATE INDEX idx_player_statistics_league ON public.player_statistics(league_id);

-- Match indexes
CREATE INDEX idx_matches_league ON public.matches(league_id);
CREATE INDEX idx_matches_home_team ON public.matches(home_team_id);
CREATE INDEX idx_matches_away_team ON public.matches(away_team_id);
CREATE INDEX idx_matches_date ON public.matches(scheduled_date);
CREATE INDEX idx_matches_status ON public.matches(match_status);
CREATE INDEX idx_match_events_match ON public.match_events(match_id);
CREATE INDEX idx_match_events_player ON public.match_events(player_id);

-- Officials indexes
CREATE INDEX idx_officials_user ON public.officials(user_profile_id);
CREATE INDEX idx_officials_available ON public.officials(is_available);

-- ===========================================
-- 9. FUNCTIONS (MUST BE BEFORE RLS POLICIES)
-- ===========================================

-- Function for automatic profile creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, avatar_url, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'player'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
    RETURN NEW;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
)
$$;

-- Function to check if user manages team
CREATE OR REPLACE FUNCTION public.manages_team(team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_uuid AND t.team_manager_id = auth.uid()
)
$$;

-- Function to check if user is player in team
CREATE OR REPLACE FUNCTION public.is_player_in_team(team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.team_id = team_uuid AND p.user_profile_id = auth.uid()
)
$$;

-- ===========================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 11. RLS POLICIES
-- ===========================================

-- User profiles policies (Pattern 1: Core user table)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "admin_view_all_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Teams policies
CREATE POLICY "public_can_read_teams"
ON public.teams
FOR SELECT
TO public
USING (true);

CREATE POLICY "team_managers_manage_own_teams"
ON public.teams
FOR ALL
TO authenticated
USING (team_manager_id = auth.uid())
WITH CHECK (team_manager_id = auth.uid());

CREATE POLICY "admin_manage_all_teams"
ON public.teams
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Team documents policies
CREATE POLICY "team_members_access_team_documents"
ON public.team_documents
FOR SELECT
TO authenticated
USING (
    public.manages_team(team_id) OR
    public.is_player_in_team(team_id) OR
    public.is_admin()
);

CREATE POLICY "team_managers_manage_team_documents"
ON public.team_documents
FOR ALL
TO authenticated
USING (public.manages_team(team_id) OR public.is_admin())
WITH CHECK (public.manages_team(team_id) OR public.is_admin());

-- Leagues policies
CREATE POLICY "public_can_read_leagues"
ON public.leagues
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_leagues"
ON public.leagues
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- League teams policies
CREATE POLICY "public_can_read_league_teams"
ON public.league_teams
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_league_teams"
ON public.league_teams
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- League standings policies
CREATE POLICY "public_can_read_league_standings"
ON public.league_standings
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_league_standings"
ON public.league_standings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Players policies
CREATE POLICY "public_can_read_players"
ON public.players
FOR SELECT
TO public
USING (true);

CREATE POLICY "players_manage_own_profiles"
ON public.players
FOR ALL
TO authenticated
USING (user_profile_id = auth.uid())
WITH CHECK (user_profile_id = auth.uid());

CREATE POLICY "team_managers_manage_team_players"
ON public.players
FOR ALL
TO authenticated
USING (public.manages_team(team_id) OR public.is_admin())
WITH CHECK (public.manages_team(team_id) OR public.is_admin());

-- Player documents policies
CREATE POLICY "players_manage_own_documents"
ON public.player_documents
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.players p
        WHERE p.id = player_id AND p.user_profile_id = auth.uid()
    ) OR public.is_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.players p
        WHERE p.id = player_id AND p.user_profile_id = auth.uid()
    ) OR public.is_admin()
);

-- Player statistics policies
CREATE POLICY "public_can_read_player_statistics"
ON public.player_statistics
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_player_statistics"
ON public.player_statistics
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Matches policies
CREATE POLICY "public_can_read_matches"
ON public.matches
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_matches"
ON public.matches
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Match events policies
CREATE POLICY "public_can_read_match_events"
ON public.match_events
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_match_events"
ON public.match_events
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Officials policies
CREATE POLICY "public_can_read_officials"
ON public.officials
FOR SELECT
TO public
USING (true);

CREATE POLICY "officials_manage_own_profiles"
ON public.officials
FOR ALL
TO authenticated
USING (user_profile_id = auth.uid())
WITH CHECK (user_profile_id = auth.uid());

CREATE POLICY "admin_manage_officials"
ON public.officials
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===========================================
-- 12. TRIGGERS
-- ===========================================

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- 13. MOCK DATA FOR TESTING
-- ===========================================

DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    manager_uuid UUID := gen_random_uuid();
    player_uuid UUID := gen_random_uuid();
    official_uuid UUID := gen_random_uuid();
    team1_uuid UUID := gen_random_uuid();
    team2_uuid UUID := gen_random_uuid();
    league_uuid UUID := gen_random_uuid();
    match_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@tbf.co.tz', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "TBF Administrator", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (manager_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'manager@tbf.co.tz', crypt('manager123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Team Manager", "role": "team_manager"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (player_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'player@tbf.co.tz', crypt('player123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Basketball Player", "role": "player"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (official_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'official@tbf.co.tz', crypt('official123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Game Official", "role": "official"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create teams
    INSERT INTO public.teams (id, name, short_name, founded_year, home_venue, team_manager_id, team_status, registration_status)
    VALUES
        (team1_uuid, 'Dar es Salaam Warriors', 'DSM Warriors', 2020, 'National Stadium Court', manager_uuid, 'active'::public.team_status, 'approved'::public.registration_status),
        (team2_uuid, 'Mwanza Lakers', 'MWZ Lakers', 2019, 'Mwanza Sports Complex', manager_uuid, 'active'::public.team_status, 'approved'::public.registration_status);

    -- Create league
    INSERT INTO public.leagues (id, name, description, season, league_status, start_date, end_date, max_teams, current_teams, created_by)
    VALUES
        (league_uuid, 'TBF Premier League 2024', 'National Basketball Premier League Championship', '2024', 'active'::public.league_status, '2024-03-01', '2024-08-31', 12, 8, admin_uuid);

    -- Add teams to league
    INSERT INTO public.league_teams (league_id, team_id)
    VALUES
        (league_uuid, team1_uuid),
        (league_uuid, team2_uuid);

    -- Create league standings
    INSERT INTO public.league_standings (league_id, team_id, games_played, wins, losses, points_for, points_against, point_difference, win_percentage, position)
    VALUES
        (league_uuid, team1_uuid, 8, 6, 2, 645, 598, 47, 0.750, 1),
        (league_uuid, team2_uuid, 8, 5, 3, 612, 587, 25, 0.625, 2);

    -- Create player
    INSERT INTO public.players (user_profile_id, team_id, jersey_number, player_position, height_cm, weight_kg, date_of_birth, nationality, player_status, registration_status)
    VALUES
        (player_uuid, team1_uuid, 23, 'small_forward'::public.player_position, 198, 85, '1995-06-15', 'Tanzania', 'active'::public.player_status, 'approved'::public.registration_status);

    -- Create player statistics
    INSERT INTO public.player_statistics (player_id, league_id, games_played, minutes_played, points, field_goals_made, field_goals_attempted, three_pointers_made, three_pointers_attempted, free_throws_made, free_throws_attempted, rebounds, assists, steals, blocks)
    VALUES
        ((SELECT id FROM public.players WHERE user_profile_id = player_uuid), league_uuid, 8, 320, 156, 58, 124, 18, 45, 22, 28, 64, 32, 12, 8);

    -- Create official
    INSERT INTO public.officials (user_profile_id, license_number, certification_level, experience_years, specialization, rating)
    VALUES
        (official_uuid, 'TBF-REF-2024-001', 'Level 3 Referee', 8, 'Basketball Referee', 4.75);

    -- Create match
    INSERT INTO public.matches (id, league_id, home_team_id, away_team_id, scheduled_date, venue, match_status, home_score, away_score, referee_id, created_by)
    VALUES
        (match_uuid, league_uuid, team1_uuid, team2_uuid, now() + interval '7 days', 'National Stadium Court', 'scheduled'::public.match_status, 0, 0, official_uuid, admin_uuid);

END $$;
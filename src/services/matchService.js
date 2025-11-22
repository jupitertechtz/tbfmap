import { supabase } from '../lib/supabase';

export const matchService = {
  // Get all matches
  async getAll() {
    try {
      const { data, error } = await supabase?.from('matches')?.select(`
          *,
          league:leagues(id, name, season),
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url),
          referee:user_profiles!matches_referee_id_fkey(id, full_name),
          umpire1:user_profiles!matches_umpire1_id_fkey(id, full_name),
          umpire2:user_profiles!matches_umpire2_id_fkey(id, full_name)
        `)?.order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Convert to camelCase for React
      return data?.map(match => ({
        id: match?.id,
        leagueId: match?.league_id,
        homeTeamId: match?.home_team_id,
        awayTeamId: match?.away_team_id,
        scheduledDate: match?.scheduled_date,
        venue: match?.venue,
        matchStatus: match?.match_status,
        homeScore: match?.home_score,
        awayScore: match?.away_score,
        quarter: match?.quarter,
        timeRemaining: match?.time_remaining,
        refereeId: match?.referee_id,
        umpire1Id: match?.umpire1_id,
        umpire2Id: match?.umpire2_id,
        matchNotes: match?.match_notes,
        startedAt: match?.started_at,
        endedAt: match?.ended_at,
        createdBy: match?.created_by,
        createdAt: match?.created_at,
        updatedAt: match?.updated_at,
        league: match?.league ? {
          id: match?.league?.id,
          name: match?.league?.name,
          season: match?.league?.season
        } : null,
        homeTeam: match?.home_team ? {
          id: match?.home_team?.id,
          name: match?.home_team?.name,
          shortName: match?.home_team?.short_name,
          logoUrl: match?.home_team?.logo_url
        } : null,
        awayTeam: match?.away_team ? {
          id: match?.away_team?.id,
          name: match?.away_team?.name,
          shortName: match?.away_team?.short_name,
          logoUrl: match?.away_team?.logo_url
        } : null,
        referee: match?.referee ? {
          id: match?.referee?.id,
          fullName: match?.referee?.full_name
        } : null,
        umpire1: match?.umpire1 ? {
          id: match?.umpire1?.id,
          fullName: match?.umpire1?.full_name
        } : null,
        umpire2: match?.umpire2 ? {
          id: match?.umpire2?.id,
          fullName: match?.umpire2?.full_name
        } : null
      })) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch matches');
    }
  },

  // Get match by ID with events
  async getById(matchId) {
    try {
      const { data, error } = await supabase?.from('matches')?.select(`
          *,
          league:leagues(id, name, season),
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url),
          referee:user_profiles!matches_referee_id_fkey(id, full_name),
          umpire1:user_profiles!matches_umpire1_id_fkey(id, full_name),
          umpire2:user_profiles!matches_umpire2_id_fkey(id, full_name),
          match_events(
            *,
            player:players!match_events_player_id_fkey(id, jersey_number, user_profile:user_profiles!players_user_profile_id_fkey(id, full_name)),
            team:teams!match_events_team_id_fkey(id, name, short_name)
          )
        `)?.eq('id', matchId)?.single();

      if (error) throw error;

      // Convert to camelCase for React
      return {
        id: data?.id,
        leagueId: data?.league_id,
        homeTeamId: data?.home_team_id,
        awayTeamId: data?.away_team_id,
        scheduledDate: data?.scheduled_date,
        venue: data?.venue,
        matchStatus: data?.match_status,
        homeScore: data?.home_score,
        awayScore: data?.away_score,
        quarter: data?.quarter,
        timeRemaining: data?.time_remaining,
        refereeId: data?.referee_id,
        umpire1Id: data?.umpire1_id,
        umpire2Id: data?.umpire2_id,
        matchNotes: data?.match_notes,
        startedAt: data?.started_at,
        endedAt: data?.ended_at,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        league: data?.league ? {
          id: data?.league?.id,
          name: data?.league?.name,
          season: data?.league?.season
        } : null,
        homeTeam: data?.home_team ? {
          id: data?.home_team?.id,
          name: data?.home_team?.name,
          shortName: data?.home_team?.short_name,
          logoUrl: data?.home_team?.logo_url
        } : null,
        awayTeam: data?.away_team ? {
          id: data?.away_team?.id,
          name: data?.away_team?.name,
          shortName: data?.away_team?.short_name,
          logoUrl: data?.away_team?.logo_url
        } : null,
        referee: data?.referee ? {
          id: data?.referee?.id,
          fullName: data?.referee?.full_name
        } : null,
        umpire1: data?.umpire1 ? {
          id: data?.umpire1?.id,
          fullName: data?.umpire1?.full_name
        } : null,
        umpire2: data?.umpire2 ? {
          id: data?.umpire2?.id,
          fullName: data?.umpire2?.full_name
        } : null,
        events: data?.match_events?.map(event => ({
          id: event?.id,
          matchId: event?.match_id,
          playerId: event?.player_id,
          teamId: event?.team_id,
          eventType: event?.event_type,
          quarter: event?.quarter,
          timeRemaining: event?.time_remaining,
          points: event?.points,
          description: event?.description,
          createdBy: event?.created_by,
          createdAt: event?.created_at,
          player: event?.player ? {
            id: event?.player?.id,
            jerseyNumber: event?.player?.jersey_number,
            userProfile: event?.player?.user_profile ? {
              fullName: event?.player?.user_profile?.full_name
            } : null
          } : null,
          team: event?.team ? {
            id: event?.team?.id,
            name: event?.team?.name,
            shortName: event?.team?.short_name
          } : null
        })) || []
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch match');
    }
  },

  // Create new match
  async create(matchData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('matches')?.insert({
          league_id: matchData?.leagueId,
          home_team_id: matchData?.homeTeamId,
          away_team_id: matchData?.awayTeamId,
          scheduled_date: matchData?.scheduledDate,
          venue: matchData?.venue,
          referee_id: matchData?.refereeId,
          umpire1_id: matchData?.umpire1Id,
          umpire2_id: matchData?.umpire2Id,
          match_notes: matchData?.matchNotes,
          created_by: user?.id
        })?.select()?.single();

      if (error) throw error;

      // Convert to camelCase for React
      return {
        id: data?.id,
        leagueId: data?.league_id,
        homeTeamId: data?.home_team_id,
        awayTeamId: data?.away_team_id,
        scheduledDate: data?.scheduled_date,
        venue: data?.venue,
        matchStatus: data?.match_status,
        homeScore: data?.home_score,
        awayScore: data?.away_score,
        quarter: data?.quarter,
        timeRemaining: data?.time_remaining,
        refereeId: data?.referee_id,
        umpire1Id: data?.umpire1_id,
        umpire2Id: data?.umpire2_id,
        matchNotes: data?.match_notes,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create match');
    }
  },

  // Update match
  async update(matchId, matchData) {
    try {
      const { data, error } = await supabase?.from('matches')?.update({
          scheduled_date: matchData?.scheduledDate,
          venue: matchData?.venue,
          referee_id: matchData?.refereeId,
          umpire1_id: matchData?.umpire1Id,
          umpire2_id: matchData?.umpire2Id,
          match_notes: matchData?.matchNotes,
          updated_at: new Date()?.toISOString()
        })?.eq('id', matchId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update match');
    }
  },

  // Update match score and status
  async updateScore(matchId, scoreData) {
    try {
      const { data, error } = await supabase?.from('matches')?.update({
          home_score: scoreData?.homeScore,
          away_score: scoreData?.awayScore,
          quarter: scoreData?.quarter,
          time_remaining: scoreData?.timeRemaining,
          match_status: scoreData?.matchStatus,
          started_at: scoreData?.startedAt,
          ended_at: scoreData?.endedAt,
          updated_at: new Date()?.toISOString()
        })?.eq('id', matchId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update match score');
    }
  },

  // Add match event
  async addEvent(matchId, eventData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('match_events')?.insert({
          match_id: matchId,
          player_id: eventData?.playerId,
          team_id: eventData?.teamId,
          event_type: eventData?.eventType,
          quarter: eventData?.quarter,
          time_remaining: eventData?.timeRemaining,
          points: eventData?.points || 0,
          description: eventData?.description,
          created_by: user?.id
        })?.select()?.single();

      if (error) throw error;

      // Convert to camelCase for React
      return {
        id: data?.id,
        matchId: data?.match_id,
        playerId: data?.player_id,
        teamId: data?.team_id,
        eventType: data?.event_type,
        quarter: data?.quarter,
        timeRemaining: data?.time_remaining,
        points: data?.points,
        description: data?.description,
        createdBy: data?.created_by,
        createdAt: data?.created_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to add match event');
    }
  },

  // Get matches by league
  async getByLeague(leagueId) {
    try {
      const { data, error } = await supabase?.from('matches')?.select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url)
        `)?.eq('league_id', leagueId)?.order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Convert to camelCase for React
      return data?.map(match => ({
        id: match?.id,
        leagueId: match?.league_id,
        homeTeamId: match?.home_team_id,
        awayTeamId: match?.away_team_id,
        scheduledDate: match?.scheduled_date,
        venue: match?.venue,
        matchStatus: match?.match_status,
        homeScore: match?.home_score,
        awayScore: match?.away_score,
        quarter: match?.quarter,
        timeRemaining: match?.time_remaining,
        createdAt: match?.created_at,
        homeTeam: match?.home_team ? {
          id: match?.home_team?.id,
          name: match?.home_team?.name,
          shortName: match?.home_team?.short_name,
          logoUrl: match?.home_team?.logo_url
        } : null,
        awayTeam: match?.away_team ? {
          id: match?.away_team?.id,
          name: match?.away_team?.name,
          shortName: match?.away_team?.short_name,
          logoUrl: match?.away_team?.logo_url
        } : null
      })) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch league matches');
    }
  },

  // Get upcoming matches
  async getUpcoming(limit = 10) {
    try {
      const { data, error } = await supabase?.from('matches')?.select(`
          *,
          league:leagues(id, name, season),
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url)
        `)?.in('match_status', ['scheduled', 'live'])?.gte('scheduled_date', new Date()?.toISOString())?.order('scheduled_date', { ascending: true })?.limit(limit);

      if (error) throw error;

      // Convert to camelCase for React
      return data?.map(match => ({
        id: match?.id,
        leagueId: match?.league_id,
        scheduledDate: match?.scheduled_date,
        venue: match?.venue,
        matchStatus: match?.match_status,
        homeScore: match?.home_score,
        awayScore: match?.away_score,
        quarter: match?.quarter,
        timeRemaining: match?.time_remaining,
        league: match?.league ? {
          id: match?.league?.id,
          name: match?.league?.name,
          season: match?.league?.season
        } : null,
        homeTeam: match?.home_team ? {
          id: match?.home_team?.id,
          name: match?.home_team?.name,
          shortName: match?.home_team?.short_name,
          logoUrl: match?.home_team?.logo_url
        } : null,
        awayTeam: match?.away_team ? {
          id: match?.away_team?.id,
          name: match?.away_team?.name,
          shortName: match?.away_team?.short_name,
          logoUrl: match?.away_team?.logo_url
        } : null
      })) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch upcoming matches');
    }
  },

  // Delete match
  async delete(matchId) {
    try {
      const { error } = await supabase?.from('matches')?.delete()?.eq('id', matchId);
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete match');
    }
  }
};
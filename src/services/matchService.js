import { supabase } from '../lib/supabase';
import { leagueService } from './leagueService';

// Helper function to normalize old URLs (convert http://localhost:3001 to HTTPS API URL)
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // If it's already a full URL, normalize it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Replace old localhost:3001 URLs
    if (url.includes('localhost:3001')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.tanzaniabasketball.com';
      return url.replace(/https?:\/\/localhost:3001/, apiUrl);
    }
    // Convert HTTP to HTTPS for security (mixed content prevention)
    if (url.startsWith('http://') && !url.startsWith('http://localhost')) {
      return url.replace(/^http:\/\//, 'https://');
    }
  }
  
  return url;
};

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
          logoUrl: normalizeUrl(match?.home_team?.logo_url)
        } : null,
        awayTeam: match?.away_team ? {
          id: match?.away_team?.id,
          name: match?.away_team?.name,
          shortName: match?.away_team?.short_name,
          logoUrl: normalizeUrl(match?.away_team?.logo_url)
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
      // First, get the match to retrieve league_id
      const { data: existingMatch, error: fetchError } = await supabase
        ?.from('matches')
        ?.select('league_id, match_status')
        ?.eq('id', matchId)
        ?.single();

      if (fetchError) throw fetchError;
      if (!existingMatch) throw new Error('Match not found');

      const updatePayload = {
        home_score: scoreData?.homeScore !== undefined && scoreData?.homeScore !== null ? parseInt(scoreData.homeScore) : null,
        away_score: scoreData?.awayScore !== undefined && scoreData?.awayScore !== null ? parseInt(scoreData.awayScore) : null,
        quarter: scoreData?.quarter,
        time_remaining: scoreData?.timeRemaining,
        match_status: scoreData?.matchStatus,
        started_at: scoreData?.startedAt,
        ended_at: scoreData?.endedAt,
        updated_at: new Date()?.toISOString()
      };

      // Include match notes if provided
      if (scoreData?.matchNotes !== undefined) {
        updatePayload.match_notes = scoreData.matchNotes;
      }

      const { data, error } = await supabase?.from('matches')?.update(updatePayload)?.eq('id', matchId)?.select()?.single();

      if (error) throw error;

      // Recalculate league standings if match status is Final or Completed
      // and if scores are provided (not null)
      const isMatchCompleted = (scoreData?.matchStatus === 'Final' || scoreData?.matchStatus === 'Completed') &&
                                scoreData?.homeScore !== null && scoreData?.awayScore !== null;
      const wasMatchCompleted = existingMatch?.match_status === 'Final' || existingMatch?.match_status === 'Completed';
      
      // Recalculate if:
      // 1. Match is being marked as completed with scores, OR
      // 2. Match was already completed and scores are being updated
      if (existingMatch?.league_id && (isMatchCompleted || wasMatchCompleted)) {
        try {
          await leagueService.recalculateStandings(existingMatch.league_id);
          console.log(`Standings recalculated for league ${existingMatch.league_id}`);
        } catch (standingsError) {
          // Log error but don't fail the match update
          console.error('Failed to recalculate standings:', standingsError);
          // You might want to throw this error in production, but for now we'll just log it
        }
      }

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
          logoUrl: normalizeUrl(match?.home_team?.logo_url)
        } : null,
        awayTeam: match?.away_team ? {
          id: match?.away_team?.id,
          name: match?.away_team?.name,
          shortName: match?.away_team?.short_name,
          logoUrl: normalizeUrl(match?.away_team?.logo_url)
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
          logoUrl: normalizeUrl(match?.home_team?.logo_url)
        } : null,
        awayTeam: match?.away_team ? {
          id: match?.away_team?.id,
          name: match?.away_team?.name,
          shortName: match?.away_team?.short_name,
          logoUrl: normalizeUrl(match?.away_team?.logo_url)
        } : null
      })) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch upcoming matches');
    }
  },

  // Get recently scheduled or completed fixtures
  async getRecentFixtures(options = {}) {
    try {
      const { limit = 6, leagueId, fixtureDate } = options || {};

      let query = supabase
        ?.from('matches')
        ?.select(`
          *,
          league:leagues(id, name, season),
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url)
        `)
        ?.order('scheduled_date', { ascending: false })
        ?.limit(limit);

      if (leagueId) {
        query = query?.eq('league_id', leagueId);
      }

      if (fixtureDate) {
        const startOfDay = new Date(fixtureDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(fixtureDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query
          ?.gte('scheduled_date', startOfDay.toISOString())
          ?.lte('scheduled_date', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (
        data?.map((match) => ({
          id: match?.id,
          leagueId: match?.league_id,
          scheduledDate: match?.scheduled_date,
          venue: match?.venue,
          matchStatus: match?.match_status,
          homeScore: match?.home_score,
          awayScore: match?.away_score,
          matchNotes: match?.match_notes,
          roundName: match?.round || match?.stage || match?.match_stage || null,
          league: match?.league
            ? {
                id: match?.league?.id,
                name: match?.league?.name,
                season: match?.league?.season,
              }
            : null,
          homeTeam: match?.home_team
            ? {
                id: match?.home_team?.id,
                name: match?.home_team?.name,
                shortName: match?.home_team?.short_name,
                logoUrl: normalizeUrl(match?.home_team?.logo_url),
              }
            : null,
          awayTeam: match?.away_team
            ? {
                id: match?.away_team?.id,
                name: match?.away_team?.name,
                shortName: match?.away_team?.short_name,
                logoUrl: normalizeUrl(match?.away_team?.logo_url),
              }
            : null,
        })) || []
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch recent fixtures');
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
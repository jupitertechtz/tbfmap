import { supabase } from '../lib/supabase';

/**
 * Dashboard Service
 * Fetches real-time data for the admin dashboard
 */

export const dashboardService = {
  /**
   * Get dashboard metrics
   */
  async getMetrics() {
    try {
      // Get total teams
      const { count: totalTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      // Get active teams (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: recentTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get total players
      const { count: totalPlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });

      // Get recent players (last 30 days)
      const { count: recentPlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get active officials (users with official role)
      const { count: totalOfficials } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'official')
        .eq('is_active', true);

      // Get recent officials (last 30 days)
      const { count: recentOfficials } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'official')
        .eq('is_active', true)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get active leagues
      const { count: activeLeagues } = await supabase
        .from('leagues')
        .select('*', { count: 'exact', head: true })
        .in('league_status', ['upcoming', 'active']);

      return {
        totalTeams: totalTeams || 0,
        recentTeams: recentTeams || 0,
        totalPlayers: totalPlayers || 0,
        recentPlayers: recentPlayers || 0,
        totalOfficials: totalOfficials || 0,
        recentOfficials: recentOfficials || 0,
        activeLeagues: activeLeagues || 0,
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw new Error('Failed to fetch dashboard metrics');
    }
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 20) {
    try {
      const activities = [];

      // Get recent team registrations
      const { data: recentTeams } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          created_at,
          team_manager_id
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get team manager names separately
      const managerIds = recentTeams?.map(t => t.team_manager_id).filter(Boolean) || [];
      const managerNames = {};
      if (managerIds.length > 0) {
        const { data: managers } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', managerIds);
        
        managers?.forEach(m => {
          managerNames[m.id] = m.full_name;
        });
      }

      if (recentTeams) {
        recentTeams.forEach((team) => {
          activities.push({
            id: `team_${team.id}`,
            type: 'team_registration',
            description: `New team '${team.name}' registered`,
            user: managerNames[team.team_manager_id] || 'System',
            timestamp: new Date(team.created_at),
            entityId: team.id,
            entityType: 'team',
          });
        });
      }

      // Get recent player registrations
      const { data: recentPlayers } = await supabase
        .from('players')
        .select(`
          id,
          created_at,
          user_profile_id,
          team_id
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Get player and team names separately
      const playerUserIds = recentPlayers?.map(p => p.user_profile_id).filter(Boolean) || [];
      const teamIds = recentPlayers?.map(p => p.team_id).filter(Boolean) || [];
      
      const playerNames = {};
      if (playerUserIds.length > 0) {
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', playerUserIds);
        
        users?.forEach(u => {
          playerNames[u.id] = u.full_name;
        });
      }

      const teamNames = {};
      if (teamIds.length > 0) {
        const { data: teams } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', teamIds);
        
        teams?.forEach(t => {
          teamNames[t.id] = t.name;
        });
      }

      if (recentPlayers) {
        recentPlayers.forEach((player) => {
          const playerName = playerNames[player.user_profile_id] || 'Unknown';
          const teamName = player.team_id ? teamNames[player.team_id] : null;
          activities.push({
            id: `player_${player.id}`,
            type: 'player_registration',
            description: `Player ${playerName} registered${teamName ? ` for ${teamName}` : ''}`,
            user: playerName,
            timestamp: new Date(player.created_at),
            entityId: player.id,
            entityType: 'player',
          });
        });
      }

      // Get recent match results
      const { data: recentMatches } = await supabase
        .from('matches')
        .select(`
          id,
          home_score,
          away_score,
          ended_at,
          home_team_id,
          away_team_id
        `)
        .eq('match_status', 'completed')
        .not('ended_at', 'is', null)
        .order('ended_at', { ascending: false })
        .limit(limit);

      // Get match team names
      const matchTeamIds = [];
      recentMatches?.forEach(m => {
        if (m.home_team_id) matchTeamIds.push(m.home_team_id);
        if (m.away_team_id) matchTeamIds.push(m.away_team_id);
      });
      
      const matchTeamNames = {};
      if (matchTeamIds.length > 0) {
        const { data: matchTeams } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', [...new Set(matchTeamIds)]);
        
        matchTeams?.forEach(t => {
          matchTeamNames[t.id] = t.name;
        });
      }

      if (recentMatches) {
        recentMatches.forEach((match) => {
          const homeTeam = matchTeamNames[match.home_team_id] || 'Unknown';
          const awayTeam = matchTeamNames[match.away_team_id] || 'Unknown';
          activities.push({
            id: `match_${match.id}`,
            type: 'match_result',
            description: `Match result: ${homeTeam} ${match.home_score}-${match.away_score} ${awayTeam}`,
            user: 'System',
            timestamp: new Date(match.ended_at),
            entityId: match.id,
            entityType: 'match',
          });
        });
      }

      // Get recent user registrations
      const { data: recentUsers } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (recentUsers) {
        recentUsers.forEach((user) => {
          const roleDisplay = user.role?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'User';
          activities.push({
            id: `user_${user.id}`,
            type: 'user_registration',
            description: `New ${roleDisplay} account created: ${user.full_name}`,
            user: 'System',
            timestamp: new Date(user.created_at),
            entityId: user.id,
            entityType: 'user',
          });
        });
      }

      // Get recent team approvals
      const { data: approvedTeams } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          approved_date,
          approved_by
        `)
        .not('approved_date', 'is', null)
        .order('approved_date', { ascending: false })
        .limit(limit);

      // Get approver names
      const approverIds = approvedTeams?.map(t => t.approved_by).filter(Boolean) || [];
      const approverNames = {};
      if (approverIds.length > 0) {
        const { data: approvers } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', approverIds);
        
        approvers?.forEach(a => {
          approverNames[a.id] = a.full_name;
        });
      }

      if (approvedTeams) {
        approvedTeams.forEach((team) => {
          activities.push({
            id: `approval_${team.id}`,
            type: 'team_approval',
            description: `Team '${team.name}' approved`,
            user: approverNames[team.approved_by] || 'Admin',
            timestamp: new Date(team.approved_date),
            entityId: team.id,
            entityType: 'team',
          });
        });
      }

      // Sort all activities by timestamp (most recent first) and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw new Error('Failed to fetch recent activities');
    }
  },

  /**
   * Get pending actions counts
   */
  async getPendingActions() {
    try {
      // Teams pending approval
      const { count: pendingTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('registration_status', 'submitted')
        .or('team_status.eq.pending_approval,registration_status.eq.under_review');

      // Players pending approval
      const { count: pendingPlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .in('registration_status', ['submitted', 'under_review']);

      // Matches needing officials (matches with at least one missing official)
      const { data: scheduledMatches } = await supabase
        .from('matches')
        .select('id, referee_id, umpire1_id, umpire2_id')
        .eq('match_status', 'scheduled');
      
      const matchesNeedingOfficials = scheduledMatches?.filter(match => 
        !match.referee_id || !match.umpire1_id || !match.umpire2_id
      ).length || 0;

      // Leagues needing updates (simplified - just count active leagues)
      const { count: leaguesNeedingUpdates } = await supabase
        .from('leagues')
        .select('*', { count: 'exact', head: true })
        .in('league_status', ['upcoming', 'active']);

      return {
        teamApprovals: pendingTeams || 0,
        playerTransfers: pendingPlayers || 0,
        officialAssignments: matchesNeedingOfficials || 0,
        leagueUpdates: leaguesNeedingUpdates || 0,
      };
    } catch (error) {
      console.error('Error fetching pending actions:', error);
      throw new Error('Failed to fetch pending actions');
    }
  },
};


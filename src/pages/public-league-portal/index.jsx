import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LeagueStandings from './components/LeagueStandings';
import UpcomingFixtures from './components/UpcomingFixtures';
import RecentResults from './components/RecentResults';
import SearchAndFilters from './components/SearchAndFilters';
import { matchService } from '../../services/matchService';
import { leagueService } from '../../services/leagueService';
import { playerService } from '../../services/playerService';

const PublicLeaguePortal = () => {
  const [selectedSeason, setSelectedSeason] = useState('2024-25');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  
  // Data states
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [standingsData, setStandingsData] = useState({});
  const [leagueStats, setLeagueStats] = useState({
    totalGamesPlayed: 0,
    averagePointsPerGame: 0,
    topScorer: null,
    teamsCompeting: 0,
    venuesCount: 0
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState(null);

  // Helper to format date
  const formatShortDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate team form from recent matches (last 5 games: W/L/D)
  const calculateTeamForm = (teamId, allMatches) => {
    if (!allMatches || !teamId) return '-----';
    
    const now = new Date();
    
    // Get team's completed matches, sorted by scheduled date (most recent first)
    const teamMatches = allMatches
      .filter(match => {
        const isTeamMatch = match.homeTeamId === teamId || match.awayTeamId === teamId;
        const hasScores = match.homeScore !== null && match.homeScore !== undefined &&
                         match.awayScore !== null && match.awayScore !== undefined;
        const matchDate = match.scheduledDate ? new Date(match.scheduledDate) : null;
        const matchDayHasPassed = matchDate ? matchDate < now : false;
        const isCompleted = match.matchStatus === 'completed';
        
        return isTeamMatch && hasScores && (matchDayHasPassed || isCompleted);
      })
      .sort((a, b) => {
        const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
        const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
        return dateB - dateA; // Most recent first
      })
      .slice(0, 5); // Last 5 matches
    
    if (teamMatches.length === 0) return '-----';
    
    // Build form string (W = Win, L = Loss, D = Draw/Tie)
    const form = teamMatches.map(match => {
      const isHome = match.homeTeamId === teamId;
      const teamScore = isHome ? match.homeScore : match.awayScore;
      const opponentScore = isHome ? match.awayScore : match.homeScore;
      
      if (teamScore > opponentScore) return 'W';
      if (teamScore < opponentScore) return 'L';
      return 'D'; // Draw/Tie
    }).join('');
    
    // Pad with '-' if less than 5 matches
    return form.padEnd(5, '-');
  };

  const loadStandings = async (leagueId) => {
    setIsLoadingStandings(true);
    try {
      // Fetch all matches for this league first (needed for stats calculation)
      let allMatches = [];
      try {
        allMatches = await matchService.getAll();
        // Filter by league
        allMatches = allMatches.filter(match => match.leagueId === leagueId);
      } catch (err) {
        console.warn('Could not fetch matches for standings calculation:', err);
      }
      
      // Helper function to extract specific stage from match notes
      const getMatchStage = (matchNotes) => {
        if (!matchNotes) return 'Group Stage';
        const notes = matchNotes.toLowerCase();
        
        // Check for specific stages (order matters - check more specific first)
        if (notes.includes('third place')) return 'Third Place';
        if (notes.includes('classification')) return 'Classification';
        if (notes.includes('quarter finals') || notes.includes('quarter-finals')) return 'Quarter Finals';
        if (notes.includes('semi finals') || notes.includes('semi-finals')) return 'Semi Finals';
        if (notes.includes('finals') && !notes.includes('semi') && !notes.includes('quarter')) return 'Finals';
        if (notes.includes('knockout bracket')) {
          // Try to extract stage from notes format: "Knockout Bracket - Stage Name"
          const stageMatch = matchNotes.match(/Knockout Bracket - ([^-]+)/);
          if (stageMatch) {
            const stageName = stageMatch[1].trim();
            // Normalize stage names
            const normalized = stageName.toLowerCase();
            if (normalized.includes('quarter')) return 'Quarter Finals';
            if (normalized.includes('semi')) return 'Semi Finals';
            if (normalized.includes('third')) return 'Third Place';
            if (normalized.includes('classification')) return 'Classification';
            if (normalized.includes('final')) return 'Finals';
            return stageName; // Return as-is if not recognized
          }
          return 'Knockout'; // Generic knockout if can't parse
        }
        return 'Group Stage'; // Default to group stage
      };

      // Calculate statistics from matches organized by stage
      const now = new Date();
      const standingsByStage = new Map(); // Map<stage, Array<teamStandings>>
      
      // Define stage order
      const stageOrder = ['Group Stage', 'Quarter Finals', 'Semi Finals', 'Third Place', 'Classification', 'Finals'];
      
      // Initialize standings for each stage
      stageOrder.forEach(stage => {
        standingsByStage.set(stage, new Map()); // Map<teamId, stats>
      });
      
      // Process all completed matches to calculate team statistics by stage
      allMatches
        .filter(match => {
          const hasScores = match.homeScore !== null && match.homeScore !== undefined &&
                          match.awayScore !== null && match.awayScore !== undefined;
          const matchDate = match.scheduledDate ? new Date(match.scheduledDate) : null;
          const matchDayHasPassed = matchDate ? matchDate < now : false;
          const isCompleted = match.matchStatus === 'completed';
          return hasScores && (matchDayHasPassed || isCompleted);
        })
        .forEach(match => {
          const homeTeamId = match.homeTeamId;
          const awayTeamId = match.awayTeamId;
          const homeScore = Number(match.homeScore) || 0;
          const awayScore = Number(match.awayScore) || 0;
          const matchStage = getMatchStage(match.matchNotes);
          
          // Get or create stage stats map
          const stageStatsMap = standingsByStage.get(matchStage) || new Map();
          
          // Initialize home team stats for this stage if not exists
          if (!stageStatsMap.has(homeTeamId)) {
            stageStatsMap.set(homeTeamId, {
              teamId: homeTeamId,
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              pointsFor: 0,
              pointsAgainst: 0,
              team: match.homeTeam
            });
          }
          
          // Initialize away team stats for this stage if not exists
          if (!stageStatsMap.has(awayTeamId)) {
            stageStatsMap.set(awayTeamId, {
              teamId: awayTeamId,
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              pointsFor: 0,
              pointsAgainst: 0,
              team: match.awayTeam
            });
          }
          
          // Update home team stats for this stage
          const homeStats = stageStatsMap.get(homeTeamId);
          homeStats.gamesPlayed += 1;
          homeStats.pointsFor += homeScore;
          homeStats.pointsAgainst += awayScore;
          if (homeScore > awayScore) {
            homeStats.wins += 1;
          } else if (homeScore < awayScore) {
            homeStats.losses += 1;
          }
          
          // Update away team stats for this stage
          const awayStats = stageStatsMap.get(awayTeamId);
          awayStats.gamesPlayed += 1;
          awayStats.pointsFor += awayScore;
          awayStats.pointsAgainst += homeScore;
          if (awayScore > homeScore) {
            awayStats.wins += 1;
          } else if (awayScore < homeScore) {
            awayStats.losses += 1;
          }
          
          // Update the stage map
          standingsByStage.set(matchStage, stageStatsMap);
        });
      
      // Transform each stage's stats into standings arrays
      const transformedStandingsByStage = new Map();
      
      stageOrder.forEach(stage => {
        const stageStatsMap = standingsByStage.get(stage) || new Map();
        
        // Convert map to array and calculate additional stats
        const stageStandings = Array.from(stageStatsMap.values()).map((stats) => {
          const pointDifference = stats.pointsFor - stats.pointsAgainst;
          const wins = stats.wins || 0;
          const losses = stats.losses || 0;
          // FIBA points: (wins * 2) + (losses * 1)
          const leaguePoints = (wins * 2) + (losses * 1);
          
          // Get team info
          const teamInfo = stats.team || {
            id: stats.teamId,
            name: 'Unknown Team',
            shortName: 'N/A',
            logoUrl: '/assets/images/no_image.png'
          };
          
          return {
            id: stats.teamId,
            name: teamInfo.name || 'Unknown Team',
            shortName: teamInfo.shortName || 'N/A',
            logo: teamInfo.logoUrl || '/assets/images/no_image.png',
            logoAlt: `${teamInfo.name || 'Team'} logo`,
            gamesPlayed: stats.gamesPlayed || 0,
            wins: wins,
            losses: losses,
            points: leaguePoints,
            pointsDiff: pointDifference,
            pointsFor: stats.pointsFor || 0,
            pointsAgainst: stats.pointsAgainst || 0,
            form: calculateTeamForm(stats.teamId, allMatches) || '-----',
            position: null, // Will be set after sorting
            positionChange: 0
          };
        });
        
        // Sort standings by points (descending), then point difference (descending)
        stageStandings.sort((a, b) => {
          if (a.points !== b.points) {
            return b.points - a.points;
          }
          return (b.pointsDiff || 0) - (a.pointsDiff || 0);
        });
        
        // Assign positions
        stageStandings.forEach((standing, index) => {
          standing.position = index + 1;
        });
        
        // Only add stage if it has teams
        if (stageStandings.length > 0) {
          transformedStandingsByStage.set(stage, stageStandings);
        }
      });
      
      // Convert to object format for easier access in component
      const standingsData = {};
      transformedStandingsByStage.forEach((standings, stage) => {
        standingsData[stage] = standings;
      });
      
      setStandingsData(standingsData);
    } catch (err) {
      console.error('Error loading standings:', err);
      setError(err.message || 'Failed to load standings');
    } finally {
      setIsLoadingStandings(false);
    }
  };

  const loadFixturesAndResults = async (leagueId = null) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all matches, optionally filtered by league
      let allMatches = await matchService.getAll();
      
      // Filter by selected league if one is selected
      if (leagueId) {
        allMatches = allMatches.filter(match => match.leagueId === leagueId);
      }
      
      // Get current date for filtering
      const now = new Date();
      
      // Filter upcoming fixtures (scheduled or live, future dates)
      const upcoming = allMatches
        .filter(match => {
          const matchDate = match.scheduledDate ? new Date(match.scheduledDate) : null;
          return matchDate && matchDate >= now && 
                 (match.matchStatus === 'scheduled' || match.matchStatus === 'live');
        })
        .sort((a, b) => {
          const dateA = new Date(a.scheduledDate);
          const dateB = new Date(b.scheduledDate);
          return dateA - dateB;
        })
        .slice(0, 10); // Limit to 10 upcoming fixtures
      
      // Transform upcoming fixtures for component
      const transformedFixtures = upcoming.map(match => ({
        id: match.id,
        dateTime: match.scheduledDate,
        homeTeam: {
          name: match.homeTeam?.name || 'TBD',
          logo: match.homeTeam?.logoUrl || '/assets/images/no_image.png',
          logoAlt: `${match.homeTeam?.name || 'Team'} logo`,
          record: 'N/A'
        },
        awayTeam: {
          name: match.awayTeam?.name || 'TBD',
          logo: match.awayTeam?.logoUrl || '/assets/images/no_image.png',
          logoAlt: `${match.awayTeam?.name || 'Team'} logo`,
          record: 'N/A'
        },
        venue: match.venue || 'TBD',
        status: match.matchStatus || 'scheduled'
      }));
      
      // Filter recent results (all completed matches with scores)
      const completed = allMatches
        .filter(match => {
          const hasScores = match.homeScore !== null && match.homeScore !== undefined &&
                          match.awayScore !== null && match.awayScore !== undefined;
          const matchDate = match.scheduledDate ? new Date(match.scheduledDate) : null;
          const matchDayHasPassed = matchDate ? matchDate < now : false;
          const isCompleted = match.matchStatus === 'completed';
          return hasScores && (matchDayHasPassed || isCompleted);
        })
        .sort((a, b) => {
          const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
          const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
          return dateB - dateA;
        });
      
      // Transform recent results for component
      const transformedResults = completed.map(match => {
        const homeScore = match.homeScore || 0;
        const awayScore = match.awayScore || 0;
        const scoreDiff = Math.abs(homeScore - awayScore);
        const totalScore = homeScore + awayScore;
        
        // Determine highlight
        let highlight = null;
        if (scoreDiff <= 3) {
          highlight = 'close';
        } else if (totalScore >= 180) {
          highlight = 'high-scoring';
        }
        
        // Overtime detection
        const isOvertime = (match.quarter && typeof match.quarter === 'number' && match.quarter > 4) || 
                          (match.matchNotes && typeof match.matchNotes === 'string' &&
                          (match.matchNotes.toLowerCase().includes('overtime') || 
                           match.matchNotes.toLowerCase().includes(' ot ')));

        return {
          id: match.id,
          date: match.scheduledDate,
          homeTeam: {
            name: match.homeTeam?.name || 'TBD',
            shortName: match.homeTeam?.shortName || match.homeTeam?.name?.substring(0, 3).toUpperCase() || 'TBD',
            logo: match.homeTeam?.logoUrl || '/assets/images/no_image.png',
            logoAlt: `${match.homeTeam?.name || 'Team'} logo`
          },
          awayTeam: {
            name: match.awayTeam?.name || 'TBD',
            shortName: match.awayTeam?.shortName || match.awayTeam?.name?.substring(0, 3).toUpperCase() || 'TBD',
            logo: match.awayTeam?.logoUrl || '/assets/images/no_image.png',
            logoAlt: `${match.awayTeam?.name || 'Team'} logo`
          },
          homeScore: homeScore,
          awayScore: awayScore,
          venue: match.venue || 'TBD',
          overtime: isOvertime,
          highlight: highlight
        };
      });
      
      setUpcomingFixtures(transformedFixtures);
      setRecentResults(transformedResults);
    } catch (err) {
      console.error('Error loading fixtures and results:', err);
      setError(err.message || 'Failed to load fixtures and results');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeagueStatistics = async (leagueId) => {
    setIsLoadingStats(true);
    try {
      const allMatches = await matchService.getAll();
      const leagueMatches = allMatches.filter(match => match.leagueId === leagueId);
      
      const completedMatches = leagueMatches.filter(match => 
        match.matchStatus === 'completed' && 
        match.homeScore !== null && 
        match.awayScore !== null
      );
      const totalGamesPlayed = completedMatches.length;
      
      let averagePointsPerGame = 0;
      if (completedMatches.length > 0) {
        const totalPoints = completedMatches.reduce((sum, match) => {
          return sum + (match.homeScore || 0) + (match.awayScore || 0);
        }, 0);
        averagePointsPerGame = Number((totalPoints / completedMatches.length).toFixed(1));
      }
      
      let topScorer = null;
      try {
        const playersWithStats = await playerService.getPlayersWithStatistics({ 
          leagueId: leagueId 
        });
        
        if (playersWithStats && playersWithStats.length > 0) {
          const topPlayer = playersWithStats.reduce((max, player) => {
            const playerPPG = player.stats?.pointsPerGame || 0;
            const maxPPG = max.stats?.pointsPerGame || 0;
            return playerPPG > maxPPG ? player : max;
          }, playersWithStats[0]);
          
          if (topPlayer && topPlayer.stats?.pointsPerGame > 0) {
            const playerName = topPlayer.name || 'Unknown Player';
            const shortName = playerName.split(' ').map(n => n[0]).join('. ') || playerName.substring(0, 10);
            topScorer = `${shortName} (${topPlayer.stats.pointsPerGame} PPG)`;
          }
        }
      } catch (err) {
        console.error('Error loading top scorer:', err);
      }
      
      const selectedLeague = leagues.find(l => l.id === leagueId);
      const teamsCompeting = selectedLeague?.currentTeams || 0;
      
      const uniqueVenues = new Set(
        leagueMatches
          .filter(match => match.venue)
          .map(match => match.venue)
      );
      const venuesCount = uniqueVenues.size;
      
      setLeagueStats({
        totalGamesPlayed,
        averagePointsPerGame,
        topScorer,
        teamsCompeting,
        venuesCount
      });
    } catch (err) {
      console.error('Error loading league statistics:', err);
      setLeagueStats({
        totalGamesPlayed: 0,
        averagePointsPerGame: 0,
        topScorer: null,
        teamsCompeting: 0,
        venuesCount: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadLeagues = async () => {
    try {
      const leaguesData = await leagueService.getAll();
      setLeagues(leaguesData || []);
      
      if (leaguesData && leaguesData.length > 0) {
        const firstLeague = leaguesData[0];
        setSelectedLeagueId(firstLeague.id);
        setSelectedSeason(firstLeague.season || '2024-25');
        loadLeagueStatistics(firstLeague.id);
      }
    } catch (err) {
      console.error('Error loading leagues:', err);
      setError(err.message || 'Failed to load leagues');
    }
  };

  useEffect(() => {
    document.title = 'Public League Portal - TBF Registration System';
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeagueId) {
      loadFixturesAndResults(selectedLeagueId);
    } else {
      loadFixturesAndResults();
    }
  }, [selectedLeagueId]);

  useEffect(() => {
    if (selectedLeagueId) {
      const selectedLeague = leagues.find(l => l.id === selectedLeagueId);
      if (selectedLeague) {
        setSelectedSeason(selectedLeague.season || '2024-25');
      }
      loadStandings(selectedLeagueId);
      loadLeagueStatistics(selectedLeagueId);
    }
  }, [selectedLeagueId, leagues]);

  const handleLeagueChange = (value) => {
    setSelectedLeagueId(value);
  };

  const selectedLeague = leagues.find(league => league.id === selectedLeagueId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-primary">TBF League Portal</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Follow your favorite teams, check standings, and stay updated with the latest results.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin-dashboard">
              <Button variant="outline" iconName="LayoutDashboard">
                Admin Dashboard
              </Button>
            </Link>
            <Button variant="default" iconName="User">
              My Profile
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={18} />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* League Selector */}
        <div className="mb-8">
          <SearchAndFilters
            leagues={leagues}
            selectedLeagueId={selectedLeagueId}
            onLeagueChange={handleLeagueChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={setFilters}
            isLoadingLeagues={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={48} className="text-primary animate-spin" />
            <p className="text-muted-foreground ml-4">Loading league data...</p>
          </div>
        ) : !selectedLeagueId ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border card-shadow">
            <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No League Selected</h3>
            <p className="text-muted-foreground">Please select a league to view its details.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* League Overview Card */}
              <div className="bg-card rounded-lg border border-border card-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedLeague?.name}</h2>
                    <p className="text-muted-foreground">{selectedLeague?.season}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                      selectedLeague?.leagueStatus === 'active'
                        ? 'bg-success/10 text-success'
                        : selectedLeague?.leagueStatus === 'upcoming'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {selectedLeague?.leagueStatus || 'upcoming'}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{selectedLeague?.description || 'No description available.'}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <Icon name="CalendarDays" size={20} className="text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{formatShortDate(selectedLeague?.startDate)}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <Icon name="CalendarX" size={20} className="text-destructive mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="font-medium text-foreground">{formatShortDate(selectedLeague?.endDate)}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <Icon name="Users" size={20} className="text-accent mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Teams</p>
                    <p className="font-medium text-foreground">{leagueStats.teamsCompeting} / {selectedLeague?.maxTeams}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <Icon name="Basketball" size={20} className="text-success mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Games Played</p>
                    <p className="font-medium text-foreground">{leagueStats.totalGamesPlayed}</p>
                  </div>
                </div>
              </div>

              {/* League Standings */}
              <LeagueStandings 
                standings={standingsData} 
                selectedSeason={selectedSeason} 
                leagues={leagues}
                selectedLeagueId={selectedLeagueId}
                onLeagueChange={handleLeagueChange}
                isLoading={isLoadingStandings}
              />

              {/* Upcoming Fixtures */}
              <UpcomingFixtures fixtures={upcomingFixtures} isLoading={isLoading} />

              {/* Recent Results */}
              <RecentResults results={recentResults} isLoading={isLoading} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* League Statistics */}
              <div className="bg-card rounded-lg border border-border card-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">League Statistics</h2>
                  <Icon name="BarChart3" size={20} className="text-muted-foreground" />
                </div>
                {isLoadingStats ? (
                  <div className="py-8 text-center">
                    <Icon name="Loader2" size={28} className="text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-muted-foreground">Loading statistics...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Total Games Played</p>
                      <p className="font-medium text-foreground">{leagueStats.totalGamesPlayed}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Avg. Points per Game</p>
                      <p className="font-medium text-foreground">{leagueStats.averagePointsPerGame}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Top Scorer</p>
                      <p className="font-medium text-foreground">{leagueStats.topScorer || 'N/A'}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Teams Competing</p>
                      <p className="font-medium text-foreground">{leagueStats.teamsCompeting}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Unique Venues</p>
                      <p className="font-medium text-foreground">{leagueStats.venuesCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLeaguePortal;

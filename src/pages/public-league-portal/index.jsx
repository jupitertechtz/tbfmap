import React, { useState, useEffect } from 'react';
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
  const [standingsData, setStandingsData] = useState([]);
  const [leagueStats, setLeagueStats] = useState({
    totalGamesPlayed: 0,
    averagePointsPerGame: 0,
    topScorer: null,
    teamsCompeting: 0,
    venuesCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState(null);





  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Implement filter logic here
  };

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    // Implement season change logic here
  };

  useEffect(() => {
    document.title = 'Public League Portal - TBF Registration System';
    loadLeagues();
  }, []);

  // Reload fixtures and results when league changes
  useEffect(() => {
    if (selectedLeagueId) {
      loadFixturesAndResults(selectedLeagueId);
    } else {
      loadFixturesAndResults();
    }
  }, [selectedLeagueId]);

  // Load league statistics
  const loadLeagueStatistics = async (leagueId) => {
    setIsLoadingStats(true);
    try {
      // Get all matches for this league
      const allMatches = await matchService.getAll();
      const leagueMatches = allMatches.filter(match => match.leagueId === leagueId);
      
      // Calculate total games played (completed matches)
      const completedMatches = leagueMatches.filter(match => 
        match.matchStatus === 'completed' && 
        match.homeScore !== null && 
        match.awayScore !== null
      );
      const totalGamesPlayed = completedMatches.length;
      
      // Calculate average points per game
      let averagePointsPerGame = 0;
      if (completedMatches.length > 0) {
        const totalPoints = completedMatches.reduce((sum, match) => {
          return sum + (match.homeScore || 0) + (match.awayScore || 0);
        }, 0);
        averagePointsPerGame = Number((totalPoints / completedMatches.length).toFixed(1));
      }
      
      // Get top scorer from player statistics
      let topScorer = null;
      try {
        const playersWithStats = await playerService.getPlayersWithStatistics({ 
          leagueId: leagueId 
        });
        
        if (playersWithStats && playersWithStats.length > 0) {
          // Find player with highest points per game
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
        // Continue without top scorer if there's an error
      }
      
      // Get number of teams in league
      const selectedLeague = leagues.find(l => l.id === leagueId);
      const teamsCompeting = selectedLeague?.currentTeams || 0;
      
      // Get unique venues count
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
      // Set default values on error
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

  // Load leagues when component mounts
  const loadLeagues = async () => {
    try {
      const leaguesData = await leagueService.getAll();
      setLeagues(leaguesData || []);
      
      // Set first league as selected if available
      if (leaguesData && leaguesData.length > 0) {
        const firstLeague = leaguesData[0];
        setSelectedLeagueId(firstLeague.id);
        setSelectedSeason(firstLeague.season || '2024-25');
        // Load statistics for the first league
        loadLeagueStatistics(firstLeague.id);
      }
    } catch (err) {
      console.error('Error loading leagues:', err);
      setError(err.message || 'Failed to load leagues');
    }
  };

  // Load standings and statistics when league changes
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

  const loadStandings = async (leagueId) => {
    setIsLoadingStandings(true);
    try {
      const standings = await leagueService.getStandings(leagueId);
      
      // Transform database format to component format
      const transformedStandings = standings.map((standing) => {
        // Calculate league points according to FIBA guidelines:
        // - Win = 2 points
        // - Loss = 1 point
        // - Forfeit (by the team) = 0 points (instead of 1 point for loss)
        // Note: Forfeits are not yet tracked separately in the database
        // When forfeit tracking is added, subtract: (forfeits * 1) from the calculation
        const wins = standing.wins || 0;
        const losses = standing.losses || 0;
        // FIBA points: (wins * 2) + (losses * 1)
        // If forfeits are tracked: (wins * 2) + (losses * 1) - (forfeits * 1)
        const leaguePoints = (wins * 2) + (losses * 1);
        
        return {
          id: standing.teamId || standing.id,
          name: standing.team?.name || 'Unknown Team',
          shortName: standing.team?.shortName || 'N/A',
          logo: standing.team?.logoUrl || '/assets/images/no_image.png',
          logoAlt: `${standing.team?.name || 'Team'} logo`,
          gamesPlayed: standing.gamesPlayed || 0,
          wins: wins,
          losses: losses,
          points: leaguePoints,
          pointsDiff: standing.pointDifference || 0,
          position: standing.position, // Keep position for sorting
          form: '-----', // TODO: Calculate from recent matches
          positionChange: 0 // TODO: Calculate position change
        };
      });
      
      // Sort by position if available, otherwise by points (descending), then by point difference
      transformedStandings.sort((a, b) => {
        // If positions are available, sort by position
        if (a.position !== null && a.position !== undefined && b.position !== null && b.position !== undefined) {
          return a.position - b.position;
        }
        
        // Otherwise sort by points (descending), then by point difference
        if (a.points !== b.points) {
          return b.points - a.points;
        }
        return (b.pointsDiff || 0) - (a.pointsDiff || 0);
      });
      
      setStandingsData(transformedStandings);
    } catch (err) {
      console.error('Error loading standings:', err);
      setError(err.message || 'Failed to load standings');
      setStandingsData([]);
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
          record: 'N/A' // Could calculate from standings if needed
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
      // Only include matches where:
      // 1. Match has scores (completed)
      // 2. Match day has passed (scheduled date is in the past)
      // 3. Match status indicates completion
      const completed = allMatches
        .filter(match => {
          const hasScores = match.homeScore !== null && match.homeScore !== undefined &&
                           match.awayScore !== null && match.awayScore !== undefined;
          
          // Check if match day has passed
          const matchDate = match.scheduledDate ? new Date(match.scheduledDate) : null;
          const matchDayHasPassed = matchDate ? matchDate < now : false;
          
          // Check if match is marked as completed
          const isCompletedStatus = match.matchStatus === 'Final' || 
                                    match.matchStatus === 'Completed' || 
                                    match.matchStatus === 'completed';
          
          // Include only if:
          // - Has scores AND (match day has passed OR status is completed)
          // This ensures we don't show future games even if they accidentally have scores
          return hasScores && (matchDayHasPassed || isCompletedStatus);
        })
        .sort((a, b) => {
          // Sort by ended date if available, otherwise by scheduled date
          const dateA = a.endedAt ? new Date(a.endedAt) : (a.scheduledDate ? new Date(a.scheduledDate) : new Date(0));
          const dateB = b.endedAt ? new Date(b.endedAt) : (b.scheduledDate ? new Date(b.scheduledDate) : new Date(0));
          return dateB - dateA; // Most recent first
        });
      // Show all completed matches (no limit)
      
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
        } else if (match.endedAt && match.scheduledDate && new Date(match.endedAt) > new Date(match.scheduledDate)) {
          highlight = 'overtime';
        }
        
        return {
          id: match.id,
          date: match.endedAt || match.scheduledDate,
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
          overtime: false, // Could check if match duration exceeded normal time
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Icon name="Trophy" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold">Tanzania Basketball Federation</h1>
            </div>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Official League Portal - Follow your favorite teams and players
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Calendar" size={16} />
                <span>Season {selectedSeason}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Users" size={16} />
                <span>{leagueStats.teamsCompeting || 0} Teams Competing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="MapPin" size={16} />
                <span>{leagueStats.venuesCount || 0} Venues Across Tanzania</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <SearchAndFilters
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          selectedSeason={selectedSeason}
          onSeasonChange={handleSeasonChange} />


        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
          { label: 'Team Profiles', path: '/team-profiles', icon: 'Users', color: 'bg-primary' },
          { label: 'Player Stats', path: '/player-statistics', icon: 'BarChart3', color: 'bg-success' },
          { label: 'Match Center', path: '/match-center', icon: 'Calendar', color: 'bg-accent' },
          { label: 'League Information', path: '/games-management', icon: 'Settings', color: 'bg-secondary' }]?.
          map((item) =>
          <Link
            key={item?.path}
            to={item?.path}
            className="group p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all micro-interaction">

              <div className={`w-12 h-12 ${item?.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon name={item?.icon} size={24} color="white" />
              </div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {item?.label}
              </h3>
            </Link>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Standings and Fixtures */}
          <div className="lg:col-span-2 space-y-8">
            <LeagueStandings 
              standings={standingsData} 
              selectedSeason={selectedSeason}
              leagues={leagues}
              selectedLeagueId={selectedLeagueId}
              onLeagueChange={setSelectedLeagueId}
              isLoading={isLoadingStandings}
            />
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={48} className="text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
                <p>{error}</p>
              </div>
            ) : (
              <>
                <UpcomingFixtures fixtures={upcomingFixtures} />
                <RecentResults results={recentResults} />
              </>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Tanzania Basketball Portal Card */}
            <div className="bg-card rounded-lg border border-border card-shadow p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tanzania Basketball Portal</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Welcome to the official Tanzania Basketball Federation registration and management system. 
                  This secure portal provides role-based access for administrators, team managers, players, 
                  and game officials.
                </p>
                <p>
                  All data is encrypted and protected according to Tanzania's data protection standards. 
                  Your information is safe and secure with us.
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-card rounded-lg border border-border card-shadow p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">League Statistics</h3>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Icon name="Loader2" size={24} className="text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Total Games Played', value: leagueStats.totalGamesPlayed.toString(), icon: 'Calendar' },
                    { label: 'Average Points Per Game', value: leagueStats.averagePointsPerGame.toString(), icon: 'Target' },
                    { label: 'Top Scorer', value: leagueStats.topScorer || 'N/A', icon: 'Star' },
                    { label: 'Teams Competing', value: leagueStats.teamsCompeting.toString(), icon: 'Users' }
                  ].map((stat) =>
                    <div key={stat?.label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name={stat?.icon} size={16} className="text-primary" />
                        <span className="text-sm text-muted-foreground">{stat?.label}</span>
                      </div>
                      <span className="font-medium text-foreground">{stat?.value}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="bg-card rounded-lg border border-border card-shadow p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Follow TBF</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Facebook" size={16} className="text-primary" />
                    <span className="text-sm text-foreground">Facebook</span>
                  </div>
                  <span className="text-sm text-muted-foreground">@tzbasketball</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Twitter" size={16} className="text-primary" />
                    <span className="text-sm text-foreground">Twitter</span>
                  </div>
                  <span className="text-sm text-muted-foreground">@tzbasketball</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Instagram" size={16} className="text-primary" />
                    <span className="text-sm text-foreground">Instagram</span>
                  </div>
                  <span className="text-sm text-muted-foreground">@tzbball</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-muted/30 rounded-lg p-8">
          <div className="flex items-center justify-center">
            <Link to="/login">
              <Button variant="default" size="lg" iconName="LogIn" iconPosition="left">
                Management Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>);

};

export default PublicLeaguePortal;
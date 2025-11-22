import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { leagueService } from '../../services/leagueService';
import { matchService } from '../../services/matchService';
import { teamService } from '../../services/teamService';
import Icon from '../../components/AppIcon';
import MatchCenterFilterHeader from './components/MatchCenterFilterHeader';
import MatchResultCard from './components/MatchResultCard';
import MatchStatisticsPanel from './components/MatchStatisticsPanel';

const MatchCenter = () => {
  const { isAuthenticated } = useAuth();
  
  // Filter states
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // Data states
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    loadLeagues();
    loadTeams();
    loadMatches();
  }, []);

  const loadLeagues = async () => {
    try {
      const data = await leagueService.getAll();
      setLeagues(data || []);
    } catch (err) {
      console.error('Error loading leagues:', err);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await teamService.getAll();
      setTeams(data || []);
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  };

  const loadMatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchService.getAll();
      setAllMatches(data || []);
    } catch (err) {
      console.error('Error loading matches:', err);
      setError(err.message || 'Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to matches
  const filteredMatches = useMemo(() => {
    let filtered = [...allMatches];

    // Filter by league
    if (selectedLeague && selectedLeague !== 'all') {
      filtered = filtered.filter(match => match.leagueId === selectedLeague);
    }

    // Filter by season
    if (selectedSeason && selectedSeason !== 'all') {
      filtered = filtered.filter(match => {
        const league = leagues.find(l => l.id === match.leagueId);
        return league?.season === selectedSeason;
      });
    }

    // Filter by team
    if (selectedTeam && selectedTeam !== 'all') {
      filtered = filtered.filter(match => 
        match.homeTeamId === selectedTeam || match.awayTeamId === selectedTeam
      );
    }

    // Filter by date range
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(match => {
        if (!match.scheduledDate) return false;
        const matchDate = new Date(match.scheduledDate);
        return matchDate >= startDate;
      });
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(match => {
        if (!match.scheduledDate) return false;
        const matchDate = new Date(match.scheduledDate);
        return matchDate <= endDate;
      });
    }

    // Sort by date (most recent first for completed, upcoming first for scheduled)
    filtered.sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
      const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
      
      // Live matches first
      if (a.matchStatus === 'live' && b.matchStatus !== 'live') return -1;
      if (b.matchStatus === 'live' && a.matchStatus !== 'live') return 1;
      
      // Then scheduled (upcoming first)
      if (a.matchStatus === 'scheduled' && b.matchStatus === 'scheduled') {
        return dateA - dateB;
      }
      
      // Then completed (most recent first)
      if (a.matchStatus === 'completed' && b.matchStatus === 'completed') {
        return dateB - dateA;
      }
      
      return dateB - dateA;
    });

    return filtered;
  }, [allMatches, selectedLeague, selectedSeason, selectedTeam, dateRange, leagues]);

  // Group matches by status
  const groupedMatches = useMemo(() => {
    const live = filteredMatches.filter(m => m.matchStatus === 'live');
    const scheduled = filteredMatches.filter(m => m.matchStatus === 'scheduled');
    const completed = filteredMatches.filter(m => m.matchStatus === 'completed');
    
    return { live, scheduled, completed };
  }, [filteredMatches]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (isAuthenticated) {
      return [
        { label: 'Dashboard', path: '/admin-dashboard' },
        { label: 'Match Center', path: '/match-center' }
      ];
    } else {
      return [
        { label: 'League Portal', path: '/public-league-portal' },
        { label: 'Match Center', path: '/match-center' }
      ];
    }
  }, [isAuthenticated]);

  const handleExport = (format) => {
    // Export functionality can be added here
    console.log('Export matches:', format);
  };

  const handleViewMatchDetails = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseMatchDetails = () => {
    setSelectedMatch(null);
  };

  return (
    <>
      <Helmet>
        <title>Match Center - TBF Registration System</title>
        <meta name="description" content="View match results, live scores, and detailed game statistics for Tanzania Basketball Federation leagues." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Filter Header */}
            <MatchCenterFilterHeader
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onExport={handleExport}
              leagues={leagues}
              teams={teams}
            />

            {/* Loading State */}
            {isLoading ? (
              <div className="bg-card rounded-lg border border-border p-12 card-shadow text-center">
                <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Loading Matches</h3>
                <p className="text-muted-foreground">Fetching match data from database...</p>
              </div>
            ) : error ? (
              <div className="bg-card rounded-lg border border-border p-8 card-shadow text-center">
                <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Data</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content - Match Results */}
                <div className="xl:col-span-2 space-y-8">
                  {/* Live Matches */}
                  {groupedMatches.live.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
                        <h2 className="text-xl font-bold text-foreground">Live Matches</h2>
                        <span className="text-sm text-muted-foreground">({groupedMatches.live.length})</span>
                      </div>
                      <div className="space-y-4">
                        {groupedMatches.live.map((match) => (
                          <MatchResultCard
                            key={match.id}
                            match={match}
                            onViewDetails={handleViewMatchDetails}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scheduled Matches */}
                  {groupedMatches.scheduled.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Icon name="Calendar" size={20} className="text-primary" />
                        <h2 className="text-xl font-bold text-foreground">Upcoming Matches</h2>
                        <span className="text-sm text-muted-foreground">({groupedMatches.scheduled.length})</span>
                      </div>
                      <div className="space-y-4">
                        {groupedMatches.scheduled.map((match) => (
                          <MatchResultCard
                            key={match.id}
                            match={match}
                            onViewDetails={handleViewMatchDetails}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Matches */}
                  {groupedMatches.completed.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Icon name="CheckCircle2" size={20} className="text-success" />
                        <h2 className="text-xl font-bold text-foreground">Match Results</h2>
                        <span className="text-sm text-muted-foreground">({groupedMatches.completed.length})</span>
                      </div>
                      <div className="space-y-4">
                        {groupedMatches.completed.map((match) => (
                          <MatchResultCard
                            key={match.id}
                            match={match}
                            onViewDetails={handleViewMatchDetails}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Matches Found */}
                  {filteredMatches.length === 0 && (
                    <div className="bg-card rounded-lg border border-border p-12 card-shadow text-center">
                      <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Matches Found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search criteria or filters
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar - Match Statistics */}
                <div className="space-y-8">
                  {selectedMatch ? (
                    <MatchStatisticsPanel
                      match={selectedMatch}
                      onClose={handleCloseMatchDetails}
                    />
                  ) : (
                    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Match Statistics</h3>
                      <p className="text-sm text-muted-foreground">
                        Select a match to view detailed statistics
                      </p>
                    </div>
                  )}

                  {/* Quick Stats Summary */}
                  <div className="bg-card rounded-lg border border-border p-6 card-shadow">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Matches</span>
                        <span className="font-medium text-foreground">{filteredMatches.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Live Matches</span>
                        <span className="font-medium text-error">{groupedMatches.live.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Upcoming</span>
                        <span className="font-medium text-primary">{groupedMatches.scheduled.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="font-medium text-success">{groupedMatches.completed.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default MatchCenter;


import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TeamHeader from './components/TeamHeader';
import TeamRoster from './components/TeamRoster';
import TeamStatistics from './components/TeamStatistics';
import RecentMatches from './components/RecentMatches';
import CoachingStaff from './components/CoachingStaff';

import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { teamService } from '../../services/teamService';
import { playerService } from '../../services/playerService';
import { matchService } from '../../services/matchService';

const TeamProfiles = () => {
  const { teamId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');
  
  // Data state
  const [teams, setTeams] = useState([]);
  const [roster, setRoster] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for teams (fallback)
  const mockTeams = [
  {
    id: 1,
    name: "Dar es Salaam Warriors",
    fullName: "Dar es Salaam Warriors Basketball Club",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1473cd586-1762959935343.png",
    logoAlt: "Dar es Salaam Warriors logo featuring a fierce warrior mascot in red and gold colors",
    primaryColor: "#DC2626",
    secondaryColor: "#F59E0B",
    foundedYear: 2015,
    homeVenue: "National Indoor Stadium",
    league: "Premier League",
    currentPosition: 2,
    wins: 18,
    losses: 7,
    winPercentage: 72
  },
  {
    id: 2,
    name: "Mwanza Lakers",
    fullName: "Mwanza Lakers Basketball Association",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1883e5933-1762959935903.png",
    logoAlt: "Mwanza Lakers logo with blue and yellow lake-themed design featuring basketball elements",
    primaryColor: "#1D4ED8",
    secondaryColor: "#FBBF24",
    foundedYear: 2012,
    homeVenue: "Mwanza Sports Complex",
    league: "Premier League",
    currentPosition: 1,
    wins: 22,
    losses: 3,
    winPercentage: 88
  },
  {
    id: 3,
    name: "Arusha Eagles",
    fullName: "Arusha Eagles Basketball Club",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1b7f6c76b-1762959937379.png",
    logoAlt: "Arusha Eagles logo featuring a soaring eagle in green and white with mountain silhouette",
    primaryColor: "#059669",
    secondaryColor: "#FFFFFF",
    foundedYear: 2018,
    homeVenue: "Arusha Municipal Hall",
    league: "Premier League",
    currentPosition: 4,
    wins: 14,
    losses: 11,
    winPercentage: 56
  }];


  // Mock roster data
  const mockRoster = [
  {
    id: 1,
    name: "James Mwalimu",
    position: "Point Guard",
    jerseyNumber: 7,
    height: "6\'2\"",
    weight: "180 lbs",
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1c5746a0d-1762273807933.png",
    photoAlt: "Professional headshot of James Mwalimu, young African basketball player with short hair in team uniform",
    status: "Active",
    stats: { ppg: 15.2, rpg: 4.1, apg: 8.3 }
  },
  {
    id: 2,
    name: "Michael Kiprotich",
    position: "Shooting Guard",
    jerseyNumber: 23,
    height: "6\'4\"",
    weight: "195 lbs",
    photo: "https://images.unsplash.com/photo-1675975868366-185d8670ea60",
    photoAlt: "Athletic portrait of Michael Kiprotich, tall basketball player with determined expression in red jersey",
    status: "Active",
    stats: { ppg: 18.7, rpg: 3.8, apg: 2.9 }
  },
  {
    id: 3,
    name: "David Mwangi",
    position: "Small Forward",
    jerseyNumber: 15,
    height: "6\'6\"",
    weight: "210 lbs",
    photo: "https://images.unsplash.com/photo-1634064703665-ef0c38996b12",
    photoAlt: "Action shot of David Mwangi, versatile forward player with athletic build in team colors",
    status: "Injured",
    stats: { ppg: 12.4, rpg: 6.7, apg: 3.2 }
  },
  {
    id: 4,
    name: "Emmanuel Nyong\'o",
    position: "Power Forward",
    jerseyNumber: 32,
    height: "6\'8\"",
    weight: "230 lbs",
    photo: "https://images.unsplash.com/photo-1654000684527-e48f3eb2d2e7",
    photoAlt: "Strong portrait of Emmanuel Nyong'o, powerful forward with confident smile in basketball uniform",
    status: "Active",
    stats: { ppg: 14.1, rpg: 9.3, apg: 1.8 }
  },
  {
    id: 5,
    name: "Joseph Makena",
    position: "Center",
    jerseyNumber: 44,
    height: "6\'10\"",
    weight: "250 lbs",
    photo: "https://images.unsplash.com/photo-1675975868366-185d8670ea60",
    photoAlt: "Imposing photo of Joseph Makena, tall center player with serious expression in team jersey",
    status: "Active",
    stats: { ppg: 11.8, rpg: 11.2, apg: 1.4 }
  }];


  // Mock recent matches
  const mockMatches = [
  {
    id: 1,
    opponent: "Mbeya Thunder",
    date: "2024-11-10",
    venue: "National Indoor Stadium",
    isHome: true,
    teamScore: 89,
    opponentScore: 82,
    result: "Win",
    highlights: ["James Mwalimu: 22 pts, 9 ast", "Michael Kiprotich: 18 pts"]
  },
  {
    id: 2,
    opponent: "Dodoma Capitals",
    date: "2024-11-07",
    venue: "Dodoma Sports Hall",
    isHome: false,
    teamScore: 76,
    opponentScore: 84,
    result: "Loss",
    highlights: ["Emmanuel Nyong'o: 16 pts, 12 reb"]
  },
  {
    id: 3,
    opponent: "Mwanza Lakers",
    date: "2024-11-03",
    venue: "National Indoor Stadium",
    isHome: true,
    teamScore: 94,
    opponentScore: 91,
    result: "Win",
    highlights: ["Michael Kiprotich: 28 pts", "Joseph Makena: 14 reb"]
  }];






  const leagueOptions = [
  { value: 'all', label: 'All Leagues' },
  { value: 'premier', label: 'Premier League' },
  { value: 'division1', label: 'Division 1' },
  { value: 'division2', label: 'Division 2' }];


  const tabs = [
  { id: 'overview', label: 'Overview', icon: 'Home' },
  { id: 'roster', label: 'Roster', icon: 'Users' },
  { id: 'statistics', label: 'Statistics', icon: 'BarChart3' },
  { id: 'matches', label: 'Matches', icon: 'Calendar' },
  { id: 'staff', label: 'Staff', icon: 'UserCheck' }];


  // Fetch teams list
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await teamService.getAll();
        setTeams(teamsData);
        
        // Get team from URL params or search params
        const teamIdFromUrl = teamId || searchParams?.get('team');
        const team = teamsData?.find((t) => t?.id === teamIdFromUrl) || teamsData?.[0];
        setSelectedTeam(team);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError(err?.message);
        // Fallback to mock data
        setTeams(mockTeams);
        const teamIdFromUrl = teamId || searchParams?.get('team');
        const team = mockTeams?.find((t) => t?.id === teamIdFromUrl) || mockTeams?.[0];
        setSelectedTeam(team);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [teamId, searchParams]);

  // Fetch team data when selected team changes
  useEffect(() => {
    if (!selectedTeam?.id) return;

    const fetchTeamData = async () => {
      try {
        // Fetch roster
        const rosterData = await playerService.getByTeam(selectedTeam.id);
        setRoster(rosterData);

        // Fetch matches
        const matchesData = await teamService.getTeamMatches(selectedTeam.id);
        setMatches(matchesData);

        // Fetch standings
        const standingsData = await teamService.getTeamStandings(selectedTeam.id);
        setStandings(standingsData);
      } catch (err) {
        console.error('Failed to fetch team data:', err);
      }
    };

    fetchTeamData();
  }, [selectedTeam?.id]);

  // Get active tab from search params
  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab');
    if (tabFromUrl && tabs?.find((t) => t?.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTeamChange = (teamId) => {
    const team = teams?.find((t) => t?.id === teamId);
    setSelectedTeam(team);
    setSearchParams({ team: teamId, tab: activeTab });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({
      team: selectedTeam?.id || teams?.[0]?.id,
      tab: tabId
    });
  };

  // Map roster data to component format
  const mappedRoster = roster?.map((player) => {
    // Use playerService helper to get the correct photo URL with fallbacks
    const photoUrl = playerService.getPlayerPhotoUrl(player);
    
    return {
      ...player, // Include all player data for TeamRoster component
      id: player?.id,
      name: player?.userProfile?.fullName || 'Unknown Player',
      position: player?.playerPosition?.replace('_', ' ')?.replace(/\b\w/g, l => l?.toUpperCase()) || 'N/A',
      jerseyNumber: player?.jerseyNumber || 0,
      height: player?.heightCm ? `${Math.floor(player?.heightCm / 30.48)}'${Math.round((player?.heightCm % 30.48) / 2.54)}"` : 'N/A',
      weight: player?.weightKg ? `${Math.round(player?.weightKg * 2.20462)} lbs` : 'N/A',
      photoUrl: photoUrl, // Use the resolved photo URL
      photo: photoUrl, // Keep for backward compatibility
      photoAlt: `Photo of ${player?.userProfile?.fullName || 'player'}`,
      status: player?.playerStatus?.charAt(0)?.toUpperCase() + player?.playerStatus?.slice(1) || 'Active',
      stats: { ppg: 0, rpg: 0, apg: 0 } // TODO: Calculate from player statistics
    };
  }) || [];

  // Map matches data to component format
  const mappedMatches = matches?.map((match) => ({
    id: match?.id,
    opponent: match?.opponent?.name || 'Unknown Team',
    date: match?.scheduledDate,
    venue: match?.venue || 'TBD',
    isHome: match?.isHome,
    teamScore: match?.teamScore || 0,
    opponentScore: match?.opponentScore || 0,
    result: match?.result || (match?.matchStatus === 'completed' ? 'Tie' : null),
    highlights: [] // TODO: Extract from match events
  })) || [];

  // Get primary standing for selected team (must be defined before mappedStatistics)
  const primaryStanding = standings?.find(s => s?.teamId === selectedTeam?.id) || standings?.[0];

  // Map standings to statistics format
  const formatShortDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const buildPerformanceTrend = (completedMatches = []) => {
    if (!completedMatches?.length) return [];
    const trendMap = new Map();
    completedMatches.forEach((match) => {
      if (!match?.scheduledDate) return;
      const monthKey = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(match.scheduledDate));
      const existing = trendMap.get(monthKey) || { month: monthKey, wins: 0, losses: 0 };
      if (match?.result === 'Win') {
        existing.wins += 1;
      } else if (match?.result === 'Loss') {
        existing.losses += 1;
      }
      trendMap.set(monthKey, existing);
    });
    return Array.from(trendMap.values()).slice(-6);
  };

  const buildScoringTrend = (completedMatches = []) => {
    if (!completedMatches?.length) return [];
    const recent = completedMatches.slice(0, 8).reverse();
    return recent.map((match, index) => ({
      game: match?.scheduledDate ? formatShortDate(match.scheduledDate) : `Game ${recent.length - index}`,
      scored: match?.teamScore ?? 0,
      allowed: match?.opponentScore ?? 0,
    }));
  };

  const buildRecentMatchesSummary = (completedMatches = []) => {
    if (!completedMatches?.length) return [];
    return completedMatches.slice(0, 5).map((match) => ({
      id: match?.id,
      opponent: match?.opponent?.name || 'Unknown Team',
      date: formatShortDate(match?.scheduledDate),
      result: match?.result || 'N/A',
      score: `${match?.teamScore ?? 0} - ${match?.opponentScore ?? 0}`,
    }));
  };

  const mappedStatistics = useMemo(() => {
    if (!selectedTeam) return null;

    // Filter completed matches with actual scores from match fixtures
    const completedMatches = (matches || []).filter(
      (match) => {
        // Check if match has valid scores
        const hasScores = match?.teamScore !== null &&
                         match?.teamScore !== undefined &&
                         match?.opponentScore !== null &&
                         match?.opponentScore !== undefined &&
                         typeof match?.teamScore === 'number' &&
                         typeof match?.opponentScore === 'number';
        
        // Check if match is completed (by status or by having scores)
        const isCompleted = match?.matchStatus === 'completed' || 
                           match?.matchStatus === 'Final' || 
                           match?.matchStatus === 'Completed' ||
                           hasScores; // Include matches with scores even if status wasn't updated
        
        return hasScores && isCompleted;
      }
    );

    // If no completed matches, return null
    if (completedMatches.length === 0) {
      return null;
    }

    // Calculate all statistics directly from actual match results
    const totalGames = completedMatches.length;
    const wins = completedMatches.filter((match) => match?.result === 'Win').length;
    const losses = completedMatches.filter((match) => match?.result === 'Loss').length;
    const ties = completedMatches.filter((match) => match?.result === 'Tie').length;
    
    // Calculate points from actual match scores
    const pointsFor = completedMatches.reduce((sum, match) => sum + (match?.teamScore || 0), 0);
    const pointsAgainst = completedMatches.reduce((sum, match) => sum + (match?.opponentScore || 0), 0);
    const pointDifference = pointsFor - pointsAgainst;
    
    // Calculate percentages and averages
    const winPercentage = totalGames > 0 ? Number(((wins / totalGames) * 100).toFixed(1)) : 0;
    const pointsPerGame = totalGames > 0 ? Number((pointsFor / totalGames).toFixed(1)) : 0;
    const pointsAllowedPerGame = totalGames > 0 ? Number((pointsAgainst / totalGames).toFixed(1)) : 0;
    
    // Use league position from standings if available, but calculate everything else from matches
    const primary = primaryStanding;

    const performanceTrend = buildPerformanceTrend(completedMatches);
    const scoringTrend = buildScoringTrend(completedMatches);
    const recentMatchesSummary = buildRecentMatchesSummary(completedMatches);

    const homeRecord = {
      wins: completedMatches.filter((match) => match?.isHome && match?.result === 'Win').length,
      losses: completedMatches.filter((match) => match?.isHome && match?.result === 'Loss').length,
    };

    const awayRecord = {
      wins: completedMatches.filter((match) => !match?.isHome && match?.result === 'Win').length,
      losses: completedMatches.filter((match) => !match?.isHome && match?.result === 'Loss').length,
    };

    return {
      gamesPlayed: totalGames,
      wins,
      losses,
      ties, // Include ties in statistics
      winPercentage,
      pointsPerGame,
      pointsAllowedPerGame,
      pointDifference,
      pointsFor, // Total points scored
      pointsAgainst, // Total points allowed
      leaguePosition: primary?.position || null, // League position from standings
      performanceTrend,
      scoringTrend,
      homeRecord,
      awayRecord,
      recentMatches: recentMatchesSummary,
    };
  }, [matches, primaryStanding, selectedTeam]);

  // Map team data to staff format for CoachingStaff component
  const mappedStaff = React.useMemo(() => {
    if (!selectedTeam) return [];
    
    const staff = [];
    
    // Add Head Coach
    if (selectedTeam?.coachName) {
      staff.push({
        id: `coach-${selectedTeam?.id}`,
        name: selectedTeam?.coachName,
        role: 'Head Coach',
        photo: selectedTeam?.teamManager?.avatarUrl || '/assets/images/no_image.png',
        photoAlt: `Photo of ${selectedTeam?.coachName}, Head Coach`,
        experience: 0, // Not stored in database, default to 0
        email: selectedTeam?.coachEmail || null,
        certifications: selectedTeam?.coachLicense ? [selectedTeam?.coachLicense] : [],
        achievements: []
      });
    }
    
    // Add Team Manager
    if (selectedTeam?.teamManager) {
      staff.push({
        id: `manager-${selectedTeam?.teamManager?.id}`,
        name: selectedTeam?.teamManager?.fullName || 'Team Manager',
        role: 'Team Manager',
        photo: selectedTeam?.teamManager?.avatarUrl || '/assets/images/no_image.png',
        photoAlt: `Photo of ${selectedTeam?.teamManager?.fullName || 'Team Manager'}`,
        experience: 0, // Not stored in database
        email: selectedTeam?.teamManager?.email || null,
        certifications: [],
        achievements: []
      });
    }
    
    // Add President
    if (selectedTeam?.presidentName) {
      staff.push({
        id: `president-${selectedTeam?.id}`,
        name: selectedTeam?.presidentName,
        role: 'President',
        photo: '/assets/images/no_image.png',
        photoAlt: `Photo of ${selectedTeam?.presidentName}, Team President`,
        experience: 0,
        email: selectedTeam?.presidentEmail || null,
        certifications: [],
        achievements: []
      });
    }
    
    // Add Secretary
    if (selectedTeam?.secretaryName) {
      staff.push({
        id: `secretary-${selectedTeam?.id}`,
        name: selectedTeam?.secretaryName,
        role: 'Secretary',
        photo: '/assets/images/no_image.png',
        photoAlt: `Photo of ${selectedTeam?.secretaryName}, Team Secretary`,
        experience: 0,
        email: selectedTeam?.secretaryEmail || null,
        certifications: [],
        achievements: []
      });
    }
    
    return staff;
  }, [selectedTeam]);

  const filteredTeams = teams?.filter((team) => {
    const matchesSearch = team?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    (team?.shortName && team?.shortName?.toLowerCase()?.includes(searchQuery?.toLowerCase()));
    // Note: League filtering would require joining with league_teams table
    return matchesSearch;
  });

  const breadcrumbItems = [
  { label: 'League Portal', path: '/public-league-portal' },
  { label: 'Team Profiles', path: '/team-profiles' },
  ...(selectedTeam ? [{ label: selectedTeam?.name, path: `/team-profiles/${selectedTeam?.id}` }] : [])];
  
  // Map team data for display with actual team colors and logo
  const mappedTeam = selectedTeam ? {
    id: selectedTeam?.id,
    name: selectedTeam?.name,
    fullName: selectedTeam?.name,
    logo: selectedTeam?.logoUrl || '/assets/images/no_image.png',
    logoAlt: `${selectedTeam?.name} logo`,
    primaryColor: selectedTeam?.primaryColor || '#DC2626', // Use actual team color or default
    secondaryColor: selectedTeam?.secondaryColor || '#F59E0B', // Use actual team color or default
    foundedYear: selectedTeam?.foundedYear,
    homeVenue: selectedTeam?.homeVenue,
    venueAddress: selectedTeam?.venueAddress,
    city: selectedTeam?.city,
    region: selectedTeam?.region,
    category: selectedTeam?.category,
    division: selectedTeam?.division,
    contactEmail: selectedTeam?.contactEmail,
    contactPhone: selectedTeam?.contactPhone,
    website: selectedTeam?.website,
    league: primaryStanding?.league?.name || 'N/A',
    currentPosition: primaryStanding?.position || 0,
    wins: primaryStanding?.wins || 0,
    losses: primaryStanding?.losses || 0,
    winPercentage: primaryStanding?.winPercentage ? parseFloat(primaryStanding?.winPercentage) : 0
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading teams...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="bg-card rounded-lg card-shadow p-8">
              <h1 className="text-3xl font-bold text-foreground mb-6">Team Profiles</h1>
              
              {error && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-warning">{error}</p>
                </div>
              )}
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    className="w-full" />
                </div>
                <div className="w-full sm:w-48">
                  <Select
                    options={leagueOptions}
                    value={selectedLeague}
                    onChange={setSelectedLeague}
                    placeholder="Filter by league" />
                </div>
              </div>

              {/* Teams Grid */}
              {filteredTeams?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeams?.map((team) => {
                    const teamPrimaryColor = team?.primaryColor || '#DC2626';
                    const teamSecondaryColor = team?.secondaryColor || '#F59E0B';
                    
                    return (
                      <div 
                        key={team?.id} 
                        className="bg-card rounded-lg border border-border p-6 micro-interaction hover:shadow-lg transition-all cursor-pointer"
                        style={{
                          borderLeft: `4px solid ${teamPrimaryColor}`
                        }}
                        onClick={() => handleTeamChange(team?.id)}
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div 
                            className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center border-2 shadow-sm"
                            style={{ 
                              backgroundColor: teamPrimaryColor + '20',
                              borderColor: teamPrimaryColor
                            }}
                          >
                            <img
                              src={team?.logoUrl || '/assets/images/no_image.png'}
                              alt={`${team?.name} logo`}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {e.target.src = '/assets/images/no_image.png';}} 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground truncate">{team?.name}</h3>
                            <p className="text-sm text-muted-foreground">{team?.shortName || ''}</p>
                            <p className="text-xs text-muted-foreground">{team?.city || ''} {team?.region || ''}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: teamPrimaryColor }}
                                title={`Primary: ${teamPrimaryColor}`}
                              />
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: teamSecondaryColor }}
                                title={`Secondary: ${teamSecondaryColor}`}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center pt-4 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTeamChange(team?.id);
                            }}
                            className="w-full"
                            style={{
                              borderColor: teamPrimaryColor,
                              color: teamPrimaryColor
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = teamPrimaryColor;
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = teamPrimaryColor;
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No teams found matching your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Team Selection */}
          <div className="mb-6">
            <Select
              options={teams?.map((team) => ({ value: team?.id, label: team?.name }))}
              value={selectedTeam?.id}
              onChange={handleTeamChange}
              placeholder="Select a team"
              className="w-full sm:w-64" />
          </div>

          {/* Team Header */}
          <TeamHeader team={mappedTeam} />

          {/* Navigation Tabs with Team Colors */}
          <div className="bg-card rounded-lg card-shadow mb-6">
            <div className="border-b border-border">
              <nav className="flex overflow-x-auto">
                {tabs?.map((tab) =>
                <button
                  key={tab?.id}
                  onClick={() => handleTabChange(tab?.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab?.id ?
                  'text-white' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'}`
                  }
                  style={activeTab === tab?.id ? {
                    borderBottomColor: mappedTeam?.primaryColor || '#DC2626',
                    backgroundColor: activeTab === tab?.id ? `${mappedTeam?.primaryColor || '#DC2626'}15` : 'transparent'
                  } : {}}
                  >

                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' &&
            <>
                <TeamRoster players={mappedRoster?.slice(0, 8)} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentMatches matches={mappedMatches?.slice(0, 3)} />
                  <TeamStatistics statistics={mappedStatistics} />
                </div>
              </>
            }
            
            {activeTab === 'roster' &&
            <TeamRoster players={mappedRoster} />
            }
            
            {activeTab === 'statistics' &&
            <TeamStatistics statistics={mappedStatistics} />
            }
            
            {activeTab === 'matches' &&
            <RecentMatches matches={mappedMatches} />
            }
            
            {activeTab === 'staff' &&
            <CoachingStaff staff={mappedStaff} />
            }
          </div>
        </div>
      </main>
    </div>);

};

export default TeamProfiles;
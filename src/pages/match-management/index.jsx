import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import GameScoreboard from './components/GameScoreboard';
import PlayerRoster from './components/PlayerRoster';
import GameEventLog from './components/GameEventLog';
import StatisticsPanel from './components/StatisticsPanel';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const MatchManagement = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Check if user has access (admin, staff, or official - but not team_manager)
  const userRole = userProfile?.role;
  const hasAccess = userRole === 'admin' || userRole === 'staff' || userRole === 'official';

  // Redirect team managers and other unauthorized users
  useEffect(() => {
    if (authLoading) return;
    
    if (!hasAccess) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [authLoading, hasAccess, navigate]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for unauthorized users
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="ShieldAlert" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/admin-dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for active matches
  const activeMatches = [
    {
      id: 1,
      homeTeam: { 
        id: 1, 
        name: "Dar es Salaam Warriors", 
        shortName: "DSW", 
        score: 78,
        timeouts: 2,
        teamFouls: 8,
        quarterScores: [18, 22, 20, 18]
      },
      awayTeam: { 
        id: 2, 
        name: "Mwanza Lakers", 
        shortName: "MWL", 
        score: 72,
        timeouts: 1,
        teamFouls: 12,
        quarterScores: [15, 19, 18, 20]
      },
      gameState: {
        status: 'live',
        period: 4,
        timeRemaining: 180,
        venue: "National Indoor Stadium",
        date: "November 12, 2024",
        officials: ["John Mwalimu", "Sarah Kimani", "David Mtoro"]
      }
    },
    {
      id: 2,
      homeTeam: { 
        id: 3, 
        name: "Arusha Eagles", 
        shortName: "ARE", 
        score: 45,
        timeouts: 3,
        teamFouls: 5,
        quarterScores: [12, 15, 18, 0]
      },
      awayTeam: { 
        id: 4, 
        name: "Dodoma Bulls", 
        shortName: "DOB", 
        score: 42,
        timeouts: 2,
        teamFouls: 7,
        quarterScores: [10, 14, 18, 0]
      },
      gameState: {
        status: 'halftime',
        period: 3,
        timeRemaining: 720,
        venue: "Arusha Sports Complex",
        date: "November 12, 2024",
        officials: ["Grace Mollel", "Peter Ngowi"]
      }
    }
  ];

  // Mock player data
  const mockPlayers = {
    1: [ // DSW players
      {
        id: 101,
        name: "James Mwangi",
        jerseyNumber: 23,
        position: "PG",
        isActive: true,
        points: 18,
        rebounds: 4,
        assists: 7,
        fouls: 2,
        playingTime: 28
      },
      {
        id: 102,
        name: "Michael Kiprotich",
        jerseyNumber: 15,
        position: "SG",
        isActive: true,
        points: 22,
        rebounds: 3,
        assists: 2,
        fouls: 1,
        playingTime: 25
      },
      {
        id: 103,
        name: "Emmanuel Mbwana",
        jerseyNumber: 8,
        position: "SF",
        isActive: true,
        points: 14,
        rebounds: 6,
        assists: 3,
        fouls: 3,
        playingTime: 22
      },
      {
        id: 104,
        name: "David Mollel",
        jerseyNumber: 32,
        position: "PF",
        isActive: true,
        points: 12,
        rebounds: 8,
        assists: 1,
        fouls: 4,
        playingTime: 20
      },
      {
        id: 105,
        name: "Joseph Kimario",
        jerseyNumber: 44,
        position: "C",
        isActive: true,
        points: 12,
        rebounds: 9,
        assists: 0,
        fouls: 2,
        playingTime: 18
      },
      {
        id: 106,
        name: "Frank Mushi",
        jerseyNumber: 7,
        position: "PG",
        isActive: false,
        points: 0,
        rebounds: 0,
        assists: 0,
        fouls: 0,
        playingTime: 0
      },
      {
        id: 107,
        name: "Peter Ngowi",
        jerseyNumber: 11,
        position: "SG",
        isActive: false,
        points: 0,
        rebounds: 0,
        assists: 0,
        fouls: 0,
        playingTime: 0
      }
    ],
    2: [ // MWL players
      {
        id: 201,
        name: "Robert Mwalimu",
        jerseyNumber: 10,
        position: "PG",
        isActive: true,
        points: 16,
        rebounds: 2,
        assists: 8,
        fouls: 3,
        playingTime: 26
      },
      {
        id: 202,
        name: "Charles Msigwa",
        jerseyNumber: 24,
        position: "SG",
        isActive: true,
        points: 20,
        rebounds: 4,
        assists: 1,
        fouls: 2,
        playingTime: 24
      },
      {
        id: 203,
        name: "Hassan Juma",
        jerseyNumber: 6,
        position: "SF",
        isActive: true,
        points: 18,
        rebounds: 5,
        assists: 2,
        fouls: 4,
        playingTime: 23
      },
      {
        id: 204,
        name: "Anthony Mwenda",
        jerseyNumber: 21,
        position: "PF",
        isActive: true,
        points: 8,
        rebounds: 7,
        assists: 1,
        fouls: 5,
        playingTime: 19
      },
      {
        id: 205,
        name: "Simon Kiwelu",
        jerseyNumber: 33,
        position: "C",
        isActive: true,
        points: 10,
        rebounds: 10,
        assists: 0,
        fouls: 1,
        playingTime: 21
      },
      {
        id: 206,
        name: "George Mwita",
        jerseyNumber: 5,
        position: "PG",
        isActive: false,
        points: 0,
        rebounds: 0,
        assists: 0,
        fouls: 0,
        playingTime: 0
      }
    ]
  };

  // Mock game statistics
  const mockGameStats = {
    home: {
      points: 78,
      fieldGoalsMade: 28,
      fieldGoalsAttempted: 52,
      threePointersMade: 8,
      threePointersAttempted: 18,
      freeThrowsMade: 14,
      freeThrowsAttempted: 18,
      totalRebounds: 31,
      assists: 13,
      steals: 6,
      blocks: 4,
      turnovers: 12,
      fouls: 18
    },
    away: {
      points: 72,
      fieldGoalsMade: 26,
      fieldGoalsAttempted: 48,
      threePointersMade: 6,
      threePointersAttempted: 15,
      freeThrowsMade: 14,
      freeThrowsAttempted: 20,
      totalRebounds: 28,
      assists: 11,
      steals: 8,
      blocks: 2,
      turnovers: 15,
      fouls: 22
    }
  };

  // Mock game events
  const [gameEvents, setGameEvents] = useState([
    {
      id: 1,
      type: 'timeout',
      timestamp: new Date(Date.now() - 300000)?.toISOString(),
      period: 4,
      timeRemaining: 300,
      description: 'Timeout called by Mwanza Lakers',
      team: 'MWL'
    },
    {
      id: 2,
      type: 'technical',
      timestamp: new Date(Date.now() - 600000)?.toISOString(),
      period: 3,
      timeRemaining: 120,
      description: 'Technical foul on bench',
      team: 'DSW',
      player: 'Coach Mwangi'
    }
  ]);

  // Set default selected match
  useEffect(() => {
    if (activeMatches?.length > 0 && !selectedMatch) {
      setSelectedMatch(activeMatches?.[0]);
    }
  }, [activeMatches, selectedMatch]);

  const handlePlayerAction = (playerId, action, value = 1) => {
    console.log(`Player ${playerId} - ${action}: ${value}`);
    // Here you would update the player statistics
  };

  const handleSubstitution = (playerId) => {
    console.log(`Substitution for player ${playerId}`);
    // Here you would handle player substitution logic
  };

  const handleTimeoutHome = () => {
    if (selectedMatch && selectedMatch?.homeTeam?.timeouts > 0) {
      console.log('Home team timeout');
      // Update timeout count and add event
    }
  };

  const handleTimeoutAway = () => {
    if (selectedMatch && selectedMatch?.awayTeam?.timeouts > 0) {
      console.log('Away team timeout');
      // Update timeout count and add event
    }
  };

  const handleStartStop = () => {
    console.log('Start/Stop game clock');
    // Toggle game clock
  };

  const handlePeriodChange = () => {
    console.log('Change period');
    // Advance to next period
  };

  const handleAddEvent = (event) => {
    setGameEvents(prev => [event, ...prev]);
  };

  const handleQuickAction = (actionId) => {
    console.log(`Quick action: ${actionId}`);
    // Handle various quick actions
  };

  if (!selectedMatch) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} mt-16`}>
            <div className="p-6">
              <Breadcrumb />
              <div className="text-center py-12">
                <Icon name="Calendar" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">No Active Matches</h2>
                <p className="text-muted-foreground mb-6">There are no live matches currently in progress.</p>
                <Button
                  variant="default"
                  onClick={() => navigate('/league-management')}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Schedule New Match
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} mt-16`}>
          <div className="p-6">
            <Breadcrumb />
            
            {/* Match Selection */}
            {activeMatches?.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-foreground">Match Management</h1>
                  <select
                    value={selectedMatch?.id}
                    onChange={(e) => setSelectedMatch(activeMatches?.find(m => m?.id === parseInt(e?.target?.value)))}
                    className="px-3 py-2 border border-border rounded-md bg-input text-foreground"
                  >
                    {activeMatches?.map((match) => (
                      <option key={match?.id} value={match?.id}>
                        {match?.homeTeam?.shortName} vs {match?.awayTeam?.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Left Column - Scoreboard and Actions */}
              <div className="xl:col-span-3 space-y-6">
                {/* Game Scoreboard */}
                <GameScoreboard
                  homeTeam={selectedMatch?.homeTeam}
                  awayTeam={selectedMatch?.awayTeam}
                  gameState={selectedMatch?.gameState}
                  onTimeoutHome={handleTimeoutHome}
                  onTimeoutAway={handleTimeoutAway}
                  onStartStop={handleStartStop}
                  onPeriodChange={handlePeriodChange}
                />

                {/* Player Rosters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PlayerRoster
                    team={selectedMatch?.homeTeam}
                    players={mockPlayers?.[selectedMatch?.homeTeam?.id] || []}
                    onPlayerAction={handlePlayerAction}
                    onSubstitution={handleSubstitution}
                    isHomeTeam={true}
                  />
                  <PlayerRoster
                    team={selectedMatch?.awayTeam}
                    players={mockPlayers?.[selectedMatch?.awayTeam?.id] || []}
                    onPlayerAction={handlePlayerAction}
                    onSubstitution={handleSubstitution}
                    isHomeTeam={false}
                  />
                </div>

                {/* Statistics Panel */}
                <StatisticsPanel
                  homeTeam={selectedMatch?.homeTeam}
                  awayTeam={selectedMatch?.awayTeam}
                  gameStats={mockGameStats}
                />
              </div>

              {/* Right Column - Events and Quick Actions */}
              <div className="space-y-6">
                <QuickActions
                  onAction={handleQuickAction}
                  gameState={selectedMatch?.gameState}
                />
                
                <GameEventLog
                  events={gameEvents}
                  onAddEvent={handleAddEvent}
                  gameState={selectedMatch?.gameState}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MatchManagement;
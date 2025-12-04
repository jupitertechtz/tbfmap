import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { leagueService } from '../../../services/leagueService';
import { matchService } from '../../../services/matchService';

const KnockoutBracket = ({ leagueId, leagueDetails, onClose, onSuccess }) => {
  const [qualifiedTeams, setQualifiedTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [bracketSettings, setBracketSettings] = useState({
    startDate: '',
    venue: '',
    timeSlot: '14:00',
    bracketType: 'single-elimination', // single-elimination, double-elimination
    stageConfigs: [] // Will be populated when bracket is generated
  });
  const [stageConfigs, setStageConfigs] = useState([]); // Stage configurations
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load qualified teams from league standings
  useEffect(() => {
    if (leagueId) {
      loadQualifiedTeams();
    }
  }, [leagueId]);

  const loadQualifiedTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get standings to determine qualified teams
      const standings = await leagueService.getStandings(leagueId);
      
      // Sort by position and get top teams (assuming top teams qualify)
      // You can customize this logic based on your qualification criteria
      const sortedStandings = standings
        .filter(s => s.gamesPlayed > 0) // Only teams that have played
        .sort((a, b) => {
          // Sort by position if available
          if (a.position && b.position) {
            return a.position - b.position;
          }
          // Otherwise sort by points
          const pointsA = (a.wins || 0) * 2 + (a.losses || 0);
          const pointsB = (b.wins || 0) * 2 + (b.losses || 0);
          if (pointsB !== pointsA) return pointsB - pointsA;
          return (b.pointDifference || 0) - (a.pointDifference || 0);
        });

      // Get team details for qualified teams
      const teamsWithDetails = sortedStandings.map(standing => ({
        id: standing.teamId,
        name: standing.team?.name || 'Unknown Team',
        shortName: standing.team?.shortName || 'N/A',
        logoUrl: standing.team?.logoUrl || null,
        position: standing.position,
        points: (standing.wins || 0) * 2 + (standing.losses || 0),
        pointDifference: standing.pointDifference || 0,
        gamesPlayed: standing.gamesPlayed || 0,
        wins: standing.wins || 0,
        losses: standing.losses || 0
      }));

      setQualifiedTeams(teamsWithDetails);
    } catch (err) {
      console.error('Error loading qualified teams:', err);
      setError(err.message || 'Failed to load qualified teams');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTeamSelection = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const generateBracket = () => {
    if (selectedTeams.length < 2) {
      setError('Please select at least 2 teams for the knockout bracket');
      return;
    }

    // Check if number of teams is power of 2, if not, add byes
    const numTeams = selectedTeams.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const numByes = nextPowerOf2 - numTeams;

    // Get selected team details
    const teams = qualifiedTeams.filter(t => selectedTeams.includes(t.id));
    
    // Shuffle teams randomly or keep them in order (you can customize this)
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    // Generate bracket structure (single elimination)
    const rounds = [];
    let currentRound = shuffledTeams.map((team, index) => ({
      id: `match-${index}`,
      team1: team,
      team2: null, // Will be filled in next round
      winner: null,
      matchNumber: index + 1
    }));

    // Add byes if needed
    if (numByes > 0) {
      // Teams with byes advance automatically
      const teamsWithByes = currentRound.slice(0, numByes);
      teamsWithByes.forEach(match => {
        match.team2 = null;
        match.winner = match.team1;
      });
    }

    // Pair up teams for first round
    const firstRoundMatches = [];
    const teamsToPair = currentRound.slice(numByes);
    
    for (let i = 0; i < teamsToPair.length; i += 2) {
      if (i + 1 < teamsToPair.length) {
        firstRoundMatches.push({
          id: `match-${firstRoundMatches.length + 1}`,
          team1: teamsToPair[i].team1,
          team2: teamsToPair[i + 1].team1,
          winner: null,
          matchNumber: firstRoundMatches.length + 1,
          round: 1
        });
      }
    }

    // Add bye matches to first round
    const byeMatches = currentRound.slice(0, numByes).map((match, index) => ({
      id: `match-bye-${index + 1}`,
      team1: match.team1,
      team2: null,
      winner: match.team1,
      matchNumber: firstRoundMatches.length + index + 1,
      round: 1,
      isBye: true
    }));

    rounds.push({
      roundNumber: 1,
      name: 'Round of ' + nextPowerOf2,
      matches: [...firstRoundMatches, ...byeMatches]
    });

    // Generate subsequent rounds
    let roundNumber = 2;
    let previousRoundMatches = rounds[0].matches;
    
    while (previousRoundMatches.length > 1) {
      const nextRoundMatches = [];
      const roundName = previousRoundMatches.length === 2 
        ? 'Final' 
        : previousRoundMatches.length === 4 
        ? 'Semi-Finals' 
        : `Round ${roundNumber}`;

      for (let i = 0; i < previousRoundMatches.length; i += 2) {
        nextRoundMatches.push({
          id: `match-r${roundNumber}-${nextRoundMatches.length + 1}`,
          team1: null, // Winner of previous match
          team2: null, // Winner of previous match
          winner: null,
          matchNumber: nextRoundMatches.length + 1,
          round: roundNumber,
          previousMatch1: previousRoundMatches[i]?.id,
          previousMatch2: previousRoundMatches[i + 1]?.id
        });
      }

      rounds.push({
        roundNumber,
        name: roundName,
        matches: nextRoundMatches
      });

      previousRoundMatches = nextRoundMatches;
      roundNumber++;
    }

    // Initialize stage configurations with default values
    const defaultStageConfigs = rounds.map((round, index) => {
      let defaultName = round.name;
      let defaultGames = 1; // Single game by default
      
      // Set default names and games based on round
      if (round.name === 'Final') {
        defaultName = 'Finals';
        defaultGames = 1;
      } else if (round.name === 'Semi-Finals') {
        defaultName = 'Semi Finals';
        defaultGames = 1;
      } else if (round.matches.length === 4) {
        defaultName = 'Quarter Finals';
        defaultGames = 1;
      } else if (round.matches.length === 2 && rounds.length > 2) {
        // Check if there's a third place match possibility
        defaultName = 'Semi Finals';
        defaultGames = 1;
      }
      
      return {
        roundNumber: round.roundNumber,
        stageName: defaultName,
        numberOfGames: defaultGames, // Best of X (e.g., 3 = best of 3, 5 = best of 5)
        includeThirdPlace: false, // For semi-finals, option to include third place match
        thirdPlaceStageName: 'Third Place', // Name for third place match stage
        thirdPlaceGames: 1, // Number of games for third place match
        alternateHomeAway: defaultGames > 1, // Alternate home/away for series
        gameTimings: defaultGames > 1 
          ? Array.from({ length: defaultGames }, (_, i) => ({
              gameNumber: i + 1,
              time: bracketSettings.timeSlot,
              dateOffset: i // Days offset from series start
            }))
          : [] // Game timings for series
      };
    });

    setStageConfigs(defaultStageConfigs);

    const calculateTotalMatches = (rounds, configs) => {
      return rounds.reduce((sum, round) => {
        const config = configs.find(c => c.roundNumber === round.roundNumber);
        const gamesPerSeries = config?.numberOfGames || 1;
        const numSeries = round.matches.filter(m => !m.isBye).length;
        let total = sum + (numSeries * gamesPerSeries);
        
        // Add third place match if configured
        if (config?.includeThirdPlace && round.matches.length === 2) {
          const thirdPlaceGames = 1; // Default to 1 game for third place
          total += thirdPlaceGames;
        }
        
        return total;
      }, 0);
    };

    setBracket({
      rounds,
      totalMatches: calculateTotalMatches(rounds, defaultStageConfigs),
      startDate: bracketSettings.startDate,
      venue: bracketSettings.venue,
      timeSlot: bracketSettings.timeSlot
    });
  };

  const updateStageConfig = (roundNumber, field, value) => {
    setStageConfigs(prev => prev.map(config => 
      config.roundNumber === roundNumber
        ? { ...config, [field]: value }
        : config
    ));
  };

  const saveBracket = async () => {
    if (!bracket || !leagueId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const matches = [];
      let matchDate = new Date(bracketSettings.startDate);
      let daysOffset = 0;

      // Generate matches for each round
      bracket.rounds.forEach((round, roundIndex) => {
        const stageConfig = stageConfigs.find(c => c.roundNumber === round.roundNumber);
        const stageName = stageConfig?.stageName || round.name;
        const numberOfGames = stageConfig?.numberOfGames || 1;

        round.matches.forEach((match, matchIndex) => {
          // Skip bye matches (they don't need to be created)
          if (match.isBye) return;

          // Create multiple matches for series (best of X)
          const gameTimings = stageConfig.gameTimings || [];
          
          for (let gameNumber = 1; gameNumber <= numberOfGames; gameNumber++) {
            // Get timing configuration for this game
            const gameTiming = gameTimings.find(gt => gt.gameNumber === gameNumber) || {
              gameNumber,
              time: bracketSettings.timeSlot,
              dateOffset: gameNumber - 1
            };
            
            // Calculate match date (spread matches across days)
            const matchDateForThisMatch = new Date(matchDate);
            matchDateForThisMatch.setDate(matchDateForThisMatch.getDate() + daysOffset + gameTiming.dateOffset);
            
            // Add time to date
            const [hours, minutes] = gameTiming.time.split(':');
            matchDateForThisMatch.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            // Alternate home/away teams if configured
            let homeTeamId, awayTeamId;
            if (stageConfig.alternateHomeAway && numberOfGames > 1) {
              // Game 1: team1 home, team2 away
              // Game 2: team2 home, team1 away
              // Game 3: team1 home, team2 away (if odd game)
              // Game 4: team2 home, team1 away (if even game)
              // etc.
              if (gameNumber % 2 === 1) {
                // Odd games: team1 home
                homeTeamId = match.team1?.id || null;
                awayTeamId = match.team2?.id || null;
              } else {
                // Even games: team2 home
                homeTeamId = match.team2?.id || null;
                awayTeamId = match.team1?.id || null;
              }
            } else {
              // No alternation: team1 always home
              homeTeamId = match.team1?.id || null;
              awayTeamId = match.team2?.id || null;
            }

            matches.push({
              leagueId,
              homeTeamId,
              awayTeamId,
              scheduledDate: matchDateForThisMatch.toISOString(),
              venue: bracketSettings.venue || 'TBD',
              matchStatus: 'scheduled',
              matchNotes: `Knockout Bracket - ${stageName} - Series ${match.matchNumber}, Game ${gameNumber} of ${numberOfGames}${stageConfig.alternateHomeAway ? (gameNumber % 2 === 1 ? ' (Home: ' + (match.team1?.name || 'TBD') + ')' : ' (Home: ' + (match.team2?.name || 'TBD') + ')') : ''}`
            });
          }

          // Increment days offset for next series (after all games in current series)
          const maxDateOffset = gameTimings.length > 0 
            ? Math.max(...gameTimings.map(gt => gt.dateOffset || 0))
            : numberOfGames - 1;
          daysOffset += maxDateOffset + 1;
        });

        // Add extra day between rounds
        if (roundIndex < bracket.rounds.length - 1) {
          daysOffset++;
        }

        // Add third place match if configured for semi-finals
        // Check if this is the semi-finals round (2 matches) and third place is enabled
        if (stageConfig?.includeThirdPlace && round.matches.length === 2) {
          const thirdPlaceStageName = stageConfig.thirdPlaceStageName || 'Third Place';
          const thirdPlaceGames = stageConfig.thirdPlaceGames || 1;
          
          // Add third place match after semi-finals
          for (let gameNumber = 1; gameNumber <= thirdPlaceGames; gameNumber++) {
            const matchDateForThisMatch = new Date(matchDate);
            matchDateForThisMatch.setDate(matchDateForThisMatch.getDate() + daysOffset);
            
            const [hours, minutes] = bracketSettings.timeSlot.split(':');
            matchDateForThisMatch.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            matches.push({
              leagueId,
              homeTeamId: null, // Will be determined by semi-final losers
              awayTeamId: null,
              scheduledDate: matchDateForThisMatch.toISOString(),
              venue: bracketSettings.venue || 'TBD',
              matchStatus: 'scheduled',
              matchNotes: `Knockout Bracket - ${thirdPlaceStageName} - Game ${gameNumber} of ${thirdPlaceGames}`
            });

            daysOffset++;
          }
        }
      });

      // Create matches in database
      const createPromises = matches.map(matchData => 
        matchService.create(matchData)
      );

      await Promise.all(createPromises);

      setSuccess(`Successfully created ${matches.length} knockout bracket matches!`);
      
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after a delay
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      console.error('Error saving bracket:', err);
      setError(err.message || 'Failed to save knockout bracket');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Create Knockout Bracket</h2>
          <p className="text-sm text-muted-foreground">
            Select teams that have qualified past the group stage
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={18} />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="px-4 py-3 rounded-lg border bg-success/10 border-success/20 text-success">
          <div className="flex items-start gap-3">
            <Icon name="CheckCircle2" size={18} />
            <p className="font-medium">{success}</p>
          </div>
        </div>
      )}

      {!bracket ? (
        <>
          {/* Settings */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bracketSettings.startDate}
                  onChange={(e) => setBracketSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Time Slot
                </label>
                <input
                  type="time"
                  value={bracketSettings.timeSlot}
                  onChange={(e) => setBracketSettings(prev => ({ ...prev, timeSlot: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Venue
              </label>
              <input
                type="text"
                value={bracketSettings.venue}
                onChange={(e) => setBracketSettings(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Enter venue name"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          {/* Qualified Teams Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Select Qualified Teams</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTeams.length} team(s) selected
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="text-primary animate-spin" />
              </div>
            ) : qualifiedTeams.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No qualified teams found</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Teams need to have played at least one match to qualify
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 border border-border rounded-lg p-4">
                {qualifiedTeams.map((team) => {
                  const isSelected = selectedTeams.includes(team.id);
                  return (
                    <div
                      key={team.id}
                      onClick={() => toggleTeamSelection(team.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {isSelected && (
                          <Icon name="Check" size={14} className="text-primary-foreground" />
                        )}
                      </div>
                      {team.logoUrl ? (
                        <Image
                          src={team.logoUrl}
                          alt={team.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon name="Shield" size={20} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{team.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {team.position && <span>Position: #{team.position}</span>}
                          <span>•</span>
                          <span>PTS: {team.points}</span>
                          <span>•</span>
                          <span>W-L: {team.wins}-{team.losses}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={generateBracket}
              disabled={selectedTeams.length < 2 || !bracketSettings.startDate}
              iconName="Zap"
              iconPosition="left"
            >
              Generate Bracket
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Stage Configuration */}
          <div className="space-y-4 bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-foreground">Stage Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure stage names and number of games per series
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {stageConfigs.map((config) => {
                const round = bracket.rounds.find(r => r.roundNumber === config.roundNumber);
                const numMatches = round?.matches.filter(m => !m.isBye).length || 0;
                
                return (
                  <div key={config.roundNumber} className="bg-card rounded-lg p-4 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Stage Name
                        </label>
                        <input
                          type="text"
                          value={config.stageName}
                          onChange={(e) => updateStageConfig(config.roundNumber, 'stageName', e.target.value)}
                          placeholder="e.g., Quarter Finals, Semi Finals, Finals"
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Number of Games (Best of X)
                        </label>
                        <select
                          value={config.numberOfGames}
                          onChange={(e) => {
                            const newGames = parseInt(e.target.value);
                            // Update game timings when number of games changes
                            const newTimings = Array.from({ length: newGames }, (_, i) => {
                              const existing = config.gameTimings?.find(gt => gt.gameNumber === i + 1);
                              return existing || {
                                gameNumber: i + 1,
                                time: bracketSettings.timeSlot,
                                dateOffset: i
                              };
                            });
                            updateStageConfig(config.roundNumber, 'numberOfGames', newGames);
                            updateStageConfig(config.roundNumber, 'gameTimings', newTimings);
                            // Enable alternation by default for series
                            if (newGames > 1 && !config.alternateHomeAway) {
                              updateStageConfig(config.roundNumber, 'alternateHomeAway', true);
                            }
                          }}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        >
                          <option value={1}>Single Game</option>
                          <option value={3}>Best of 3</option>
                          <option value={5}>Best of 5</option>
                          <option value={7}>Best of 7</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {numMatches} series × {config.numberOfGames} games = {numMatches * config.numberOfGames} total matches
                        </p>
                        {config.numberOfGames > 1 && (
                          <label className="flex items-center space-x-2 cursor-pointer mt-2">
                            <input
                              type="checkbox"
                              checked={config.alternateHomeAway ?? true}
                              onChange={(e) => updateStageConfig(config.roundNumber, 'alternateHomeAway', e.target.checked)}
                              className="rounded border-border"
                            />
                            <span className="text-xs text-foreground">Alternate Home/Away Teams</span>
                          </label>
                        )}
                      </div>
                      <div className="flex items-end">
                        {round && round.matches.length === 2 && bracket.rounds.length > 2 && (
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.includeThirdPlace}
                                onChange={(e) => updateStageConfig(config.roundNumber, 'includeThirdPlace', e.target.checked)}
                                className="rounded border-border"
                              />
                              <span className="text-sm text-foreground">Include Third Place Match</span>
                            </label>
                            {config.includeThirdPlace && (
                              <div className="ml-6 space-y-2">
                                <input
                                  type="text"
                                  value={config.thirdPlaceStageName || 'Third Place'}
                                  onChange={(e) => updateStageConfig(config.roundNumber, 'thirdPlaceStageName', e.target.value)}
                                  placeholder="Third Place / Classification"
                                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                                />
                                <select
                                  value={config.thirdPlaceGames || 1}
                                  onChange={(e) => updateStageConfig(config.roundNumber, 'thirdPlaceGames', parseInt(e.target.value))}
                                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                                >
                                  <option value={1}>Single Game</option>
                                  <option value={3}>Best of 3</option>
                                  <option value={5}>Best of 5</option>
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Game Timings Configuration for Series */}
                  {config.numberOfGames > 1 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Game Timings & Schedule
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: config.numberOfGames }, (_, index) => {
                          const gameNumber = index + 1;
                          const gameTiming = config.gameTimings?.find(gt => gt.gameNumber === gameNumber) || {
                            gameNumber,
                            time: bracketSettings.timeSlot,
                            dateOffset: index
                          };
                          
                          return (
                            <div key={gameNumber} className="bg-muted/30 rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">Game {gameNumber}</span>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1">Time</label>
                                  <input
                                    type="time"
                                    value={gameTiming.time}
                                    onChange={(e) => {
                                      const updatedTimings = [...(config.gameTimings || [])];
                                      const existingIndex = updatedTimings.findIndex(gt => gt.gameNumber === gameNumber);
                                      if (existingIndex >= 0) {
                                        updatedTimings[existingIndex] = { ...updatedTimings[existingIndex], time: e.target.value };
                                      } else {
                                        updatedTimings.push({ gameNumber, time: e.target.value, dateOffset: gameTiming.dateOffset });
                                      }
                                      updateStageConfig(config.roundNumber, 'gameTimings', updatedTimings);
                                    }}
                                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1">Days from Series Start</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={gameTiming.dateOffset}
                                    onChange={(e) => {
                                      const updatedTimings = [...(config.gameTimings || [])];
                                      const existingIndex = updatedTimings.findIndex(gt => gt.gameNumber === gameNumber);
                                      if (existingIndex >= 0) {
                                        updatedTimings[existingIndex] = { ...updatedTimings[existingIndex], dateOffset: parseInt(e.target.value) || 0 };
                                      } else {
                                        updatedTimings.push({ gameNumber, time: gameTiming.time, dateOffset: parseInt(e.target.value) || 0 });
                                      }
                                      updateStageConfig(config.roundNumber, 'gameTimings', updatedTimings);
                                    }}
                                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

          {/* Bracket Preview */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Bracket Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBracket(null)}
                iconName="Edit"
                iconPosition="left"
              >
                Edit Teams
              </Button>
            </div>

            <div className="space-y-8 overflow-x-auto">
              {bracket.rounds.map((round, roundIndex) => {
                const stageConfig = stageConfigs.find(c => c.roundNumber === round.roundNumber);
                const stageName = stageConfig?.stageName || round.name;
                const numberOfGames = stageConfig?.numberOfGames || 1;
                const alternateHomeAway = stageConfig?.alternateHomeAway && numberOfGames > 1;
                
                return (
                  <div key={round.roundNumber} className="min-w-max">
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="text-md font-semibold text-foreground">{stageName}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Best of {numberOfGames}
                      </span>
                      {alternateHomeAway && (
                        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                          Alternating Home/Away
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {round.matches.map((match) => (
                        <div key={match.id} className="space-y-2">
                          {/* Match Header */}
                          <div
                            className={`flex items-center gap-4 p-4 rounded-lg border ${
                              match.isBye
                                ? 'bg-muted/30 border-muted'
                                : 'bg-card border-border'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {match.team1?.logoUrl ? (
                                <Image
                                  src={match.team1.logoUrl}
                                  alt={match.team1.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                  <Icon name="Shield" size={16} className="text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium text-foreground">
                                {match.team1?.name || 'TBD'}
                              </span>
                            </div>
                            <span className="text-muted-foreground">vs</span>
                            <div className="flex items-center gap-3 flex-1">
                              {match.team2?.logoUrl ? (
                                <Image
                                  src={match.team2.logoUrl}
                                  alt={match.team2.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                  <Icon name="Shield" size={16} className="text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium text-foreground">
                                {match.team2?.name || (match.isBye ? 'Bye' : 'TBD')}
                              </span>
                            </div>
                            {match.isBye && (
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                Bye
                              </span>
                            )}
                          </div>
                          
                          {/* Series Games Preview (if best of series) */}
                          {!match.isBye && numberOfGames > 1 && (
                            <div className="ml-4 pl-4 border-l-2 border-border space-y-1">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Series Games:</p>
                              {Array.from({ length: numberOfGames }, (_, index) => {
                                const gameNumber = index + 1;
                                const gameTiming = stageConfig.gameTimings?.find(gt => gt.gameNumber === gameNumber) || {
                                  gameNumber,
                                  time: bracketSettings.timeSlot,
                                  dateOffset: index
                                };
                                const homeTeam = alternateHomeAway 
                                  ? (gameNumber % 2 === 1 ? match.team1 : match.team2)
                                  : match.team1;
                                
                                return (
                                  <div key={gameNumber} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">Game {gameNumber}:</span>
                                    <span className="text-foreground">{homeTeam?.name || 'TBD'} (Home)</span>
                                    <span>vs</span>
                                    <span className="text-foreground">
                                      {(alternateHomeAway 
                                        ? (gameNumber % 2 === 1 ? match.team2 : match.team1)
                                        : match.team2
                                      )?.name || 'TBD'} (Away)
                                    </span>
                                    <span className="ml-auto">
                                      {gameTiming.time} • Day +{gameTiming.dateOffset}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Total Matches:</strong> {stageConfigs.reduce((sum, config) => {
                  const round = bracket.rounds.find(r => r.roundNumber === config.roundNumber);
                  const numSeries = round?.matches.filter(m => !m.isBye).length || 0;
                  let matches = numSeries * config.numberOfGames;
                  if (config.includeThirdPlace && numSeries === 2) {
                    const thirdPlaceGames = config.thirdPlaceGames || 1;
                    matches += thirdPlaceGames; // Third place match games
                  }
                  return sum + matches;
                }, 0)} matches will be created
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Start Date:</strong> {new Date(bracketSettings.startDate).toLocaleDateString()}
              </p>
              {bracketSettings.venue && (
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Venue:</strong> {bracketSettings.venue}
                </p>
              )}
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs font-medium text-foreground mb-1">Stage Breakdown:</p>
                {stageConfigs.map((config) => {
                  const round = bracket.rounds.find(r => r.roundNumber === config.roundNumber);
                  const numSeries = round?.matches.filter(m => !m.isBye).length || 0;
                  let matches = numSeries * config.numberOfGames;
                  if (config.includeThirdPlace && numSeries === 2) {
                    const thirdPlaceGames = config.thirdPlaceGames || 1;
                    matches += thirdPlaceGames; // Third place match games
                  }
                  return (
                    <p key={config.roundNumber} className="text-xs text-muted-foreground">
                      • {config.stageName}: {numSeries} series × {config.numberOfGames} games = {numSeries * config.numberOfGames} matches
                      {config.includeThirdPlace && numSeries === 2 && (
                        <span> + {config.thirdPlaceGames || 1} {config.thirdPlaceStageName || 'Third Place'} match(es)</span>
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setBracket(null)}>
              Back
            </Button>
            <Button
              variant="default"
              onClick={saveBracket}
              loading={isGenerating}
              iconName="Save"
              iconPosition="left"
            >
              Save Bracket
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default KnockoutBracket;


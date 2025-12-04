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
// ... rest of existing code ...
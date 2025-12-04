import { supabase } from '../lib/supabase';

export const leagueService = {
  // Get all leagues
  async getAll() {
    try {
      const { data, error } = await supabase?.from('leagues')?.select(`
          *,
          creator:user_profiles!leagues_created_by_fkey(id, full_name)
        `)?.order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to camelCase for React
      return data?.map(league => ({
        id: league?.id,
        name: league?.name,
        description: league?.description,
        season: league?.season,
        leagueStatus: league?.league_status,
        startDate: league?.start_date,
        endDate: league?.end_date,
        maxTeams: league?.max_teams,
        currentTeams: league?.current_teams,
        entryFee: league?.entry_fee,
        prizePool: league?.prize_pool,
        rules: league?.rules,
        createdBy: league?.created_by,
        createdAt: league?.created_at,
        updatedAt: league?.updated_at,
        creator: league?.creator ? {
          id: league?.creator?.id,
          fullName: league?.creator?.full_name
        } : null
      })) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch leagues');
    }
  },

  // Get league by ID with teams and standings
  async getById(leagueId) {
    try {
      // First, fetch the league with teams and standings
      const { data, error } = await supabase?.from('leagues')?.select(`
          *,
          creator:user_profiles!leagues_created_by_fkey(id, full_name),
          league_teams(
            id,
            joined_date,
            is_active,
            team:teams(id, name, short_name, logo_url, team_status)
          ),
          league_standings(
            *,
            team:teams(id, name, short_name, logo_url)
          )
        `)?.eq('id', leagueId)?.single();

      if (error) throw error;

      // Fetch documents separately to avoid relationship issues
      let documents = [];
      try {
        documents = await this.getDocuments(leagueId);
      } catch (docError) {
        console.warn('Error fetching league documents:', docError);
        // Continue without documents if fetch fails
      }

      // Convert to camelCase for React
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        season: data?.season,
        leagueStatus: data?.league_status,
        startDate: data?.start_date,
        endDate: data?.end_date,
        maxTeams: data?.max_teams,
        currentTeams: data?.current_teams,
        entryFee: data?.entry_fee,
        prizePool: data?.prize_pool,
        rules: data?.rules,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        creator: data?.creator ? {
          id: data?.creator?.id,
          fullName: data?.creator?.full_name
        } : null,
        teams: data?.league_teams?.map(lt => ({
          id: lt?.id,
          joinedDate: lt?.joined_date,
          isActive: lt?.is_active,
          team: lt?.team ? {
            id: lt?.team?.id,
            name: lt?.team?.name,
            shortName: lt?.team?.short_name,
            logoUrl: lt?.team?.logo_url,
            teamStatus: lt?.team?.team_status
          } : null
        })) || [],
        standings: data?.league_standings?.map(standing => ({
          id: standing?.id,
          teamId: standing?.team_id,
          gamesPlayed: standing?.games_played,
          wins: standing?.wins,
          losses: standing?.losses,
          pointsFor: standing?.points_for,
          pointsAgainst: standing?.points_against,
          pointDifference: standing?.point_difference,
          winPercentage: standing?.win_percentage,
          position: standing?.position,
          updatedAt: standing?.updated_at,
          team: standing?.team ? {
            id: standing?.team?.id,
            name: standing?.team?.name,
            shortName: standing?.team?.short_name,
            logoUrl: standing?.team?.logo_url
          } : null
        })) || [],
        documents: documents || []
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch league');
    }
  },

  // Create new league
  async create(leagueData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('leagues')?.insert({
          name: leagueData?.name,
          description: leagueData?.description,
          season: leagueData?.season,
          start_date: leagueData?.startDate,
          end_date: leagueData?.endDate,
          max_teams: leagueData?.maxTeams || 12,
          entry_fee: leagueData?.entryFee || 0,
          prize_pool: leagueData?.prizePool || 0,
          rules: leagueData?.rules,
          created_by: user?.id
        })?.select()?.single();

      if (error) throw error;

      // Convert to camelCase for React
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        season: data?.season,
        leagueStatus: data?.league_status,
        startDate: data?.start_date,
        endDate: data?.end_date,
        maxTeams: data?.max_teams,
        currentTeams: data?.current_teams,
        entryFee: data?.entry_fee,
        prizePool: data?.prize_pool,
        rules: data?.rules,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create league');
    }
  },

  // Update league
  async update(leagueId, leagueData) {
    try {
      const { data, error } = await supabase?.from('leagues')?.update({
          name: leagueData?.name,
          description: leagueData?.description,
          season: leagueData?.season,
          start_date: leagueData?.startDate,
          end_date: leagueData?.endDate,
          max_teams: leagueData?.maxTeams,
          entry_fee: leagueData?.entryFee,
          prize_pool: leagueData?.prizePool,
          rules: leagueData?.rules,
          updated_at: new Date()?.toISOString()
        })?.eq('id', leagueId)?.select()?.single();

      if (error) throw error;

      // Convert to camelCase for React
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        season: data?.season,
        leagueStatus: data?.league_status,
        startDate: data?.start_date,
        endDate: data?.end_date,
        maxTeams: data?.max_teams,
        currentTeams: data?.current_teams,
        entryFee: data?.entry_fee,
        prizePool: data?.prize_pool,
        rules: data?.rules,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update league');
    }
  },

  // Add team to league
  async addTeam(leagueId, teamId) {
    try {
      const { data, error } = await supabase?.from('league_teams')?.insert({
          league_id: leagueId,
          team_id: teamId
        })?.select()?.single();

      if (error) throw error;

      // Update current teams count
      await supabase?.rpc('increment_current_teams', { league_id: leagueId });

      // Create initial standings entry
      await supabase?.from('league_standings')?.insert({
          league_id: leagueId,
          team_id: teamId
        });

      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to add team to league');
    }
  },

  // Remove team from league
  async removeTeam(leagueId, teamId) {
    try {
      const { error } = await supabase?.from('league_teams')?.delete()?.eq('league_id', leagueId)?.eq('team_id', teamId);

      if (error) throw error;

      // Update current teams count
      await supabase?.rpc('decrement_current_teams', { league_id: leagueId });

      // Remove standings entry
      await supabase?.from('league_standings')?.delete()?.eq('league_id', leagueId)?.eq('team_id', teamId);

      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to remove team from league');
    }
  },

  // Get league standings
  async getStandings(leagueId) {
    try {
      const { data, error } = await supabase?.from('league_standings')?.select(`
          *,
          team:teams(id, name, short_name, logo_url)
        `)?.eq('league_id', leagueId)?.order('position', { ascending: true });

      if (error) throw error;

      // Convert to camelCase for React
      return data?.map(standing => ({
        id: standing?.id,
        leagueId: standing?.league_id,
        teamId: standing?.team_id,
        gamesPlayed: standing?.games_played,
        wins: standing?.wins,
        losses: standing?.losses,
        pointsFor: standing?.points_for,
        pointsAgainst: standing?.points_against,
        pointDifference: standing?.point_difference,
        winPercentage: standing?.win_percentage,
        position: standing?.position,
        updatedAt: standing?.updated_at,
        team: standing?.team ? {
          id: standing?.team?.id,
          name: standing?.team?.name,
          shortName: standing?.team?.short_name,
          logoUrl: standing?.team?.logo_url
        } : null
      })) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch league standings');
    }
  },

  // Update league status
  async updateStatus(leagueId, status) {
    try {
      const { data, error } = await supabase?.from('leagues')?.update({
          league_status: status,
          updated_at: new Date()?.toISOString()
        })?.eq('id', leagueId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update league status');
    }
  },

  // Recalculate league standings based on completed matches
  async recalculateStandings(leagueId) {
    try {
      // Get all completed matches for this league
      // Get all completed matches (database enum only accepts 'completed', not 'Final' or 'Completed')
      const { data: matches, error: matchesError } = await supabase
        ?.from('matches')
        ?.select('id, home_team_id, away_team_id, home_score, away_score, match_status, match_notes')
        ?.eq('league_id', leagueId)
        ?.in('match_status', ['completed']);

      if (matchesError) throw matchesError;

      // Get all teams in this league
      const { data: leagueTeams, error: teamsError } = await supabase
        ?.from('league_teams')
        ?.select('team_id')
        ?.eq('league_id', leagueId)
        ?.eq('is_active', true);

      if (teamsError) throw teamsError;

      // Initialize standings map for all teams
      const standingsMap = new Map();
      leagueTeams?.forEach(({ team_id }) => {
        standingsMap.set(team_id, {
          // Group stage stats
          groupGamesPlayed: 0,
          groupWins: 0,
          groupLosses: 0,
          groupPointsFor: 0,
          groupPointsAgainst: 0,
          // Knockout stage stats
          knockoutGamesPlayed: 0,
          knockoutWins: 0,
          knockoutLosses: 0,
          knockoutPointsFor: 0,
          knockoutPointsAgainst: 0,
          // Overall stats (for backward compatibility)
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        });
      });

      // Helper function to determine if match is knockout stage
      const isKnockoutMatch = (matchNotes) => {
        if (!matchNotes) return false;
        const notes = matchNotes.toLowerCase();
        return notes.includes('knockout bracket') || 
               notes.includes('quarter finals') || 
               notes.includes('semi finals') || 
               notes.includes('semi-finals') ||
               notes.includes('third place') ||
               notes.includes('classification') ||
               notes.includes('finals');
      };

      // Helper function to extract knockout stage name
      const getKnockoutStage = (matchNotes) => {
        if (!matchNotes) return null;
        const notes = matchNotes.toLowerCase();
        if (notes.includes('quarter finals') || notes.includes('quarter-finals')) return 'Quarter Finals';
        if (notes.includes('semi finals') || notes.includes('semi-finals')) return 'Semi Finals';
        if (notes.includes('third place')) return 'Third Place';
        if (notes.includes('classification')) return 'Classification';
        if (notes.includes('finals') && !notes.includes('semi') && !notes.includes('quarter')) return 'Finals';
        if (notes.includes('knockout bracket')) {
          // Try to extract stage from notes
          const stageMatch = matchNotes.match(/Knockout Bracket - ([^-]+)/);
          if (stageMatch) return stageMatch[1].trim();
          return 'Knockout';
        }
        return null;
      };

      // Process each completed match
      matches?.forEach((match) => {
        const homeTeamId = match?.home_team_id;
        const awayTeamId = match?.away_team_id;
        const homeScore = match?.home_score;
        const awayScore = match?.away_score;
        const matchNotes = match?.match_notes;

        // Skip if scores are null/undefined or teams are missing
        // Only process matches with valid numeric scores
        if (
          homeScore === null || 
          homeScore === undefined || 
          awayScore === null || 
          awayScore === undefined ||
          !homeTeamId || 
          !awayTeamId
        ) {
          return;
        }

        // Convert to numbers to ensure proper comparison
        const homeScoreNum = Number(homeScore);
        const awayScoreNum = Number(awayScore);
        
        // Skip if conversion resulted in NaN
        if (isNaN(homeScoreNum) || isNaN(awayScoreNum)) {
          return;
        }

        // Determine if this is a knockout match
        const isKnockout = isKnockoutMatch(matchNotes);

        // Update home team stats
        const homeStats = standingsMap.get(homeTeamId);
        if (homeStats) {
          // Update overall stats
          homeStats.gamesPlayed += 1;
          homeStats.pointsFor += homeScoreNum;
          homeStats.pointsAgainst += awayScoreNum;
          
          if (isKnockout) {
            // Update knockout stats
            homeStats.knockoutGamesPlayed += 1;
            homeStats.knockoutPointsFor += homeScoreNum;
            homeStats.knockoutPointsAgainst += awayScoreNum;
            if (homeScoreNum > awayScoreNum) {
              homeStats.knockoutWins += 1;
              homeStats.wins += 1;
            } else if (homeScoreNum < awayScoreNum) {
              homeStats.knockoutLosses += 1;
              homeStats.losses += 1;
            }
          } else {
            // Update group stage stats
            homeStats.groupGamesPlayed += 1;
            homeStats.groupPointsFor += homeScoreNum;
            homeStats.groupPointsAgainst += awayScoreNum;
            if (homeScoreNum > awayScoreNum) {
              homeStats.groupWins += 1;
              homeStats.wins += 1;
            } else if (homeScoreNum < awayScoreNum) {
              homeStats.groupLosses += 1;
              homeStats.losses += 1;
            }
          }
          // Ties are counted as games played but neither win nor loss
        }

        // Update away team stats
        const awayStats = standingsMap.get(awayTeamId);
        if (awayStats) {
          // Update overall stats
          awayStats.gamesPlayed += 1;
          awayStats.pointsFor += awayScoreNum;
          awayStats.pointsAgainst += homeScoreNum;
          
          if (isKnockout) {
            // Update knockout stats
            awayStats.knockoutGamesPlayed += 1;
            awayStats.knockoutPointsFor += awayScoreNum;
            awayStats.knockoutPointsAgainst += homeScoreNum;
            if (awayScoreNum > homeScoreNum) {
              awayStats.knockoutWins += 1;
              awayStats.wins += 1;
            } else if (awayScoreNum < homeScoreNum) {
              awayStats.knockoutLosses += 1;
              awayStats.losses += 1;
            }
          } else {
            // Update group stage stats
            awayStats.groupGamesPlayed += 1;
            awayStats.groupPointsFor += awayScoreNum;
            awayStats.groupPointsAgainst += homeScoreNum;
            if (awayScoreNum > homeScoreNum) {
              awayStats.groupWins += 1;
              awayStats.wins += 1;
            } else if (awayScoreNum < homeScoreNum) {
              awayStats.groupLosses += 1;
              awayStats.losses += 1;
            }
          }
          // Ties are counted as games played but neither win nor loss
        }
      });

      // Calculate standings and prepare for database update
      const standingsArray = Array.from(standingsMap.entries()).map(([teamId, stats]) => {
        const pointDifference = stats.pointsFor - stats.pointsAgainst;
        const winPercentage = stats.gamesPlayed > 0 
          ? (stats.wins / stats.gamesPlayed) * 100 
          : 0;

        return {
          teamId,
          gamesPlayed: stats.gamesPlayed,
          wins: stats.wins,
          losses: stats.losses,
          pointsFor: stats.pointsFor,
          pointsAgainst: stats.pointsAgainst,
          pointDifference,
          winPercentage: parseFloat(winPercentage.toFixed(3)),
        };
      });

      // Sort by wins (desc), then point difference (desc), then points for (desc)
      standingsArray.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.pointDifference !== a.pointDifference) return b.pointDifference - a.pointDifference;
        return b.pointsFor - a.pointsFor;
      });

      // Update positions and save to database
      const updatePromises = standingsArray.map((standing, index) => {
        const position = index + 1;
        return supabase
          ?.from('league_standings')
          ?.upsert({
            league_id: leagueId,
            team_id: standing.teamId,
            games_played: standing.gamesPlayed,
            wins: standing.wins,
            losses: standing.losses,
            points_for: standing.pointsFor,
            points_against: standing.pointsAgainst,
            point_difference: standing.pointDifference,
            win_percentage: standing.winPercentage,
            position: position,
            updated_at: new Date()?.toISOString(),
          }, {
            onConflict: 'league_id,team_id',
          });
      });

      const results = await Promise.all(updatePromises);
      const errors = results.filter((result) => result?.error);
      
      if (errors.length > 0) {
        console.error('Some standings updates failed:', errors);
        throw new Error(`Failed to update ${errors.length} team standings`);
      }

      return {
        success: true,
        teamsUpdated: standingsArray.length,
        message: `Successfully recalculated standings for ${standingsArray.length} teams`,
      };
    } catch (error) {
      console.error('Error recalculating league standings:', error);
      throw new Error(error?.message || 'Failed to recalculate league standings');
    }
  },

  // Upload league document file to Supabase Storage
  async uploadFile(file, leagueId, fileType = 'document') {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!leagueId) {
        throw new Error('League ID is required for file upload');
      }

      // Validate file type and size
      const allowedMimes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedMimes.includes(file.type)) {
        throw new Error('Document must be PDF, image, or Word document');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Document file size must be less than 10MB');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const ext = sanitizedName.split('.').pop();
      const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.')) || sanitizedName;
      const filename = `${timestamp}-${randomStr}-${nameWithoutExt}.${ext}`;

      // Construct file path: leagues/{leagueId}/documents/{filename}
      const filePath = `leagues/${leagueId}/documents/${filename}`;

      // Upload to Supabase Storage
      const bucketName = 'league-documents';
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket "league-documents" not found. Please create it in Supabase Storage.');
        }
        throw new Error(uploadError.message || 'Failed to upload file to storage');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        filePath: filePath,
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: file.size,
      };
    } catch (error) {
      console.error('League file upload error:', error);
      throw new Error(error?.message || 'Failed to upload file');
    }
  },

  // Save league document
  async saveLeagueDocument(leagueId, documentData) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertPayload = {
        league_id: leagueId,
        document_type: documentData?.documentType || 'supporting',
        file_name: documentData?.fileName,
        file_size: documentData?.fileSize,
        uploaded_by: user?.id,
      };

      if (documentData?.filePath) {
        insertPayload.file_path = documentData.filePath;
      }

      if (documentData?.fileUrl) {
        insertPayload.file_url = documentData.fileUrl;
      }

      if (documentData?.description) {
        insertPayload.description = documentData.description;
      }

      const { data, error } = await supabase
        ?.from('league_documents')
        ?.insert(insertPayload)
        ?.select()
        ?.single();

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('Could not find the table') || 
            error.message?.includes('relation') ||
            error.code === 'PGRST116') {
          throw new Error(`Database schema needs update. Please run migration: supabase/migrations/20250119000003_create_league_documents.sql\n\nOriginal error: ${error.message}`);
        }
        if (error?.message?.includes('file_path') || error?.message?.includes('column')) {
          throw new Error(`Database schema needs update. Please run migration: supabase/migrations/20250119000003_create_league_documents.sql\n\nOriginal error: ${error.message}`);
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to save league document');
    }
  },

  // Get league documents
  async getDocuments(leagueId) {
    try {
      const { data, error } = await supabase
        ?.from('league_documents')
        ?.select(`
          *,
          uploader:user_profiles!league_documents_uploaded_by_fkey(id, full_name)
        `)
        ?.eq('league_id', leagueId)
        ?.order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array instead of throwing
        if (error.message?.includes('Could not find the table') || 
            error.message?.includes('relation') ||
            error.code === 'PGRST116') {
          console.warn('league_documents table does not exist. Please run migration: supabase/migrations/20250119000003_create_league_documents.sql');
          return [];
        }
        throw error;
      }

      return data?.map(doc => ({
        id: doc.id,
        leagueId: doc.league_id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        fileUrl: doc.file_url,
        filePath: doc.file_path,
        description: doc.description,
        uploadedBy: doc.uploaded_by,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        uploader: doc.uploader ? {
          id: doc.uploader.id,
          fullName: doc.uploader.full_name
        } : null
      })) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch league documents');
    }
  },

  // Delete league document
  async deleteDocument(documentId) {
    try {
      const { error } = await supabase
        ?.from('league_documents')
        ?.delete()
        ?.eq('id', documentId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete league document');
    }
  },

  // Get file URL from path
  getFileUrl(filePath) {
    if (!filePath) return null;
    try {
      // If path already contains http:// or https://, return as-is (already a full URL)
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        // Normalize old localhost URLs if present
        if (filePath.includes('localhost:3001')) {
          const apiUrl = import.meta.env.VITE_API_URL || 'https://api.tanzaniabasketball.com';
          return filePath.replace(/https?:\/\/localhost:3001/, apiUrl);
        }
        return filePath;
      }
      
      // Get public URL from Supabase Storage
      const bucketName = 'league-documents';
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  },

  // Delete file from storage
  async deleteFile(filePath) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 
        'https://api.tanzaniabasketball.com';
      
      const response = await fetch(`${apiUrl}/delete-file`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete file');
      }

      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete file');
    }
  }
};
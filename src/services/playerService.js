import { supabase } from '../lib/supabase';

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

// Helper function to get file URL (used before playerService is fully defined)
const getFileUrlHelper = (filePath) => {
  if (!filePath) return null;
  try {
    // If path already contains http:// or https://, normalize it
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return normalizeUrl(filePath);
    }
    
    // Get public URL from Supabase Storage
    const bucketName = 'player-photos';
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

export const playerService = {
  // Get all players
  async getAll() {
    try {
      const { data, error } = await supabase?.from('players')?.select(`
          *,
          user_profile:user_profiles!players_user_profile_id_fkey(id, full_name, email, phone, avatar_url),
          team:teams(id, name, short_name, logo_url, category),
          player_documents:player_documents!player_documents_player_id_fkey(document_type, file_url, file_path)
        `)?.order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to camelCase for React
      return data?.map(player => {
        // Handle player_documents - it might be an array or null/undefined
        const playerDocuments = Array.isArray(player?.player_documents) 
          ? player?.player_documents 
          : (player?.player_documents ? [player.player_documents] : []);
        
        const photoDocument = playerDocuments?.find(
          (doc) => doc?.document_type === 'player_photo'
        );
        
        const photoPath = photoDocument?.file_path || null;
        const photoUrl = photoPath ? getFileUrlHelper(photoPath) : null;
        
        // Resolve photo URL with fallback logic (same as getPlayerPhotoUrl)
        let resolvedPhotoUrl = photoUrl;
        if (!resolvedPhotoUrl && photoDocument?.file_url) {
          resolvedPhotoUrl = normalizeUrl(photoDocument.file_url);
        }
        if (!resolvedPhotoUrl && player?.user_profile?.avatar_url) {
          resolvedPhotoUrl = normalizeUrl(player.user_profile.avatar_url);
        }
        if (!resolvedPhotoUrl) {
          resolvedPhotoUrl = '/assets/images/no_image.png';
        }
        
        return {
          id: player?.id,
          userProfileId: player?.user_profile_id,
          teamId: player?.team_id,
          jerseyNumber: player?.jersey_number,
          playerPosition: player?.player_position,
          playerStatus: player?.player_status,
          heightCm: player?.height_cm,
          weightKg: player?.weight_kg,
          dateOfBirth: player?.date_of_birth,
          placeOfBirth: player?.place_of_birth,
          nationality: player?.nationality,
          emergencyContactName: player?.emergency_contact_name,
          emergencyContactPhone: player?.emergency_contact_phone,
          medicalConditions: player?.medical_conditions,
          registrationStatus: player?.registration_status,
          registrationDate: player?.registration_date,
          approvedDate: player?.approved_date,
          approvedBy: player?.approved_by,
          createdAt: player?.created_at,
          updatedAt: player?.updated_at,
          photoPath: photoPath,
          photoUrl: resolvedPhotoUrl,
          userProfile: player?.user_profile ? {
            id: player?.user_profile?.id,
            fullName: player?.user_profile?.full_name,
            email: player?.user_profile?.email,
            phone: player?.user_profile?.phone,
            avatarUrl: normalizeUrl(player?.user_profile?.avatar_url)
          } : null,
          team: player?.team ? {
            id: player?.team?.id,
            name: player?.team?.name,
            shortName: player?.team?.short_name,
            logoUrl: player?.team?.logo_url,
            category: player?.team?.category
          } : null
        };
      }) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch players');
    }
  },

  // Get player by ID
  async getById(playerId) {
    try {
      const { data, error } = await supabase?.from('players')?.select(`
          *,
          user_profile:user_profiles!players_user_profile_id_fkey(id, full_name, email, phone, avatar_url),
          team:teams(id, name, short_name, logo_url),
          player_documents:player_documents!player_documents_player_id_fkey(document_type, file_url, file_path),
          player_statistics(
            *,
            league:leagues(id, name, season)
          )
        `)?.eq('id', playerId)?.single();

      if (error) throw error;

      // Extract photo document
      const photoDocument = Array.isArray(data?.player_documents) 
        ? data?.player_documents?.find((doc) => doc?.document_type === 'player_photo')
        : null;
      
      const photoPath = photoDocument?.file_path || null;
      const photoUrl = photoPath ? getFileUrlHelper(photoPath) : null;
      
      // Resolve photo URL with fallback logic
      let resolvedPhotoUrl = photoUrl;
      if (!resolvedPhotoUrl && photoDocument?.file_url) {
        resolvedPhotoUrl = photoDocument.file_url;
      }
      if (!resolvedPhotoUrl && data?.user_profile?.avatar_url) {
        resolvedPhotoUrl = data.user_profile.avatar_url;
      }
      if (!resolvedPhotoUrl) {
        resolvedPhotoUrl = '/assets/images/no_image.png';
      }

      // Convert to camelCase for React
      return {
        id: data?.id,
        userProfileId: data?.user_profile_id,
        teamId: data?.team_id,
        jerseyNumber: data?.jersey_number,
        playerPosition: data?.player_position,
        playerStatus: data?.player_status,
        heightCm: data?.height_cm,
        weightKg: data?.weight_kg,
        dateOfBirth: data?.date_of_birth,
        placeOfBirth: data?.place_of_birth,
        nationality: data?.nationality,
        emergencyContactName: data?.emergency_contact_name,
        emergencyContactPhone: data?.emergency_contact_phone,
        medicalConditions: data?.medical_conditions,
        registrationStatus: data?.registration_status,
        registrationDate: data?.registration_date,
        approvedDate: data?.approved_date,
        approvedBy: data?.approved_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        photoPath: photoPath,
        photoUrl: resolvedPhotoUrl,
        userProfile: data?.user_profile ? {
          id: data?.user_profile?.id,
          fullName: data?.user_profile?.full_name,
          email: data?.user_profile?.email,
          phone: data?.user_profile?.phone,
          avatarUrl: data?.user_profile?.avatar_url
        } : null,
        team: data?.team ? {
          id: data?.team?.id,
          name: data?.team?.name,
          shortName: data?.team?.short_name,
          logoUrl: data?.team?.logo_url
        } : null,
        statistics: data?.player_statistics?.map(stat => ({
          id: stat?.id,
          playerId: stat?.player_id,
          leagueId: stat?.league_id,
          gamesPlayed: stat?.games_played,
          minutesPlayed: stat?.minutes_played,
          points: stat?.points,
          fieldGoalsMade: stat?.field_goals_made,
          fieldGoalsAttempted: stat?.field_goals_attempted,
          threePointersMade: stat?.three_pointers_made,
          threePointersAttempted: stat?.three_pointers_attempted,
          freeThrowsMade: stat?.free_throws_made,
          freeThrowsAttempted: stat?.free_throws_attempted,
          rebounds: stat?.rebounds,
          assists: stat?.assists,
          steals: stat?.steals,
          blocks: stat?.blocks,
          turnovers: stat?.turnovers,
          fouls: stat?.fouls,
          updatedAt: stat?.updated_at,
          league: stat?.league ? {
            id: stat?.league?.id,
            name: stat?.league?.name,
            season: stat?.league?.season
          } : null
        })) || []
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch player');
    }
  },

  // Create new player
  async create(playerData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('players')?.insert({
          user_profile_id: user?.id,
          team_id: playerData?.teamId,
          jersey_number: playerData?.jerseyNumber,
          player_position: playerData?.playerPosition,
          height_cm: playerData?.heightCm,
          weight_kg: playerData?.weightKg,
          date_of_birth: playerData?.dateOfBirth,
          place_of_birth: playerData?.placeOfBirth,
          nationality: playerData?.nationality,
          emergency_contact_name: playerData?.emergencyContactName,
          emergency_contact_phone: playerData?.emergencyContactPhone,
          medical_conditions: playerData?.medicalConditions
        })?.select()?.single();

      if (error) throw error;

      // Convert to camelCase for React
      return {
        id: data?.id,
        userProfileId: data?.user_profile_id,
        teamId: data?.team_id,
        jerseyNumber: data?.jersey_number,
        playerPosition: data?.player_position,
        playerStatus: data?.player_status,
        heightCm: data?.height_cm,
        weightKg: data?.weight_kg,
        dateOfBirth: data?.date_of_birth,
        placeOfBirth: data?.place_of_birth,
        nationality: data?.nationality,
        emergencyContactName: data?.emergency_contact_name,
        emergencyContactPhone: data?.emergency_contact_phone,
        medicalConditions: data?.medical_conditions,
        registrationStatus: data?.registration_status,
        registrationDate: data?.registration_date,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to create player');
    }
  },

  // Update player
  async update(playerId, playerData) {
    try {
      const { data, error } = await supabase?.from('players')?.update({
          team_id: playerData?.teamId,
          jersey_number: playerData?.jerseyNumber,
          player_position: playerData?.playerPosition,
          height_cm: playerData?.heightCm,
          weight_kg: playerData?.weightKg,
          date_of_birth: playerData?.dateOfBirth,
          place_of_birth: playerData?.placeOfBirth,
          nationality: playerData?.nationality,
          emergency_contact_name: playerData?.emergencyContactName,
          emergency_contact_phone: playerData?.emergencyContactPhone,
          medical_conditions: playerData?.medicalConditions,
          updated_at: new Date()?.toISOString()
        })?.eq('id', playerId)?.select()?.single();

      if (error) throw error;

      // Convert to camelCase for React
      return {
        id: data?.id,
        userProfileId: data?.user_profile_id,
        teamId: data?.team_id,
        jerseyNumber: data?.jersey_number,
        playerPosition: data?.player_position,
        playerStatus: data?.player_status,
        heightCm: data?.height_cm,
        weightKg: data?.weight_kg,
        dateOfBirth: data?.date_of_birth,
        placeOfBirth: data?.place_of_birth,
        nationality: data?.nationality,
        emergencyContactName: data?.emergency_contact_name,
        emergencyContactPhone: data?.emergency_contact_phone,
        medicalConditions: data?.medical_conditions,
        registrationStatus: data?.registration_status,
        registrationDate: data?.registration_date,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update player');
    }
  },

  // Get players with statistics for statistics page
  async getPlayersWithStatistics(filters = {}) {
    try {
      const { leagueId, teamId, season } = filters;
      
      // Build query
      let query = supabase?.from('players')?.select(`
        *,
        user_profile:user_profiles!players_user_profile_id_fkey(id, full_name, email, phone, avatar_url),
        team:teams(id, name, short_name, logo_url, category),
        player_documents:player_documents!player_documents_player_id_fkey(document_type, file_url, file_path),
        player_statistics(
          *,
          league:leagues(id, name, season, start_date, end_date)
        )
      `);
      
      // Apply filters
      if (teamId && teamId !== 'all') {
        query = query?.eq('team_id', teamId);
      }
      
      // Filter by player status (only active players)
      query = query?.eq('player_status', 'active');
      
      const { data, error } = await query?.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process players and calculate statistics
      return data?.map(player => {
        const photoDocument = player?.player_documents?.find(
          (doc) => doc?.document_type === 'player_photo'
        );
        
        // Filter statistics by league/season if provided
        let relevantStats = player?.player_statistics || [];
        if (leagueId) {
          relevantStats = relevantStats.filter(stat => stat?.league_id === leagueId);
        } else if (season && season !== 'career') {
          relevantStats = relevantStats.filter(stat => stat?.league?.season === season);
        }
        
        // Aggregate statistics across all relevant leagues
        const aggregatedStats = relevantStats.reduce((acc, stat) => ({
          gamesPlayed: acc.gamesPlayed + (stat?.games_played || 0),
          minutesPlayed: acc.minutesPlayed + (stat?.minutes_played || 0),
          points: acc.points + (stat?.points || 0),
          fieldGoalsMade: acc.fieldGoalsMade + (stat?.field_goals_made || 0),
          fieldGoalsAttempted: acc.fieldGoalsAttempted + (stat?.field_goals_attempted || 0),
          threePointersMade: acc.threePointersMade + (stat?.three_pointers_made || 0),
          threePointersAttempted: acc.threePointersAttempted + (stat?.three_pointers_attempted || 0),
          freeThrowsMade: acc.freeThrowsMade + (stat?.free_throws_made || 0),
          freeThrowsAttempted: acc.freeThrowsAttempted + (stat?.free_throws_attempted || 0),
          rebounds: acc.rebounds + (stat?.rebounds || 0),
          assists: acc.assists + (stat?.assists || 0),
          steals: acc.steals + (stat?.steals || 0),
          blocks: acc.blocks + (stat?.blocks || 0),
          turnovers: acc.turnovers + (stat?.turnovers || 0),
          fouls: acc.fouls + (stat?.fouls || 0),
        }), {
          gamesPlayed: 0,
          minutesPlayed: 0,
          points: 0,
          fieldGoalsMade: 0,
          fieldGoalsAttempted: 0,
          threePointersMade: 0,
          threePointersAttempted: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fouls: 0,
        });
        
        // Calculate per-game averages and percentages
        const gamesPlayed = aggregatedStats.gamesPlayed || 1; // Avoid division by zero
        
        const stats = {
          pointsPerGame: gamesPlayed > 0 ? Number((aggregatedStats.points / gamesPlayed).toFixed(1)) : 0,
          reboundsPerGame: gamesPlayed > 0 ? Number((aggregatedStats.rebounds / gamesPlayed).toFixed(1)) : 0,
          assistsPerGame: gamesPlayed > 0 ? Number((aggregatedStats.assists / gamesPlayed).toFixed(1)) : 0,
          stealsPerGame: gamesPlayed > 0 ? Number((aggregatedStats.steals / gamesPlayed).toFixed(1)) : 0,
          blocksPerGame: gamesPlayed > 0 ? Number((aggregatedStats.blocks / gamesPlayed).toFixed(1)) : 0,
          fieldGoalPercentage: aggregatedStats.fieldGoalsAttempted > 0 
            ? Number(((aggregatedStats.fieldGoalsMade / aggregatedStats.fieldGoalsAttempted) * 100).toFixed(1))
            : 0,
          threePointPercentage: aggregatedStats.threePointersAttempted > 0
            ? Number(((aggregatedStats.threePointersMade / aggregatedStats.threePointersAttempted) * 100).toFixed(1))
            : 0,
          freeThrowPercentage: aggregatedStats.freeThrowsAttempted > 0
            ? Number(((aggregatedStats.freeThrowsMade / aggregatedStats.freeThrowsAttempted) * 100).toFixed(1))
            : 0,
          efficiency: gamesPlayed > 0 
            ? Number(((
                aggregatedStats.points + 
                aggregatedStats.rebounds + 
                aggregatedStats.assists + 
                aggregatedStats.steals + 
                aggregatedStats.blocks -
                (aggregatedStats.fieldGoalsAttempted - aggregatedStats.fieldGoalsMade) -
                (aggregatedStats.freeThrowsAttempted - aggregatedStats.freeThrowsMade) -
                aggregatedStats.turnovers
              ) / gamesPlayed).toFixed(1))
            : 0,
          gamesPlayed: aggregatedStats.gamesPlayed,
        };
        
        // Shooting stats
        const shootingStats = {
          threePointPercentage: stats.threePointPercentage,
          freeThrowPercentage: stats.freeThrowPercentage,
          threePointsMade: gamesPlayed > 0 ? Number((aggregatedStats.threePointersMade / gamesPlayed).toFixed(1)) : 0,
          freeThrowsMade: gamesPlayed > 0 ? Number((aggregatedStats.freeThrowsMade / gamesPlayed).toFixed(1)) : 0,
          fieldGoalsMade: gamesPlayed > 0 ? Number((aggregatedStats.fieldGoalsMade / gamesPlayed).toFixed(1)) : 0,
          totalShots: gamesPlayed > 0 ? Number((aggregatedStats.fieldGoalsAttempted / gamesPlayed).toFixed(1)) : 0,
        };
        
        // Advanced stats
        const advancedStats = {
          efficiency: stats.efficiency,
          plusMinus: 0, // Would need match data to calculate
          usageRate: 0, // Would need more detailed data
          trueShootingPercentage: aggregatedStats.fieldGoalsAttempted > 0
            ? Number(((
                aggregatedStats.points / 
                (2 * (aggregatedStats.fieldGoalsAttempted + 0.44 * aggregatedStats.freeThrowsAttempted))
              ) * 100).toFixed(1))
            : 0,
          assistTurnoverRatio: aggregatedStats.turnovers > 0
            ? Number((aggregatedStats.assists / aggregatedStats.turnovers).toFixed(1))
            : aggregatedStats.assists > 0 ? aggregatedStats.assists : 0,
          reboundRate: 0, // Would need team data to calculate
        };
        
        const photoPath = photoDocument?.file_path || null;
        const photoUrl = photoPath ? getFileUrlHelper(photoPath) : null;
        
        // Resolve photo URL with fallback
        let resolvedPhotoUrl = photoUrl;
        if (!resolvedPhotoUrl && photoDocument?.file_url) {
          resolvedPhotoUrl = photoDocument.file_url;
        }
        if (!resolvedPhotoUrl && player?.user_profile?.avatar_url) {
          resolvedPhotoUrl = player.user_profile.avatar_url;
        }
        if (!resolvedPhotoUrl) {
          resolvedPhotoUrl = '/assets/images/no_image.png';
        }
        
        return {
          id: player?.id,
          userProfileId: player?.user_profile_id,
          teamId: player?.team_id,
          jerseyNumber: player?.jersey_number,
          playerPosition: player?.player_position,
          playerStatus: player?.player_status,
          heightCm: player?.height_cm,
          weightKg: player?.weight_kg,
          dateOfBirth: player?.date_of_birth,
          nationality: player?.nationality,
          photoPath: photoPath,
          photoUrl: resolvedPhotoUrl,
          name: player?.user_profile?.full_name || 'Unknown Player',
          photo: resolvedPhotoUrl,
          photoAlt: `Photo of ${player?.user_profile?.full_name || 'player'}`,
          team: player?.team ? {
            id: player?.team?.id,
            name: player?.team?.name,
            shortName: player?.team?.short_name,
            logoUrl: player?.team?.logo_url,
            category: player?.team?.category
          } : null,
          position: player?.player_position?.replace('_', ' ')?.replace(/\b\w/g, l => l?.toUpperCase()) || 'N/A',
          stats: stats,
          shootingStats: shootingStats,
          advancedStats: advancedStats,
          achievements: [], // Would need achievements table
        };
      }) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch players with statistics');
    }
  },

  // Get players by team
  async getByTeam(teamId) {
    try {
      const { data, error } = await supabase?.from('players')?.select(`
          *,
          user_profile:user_profiles!players_user_profile_id_fkey(id, full_name, email, phone, avatar_url),
          player_documents:player_documents!player_documents_player_id_fkey(document_type, file_url, file_path)
        `)?.eq('team_id', teamId)?.eq('player_status', 'active')?.order('jersey_number', { ascending: true });

      if (error) throw error;

      // Convert to camelCase for React
      return data?.map(player => {
        // Handle player_documents - it might be an array or null/undefined
        const playerDocuments = Array.isArray(player?.player_documents) 
          ? player?.player_documents 
          : (player?.player_documents ? [player.player_documents] : []);
        
        const photoDocument = playerDocuments?.find(
          (doc) => doc?.document_type === 'player_photo'
        );
        
        // Build player data with photo information
        const photoPath = photoDocument?.file_path || null;
        const photoUrl = photoPath ? getFileUrlHelper(photoPath) : null;
        
        // Resolve photo URL with fallback logic (same as getPlayerPhotoUrl)
        let resolvedPhotoUrl = photoUrl;
        if (!resolvedPhotoUrl && photoDocument?.file_url) {
          resolvedPhotoUrl = normalizeUrl(photoDocument.file_url);
        }
        if (!resolvedPhotoUrl && player?.user_profile?.avatar_url) {
          resolvedPhotoUrl = normalizeUrl(player.user_profile.avatar_url);
        }
        if (!resolvedPhotoUrl) {
          resolvedPhotoUrl = '/assets/images/no_image.png';
        }
        
        return {
          id: player?.id,
          userProfileId: player?.user_profile_id,
          teamId: player?.team_id,
          jerseyNumber: player?.jersey_number,
          playerPosition: player?.player_position,
          playerStatus: player?.player_status,
          heightCm: player?.height_cm,
          weightKg: player?.weight_kg,
          dateOfBirth: player?.date_of_birth,
          nationality: player?.nationality,
          registrationStatus: player?.registration_status,
          createdAt: player?.created_at,
          photoPath: photoPath,
          photoUrl: resolvedPhotoUrl,
          userProfile: player?.user_profile ? {
            id: player?.user_profile?.id,
            fullName: player?.user_profile?.full_name,
            email: player?.user_profile?.email,
            phone: player?.user_profile?.phone,
            avatarUrl: normalizeUrl(player?.user_profile?.avatar_url)
          } : null
        };
      }) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch team players');
    }
  },

  // Get current user's player profile
  async getCurrentPlayerProfile() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('players')?.select(`
          *,
          team:teams(id, name, short_name, logo_url)
        `)?.eq('user_profile_id', user?.id)?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          // No player profile found
          return null;
        }
        throw error;
      }

      // Convert to camelCase for React
      return {
        id: data?.id,
        userProfileId: data?.user_profile_id,
        teamId: data?.team_id,
        jerseyNumber: data?.jersey_number,
        playerPosition: data?.player_position,
        playerStatus: data?.player_status,
        heightCm: data?.height_cm,
        weightKg: data?.weight_kg,
        dateOfBirth: data?.date_of_birth,
        placeOfBirth: data?.place_of_birth,
        nationality: data?.nationality,
        emergencyContactName: data?.emergency_contact_name,
        emergencyContactPhone: data?.emergency_contact_phone,
        medicalConditions: data?.medical_conditions,
        registrationStatus: data?.registration_status,
        registrationDate: data?.registration_date,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        team: data?.team ? {
          id: data?.team?.id,
          name: data?.team?.name,
          shortName: data?.team?.short_name,
          logoUrl: data?.team?.logo_url
        } : null
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch player profile');
    }
  },

  // Update player status
  async updateStatus(playerId, status) {
    try {
      const { data, error } = await supabase?.from('players')?.update({
          player_status: status,
          updated_at: new Date()?.toISOString()
        })?.eq('id', playerId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update player status');
    }
  },

  // Upload file to Supabase Storage
  async uploadFile(file, playerId, fileType = 'document') {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!playerId) {
        throw new Error('Player ID is required for file upload');
      }

      // Validate file type and size
      if (fileType === 'photo') {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimes.includes(file.type)) {
          throw new Error('Photo must be an image file (JPEG, PNG, GIF, or WebP)');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Photo file size must be less than 5MB');
        }
      } else {
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
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const ext = sanitizedName.split('.').pop();
      const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.')) || sanitizedName;
      const filename = `${timestamp}-${randomStr}-${nameWithoutExt}.${ext}`;

      // Construct file path: players/{playerId}/photo/{filename} or players/{playerId}/documents/{filename}
      const folder = fileType === 'photo' ? 'photo' : 'documents';
      const filePath = `players/${playerId}/${folder}/${filename}`;

      // Upload to Supabase Storage
      const bucketName = 'player-photos';
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket "player-photos" not found. Please create it in Supabase Storage.');
        }
        throw new Error(uploadError.message || 'Failed to upload file to storage');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        path: filePath, // Supabase Storage path: players/{playerId}/photo/{filename}
        url: publicUrl,  // Public URL from Supabase Storage
        fileName: file.name,
        fileSize: file.size,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(error?.message || `Failed to upload file: ${error?.toString() || 'Unknown error'}`);
    }
  },

  // Save player document with path and URL
  async savePlayerDocument(playerId, documentData) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Build insert payload
      // file_path: Local file path (e.g., players/{playerId}/photo/{filename}) - PRIMARY storage
      // file_url: Full URL to access file (e.g., https://api.tanzaniabasketball.com/files/players/{playerId}/photo/{filename}) - for backward compatibility
      const insertPayload = {
        player_id: playerId,
        document_type: documentData?.documentType || 'other',
        file_name: documentData?.fileName,
        file_size: documentData?.fileSize,
        uploaded_by: user?.id,
      };

      // Store file_path (local path) - this is the primary storage method
      // Format: players/{playerId}/photo/{filename} or players/{playerId}/documents/{filename}
      if (documentData?.filePath) {
        insertPayload.file_path = documentData.filePath;
      }

      // Store file_url (full URL) - for backward compatibility and direct access
      if (documentData?.fileUrl) {
        insertPayload.file_url = documentData.fileUrl;
      }

      const { data, error } = await supabase
        ?.from('player_documents')
        ?.insert(insertPayload)
        ?.select()
        ?.single();

      if (error) {
        // If error is about missing column, provide helpful message
        if (error?.message?.includes('file_path') || error?.message?.includes('column')) {
          throw new Error(`Database schema needs update. Please run migration to add file_path column to player_documents table.\n\nOriginal error: ${error.message}`);
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to save player document');
    }
  },

  // Get file URL from path (helper function)
  // filePath format: players/{playerId}/photo/{filename} or players/{playerId}/documents/{filename}
  getFileUrl(filePath) {
    if (!filePath) return null;
    try {
      // If path already contains http:// or https://, normalize it
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return normalizeUrl(filePath);
      }
      
      // Get public URL from Supabase Storage
      // filePath is stored as: players/{playerId}/photo/{filename}
      const bucketName = 'player-photos';
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  },

  // Get player photo URL with fallback to no_image.png
  // Returns API path for stored photos or frontend asset path for missing photos
  getPlayerPhotoUrl(player) {
    // First check if player has a photoPath (from player_documents)
    if (player?.photoPath) {
      const url = this.getFileUrl(player.photoPath);
      if (url) return url;
    }
    
    // Fallback to photoUrl if available
    if (player?.photoUrl) {
      return normalizeUrl(player.photoUrl);
    }
    
    // Fallback to userProfile avatarUrl if available
    if (player?.userProfile?.avatarUrl) {
      return player.userProfile.avatarUrl;
    }
    
    // Default fallback to no_image.png
    return '/assets/images/no_image.png';
  },

  async deleteFile(filePath) {
    try {
      if (!filePath) return;

      // Extract path if it's a full URL
      let storagePath = filePath;
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        // Extract path from Supabase Storage URL
        const urlMatch = filePath.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
        if (urlMatch) {
          storagePath = urlMatch[1];
        } else {
          // If it's an old API URL, extract the path
          const apiMatch = filePath.match(/\/files\/(.+)$/);
          if (apiMatch) {
            storagePath = apiMatch[1];
          } else {
            console.warn('Could not extract path from URL:', filePath);
            return;
          }
        }
      }

      const bucketName = 'player-photos';
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([storagePath]);

      if (error) {
        console.error('Error deleting file from storage:', error);
        // Don't throw - file might already be deleted
      }
    } catch (error) {
      console.error('Error deleting player file:', error);
      // Don't throw - file might already be deleted
    }
  },

  async removePlayerPhoto(playerId, userProfileId) {
    try {
      if (!playerId) return;

      const { data: documents, error } = await supabase
        ?.from('player_documents')
        ?.select('id, file_path')
        ?.eq('player_id', playerId)
        ?.eq('document_type', 'player_photo');

      if (error) throw error;

      const documentIds = documents?.map((doc) => doc?.id)?.filter(Boolean) || [];
      const filePaths = documents?.map((doc) => doc?.file_path)?.filter(Boolean) || [];

      if (documentIds.length > 0) {
        await supabase?.from('player_documents')?.delete()?.in('id', documentIds);
      }

      if (userProfileId) {
        await supabase
          ?.from('user_profiles')
          ?.update({ avatar_url: null })
          ?.eq('id', userProfileId);
      }

      for (const path of filePaths) {
        await playerService.deleteFile(path);
      }
    } catch (error) {
      throw new Error(error?.message || 'Failed to remove player photo');
    }
  },

  // Complete player registration with all data
  async registerPlayer(registrationData) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, create or update user profile with personal details
      const { data: profileData, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.upsert({
          id: user?.id,
          email: registrationData?.email || user?.email,
          full_name: `${registrationData?.firstName || ''} ${registrationData?.lastName || ''}`.trim(),
          phone: registrationData?.phoneNumber,
          role: 'player',
        }, {
          onConflict: 'id'
        })
        ?.select()
        ?.single();

      if (profileError) throw profileError;

      // Create player record
      const playerPayload = {
        user_profile_id: user?.id,
        team_id: registrationData?.teamId || null,
        jersey_number: registrationData?.jerseyNumber ? parseInt(registrationData?.jerseyNumber) : null,
        player_position: registrationData?.primaryPosition || null,
        height_cm: registrationData?.height ? parseInt(registrationData?.height) : null,
        weight_kg: registrationData?.weight ? parseInt(registrationData?.weight) : null,
        date_of_birth: registrationData?.dateOfBirth || null,
        place_of_birth: registrationData?.placeOfBirth || null,
        nationality: registrationData?.nationality || null,
        emergency_contact_name: registrationData?.emergencyContactName || null,
        emergency_contact_phone: registrationData?.emergencyContactPhone || null,
        medical_conditions: registrationData?.medicalConditions || null,
        registration_status: 'submitted',
        registration_date: new Date()?.toISOString(),
      };

      const { data: playerData, error: playerError } = await supabase
        ?.from('players')
        ?.insert(playerPayload)
        ?.select()
        ?.single();

      if (playerError) throw playerError;

      const playerId = playerData?.id;

      // Upload player photo if provided
      let photoUrl = null;
      let photoPath = null;
      if (registrationData?.playerPhotoFile && typeof registrationData?.playerPhotoFile === 'object') {
        try {
          const photoUpload = await this.uploadFile(registrationData?.playerPhotoFile, playerId, 'photo');
          photoUrl = photoUpload?.url;
          photoPath = photoUpload?.path;
          
          // Update user profile with photo URL
          await supabase
            ?.from('user_profiles')
            ?.update({ avatar_url: photoUrl })
            ?.eq('id', user?.id);
          
          // Save photo as document record
          await this.savePlayerDocument(playerId, {
            documentType: 'player_photo',
            fileName: photoUpload?.fileName,
            filePath: photoPath,
            fileUrl: photoUrl,
            fileSize: photoUpload?.fileSize,
          });
        } catch (uploadError) {
          console.warn('Photo upload failed:', uploadError?.message);
          // Continue without photo - player can be created without it
        }
      }

      // Upload and save other documents if provided
      // This can be extended to handle ID documents, medical certificates, etc.

      return {
        id: playerId,
        ...playerData,
        photoUrl,
        photoPath,
      };
    } catch (error) {
      throw new Error(error?.message || 'Failed to register player');
    }
  }
};
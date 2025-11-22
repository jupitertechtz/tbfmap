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

  // Upload league document file
  async uploadFile(file, leagueId, fileType = 'document') {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('leagueId', leagueId);
      formData.append('fileType', fileType);

      const response = await fetch(`${apiUrl}/upload-league-file`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed (${response.status}): ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      return result.file;
    } catch (error) {
      console.error('League file upload error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
        leagueId,
        fileType,
        fileName: file?.name,
        fileSize: file?.size
      });
      throw new Error(error.message || 'Failed to upload file');
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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${apiUrl}/files/${filePath}`;
  },

  // Delete file from storage
  async deleteFile(filePath) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
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
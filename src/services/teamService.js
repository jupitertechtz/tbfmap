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

const normalizeTeam = (team) => {
  if (!team) return null;

  return {
    id: team?.id,
    name: team?.name,
    shortName: team?.short_name,
    foundedYear: team?.founded_year,
    homeVenue: team?.home_venue,
    venueAddress: team?.venue_address,
    category: team?.category,
    division: team?.division,
    teamManagerId: team?.team_manager_id,
    logoUrl: normalizeUrl(team?.logo_url),
    primaryColor: team?.primary_color,
    secondaryColor: team?.secondary_color,
    teamStatus: team?.team_status,
    registrationStatus: team?.registration_status,
    contactEmail: team?.contact_email,
    contactPhone: team?.contact_phone,
    primaryPhone: team?.primary_phone || team?.contact_phone,
    secondaryPhone: team?.secondary_phone,
    website: team?.website,
    address: team?.address,
    city: team?.city,
    region: team?.region,
    postalCode: team?.postal_code,
    // Organizational structure
    presidentName: team?.president_name,
    presidentPhone: team?.president_phone,
    presidentEmail: team?.president_email,
    presidentId: team?.president_id,
    secretaryName: team?.secretary_name,
    secretaryPhone: team?.secretary_phone,
    secretaryEmail: team?.secretary_email,
    secretaryId: team?.secretary_id,
    coachName: team?.coach_name,
    coachPhone: team?.coach_phone,
    coachEmail: team?.coach_email,
    coachLicense: team?.coach_license,
    // Banking information
    accountHolderName: team?.account_holder_name,
    bankName: team?.bank_name,
    accountNumber: team?.account_number,
    accountType: team?.account_type,
    branchName: team?.branch_name,
    branchCode: team?.branch_code,
    swiftCode: team?.swift_code,
    registrationDate: team?.registration_date,
    approvedDate: team?.approved_date,
    approvedBy: team?.approved_by,
    createdAt: team?.created_at,
    updatedAt: team?.updated_at,
    teamManager: team?.team_manager
      ? {
          id: team?.team_manager?.id,
          fullName: team?.team_manager?.full_name,
          email: team?.team_manager?.email,
          phone: team?.team_manager?.phone,
        }
      : null,
  };
};

export const teamService = {
  // Get all teams with manager details
  async getAll() {
    try {
      const { data, error } = await supabase
        ?.from('teams')
        ?.select(
          `
          *,
          team_manager:user_profiles!teams_team_manager_id_fkey(id, full_name, email, phone)
        `
        )
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(normalizeTeam) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch teams');
    }
  },

  // Get team by ID
  async getById(teamId) {
    try {
      const { data, error } = await supabase
        ?.from('teams')
        ?.select(
          `
          *,
          team_manager:user_profiles!teams_team_manager_id_fkey(id, full_name, email, phone)
        `
        )
        ?.eq('id', teamId)
        ?.single();

      if (error) throw error;

      return normalizeTeam(data);
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch team');
    }
  },

  // Create new team
  async create(teamData) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        name: teamData?.name,
        short_name: teamData?.shortName,
        founded_year: teamData?.foundedYear,
        home_venue: teamData?.homeVenue,
        venue_address: teamData?.venueAddress,
        category: teamData?.category,
        division: teamData?.division,
        team_manager_id: teamData?.teamManagerId || user?.id,
        logo_url: teamData?.logoUrl || null,
        primary_color: teamData?.primaryColor,
        secondary_color: teamData?.secondaryColor,
        contact_email: teamData?.contactEmail,
        contact_phone: teamData?.contactPhone || teamData?.primaryPhone,
        primary_phone: teamData?.primaryPhone || teamData?.contactPhone,
        secondary_phone: teamData?.secondaryPhone,
        website: teamData?.website,
        address: teamData?.address,
        city: teamData?.city,
        region: teamData?.region,
        postal_code: teamData?.postalCode,
        // Organizational structure
        president_name: teamData?.presidentName,
        president_phone: teamData?.presidentPhone,
        president_email: teamData?.presidentEmail,
        president_id: teamData?.presidentId,
        secretary_name: teamData?.secretaryName,
        secretary_phone: teamData?.secretaryPhone,
        secretary_email: teamData?.secretaryEmail,
        secretary_id: teamData?.secretaryId,
        coach_name: teamData?.coachName,
        coach_phone: teamData?.coachPhone,
        coach_email: teamData?.coachEmail,
        coach_license: teamData?.coachLicense,
        // Banking information
        account_holder_name: teamData?.accountHolderName,
        bank_name: teamData?.bankName,
        account_number: teamData?.accountNumber,
        account_type: teamData?.accountType,
        branch_name: teamData?.branchName,
        branch_code: teamData?.branchCode,
        swift_code: teamData?.swiftCode,
        team_status: teamData?.teamStatus || 'pending',
        registration_status: teamData?.registrationStatus || 'pending',
      };

      const { data, error } = await supabase
        ?.from('teams')
        ?.insert(payload)
        ?.select(
          `
          *,
          team_manager:user_profiles!teams_team_manager_id_fkey(id, full_name, email, phone)
        `
        )
        ?.single();

      if (error) throw error;

      return normalizeTeam(data);
    } catch (error) {
      throw new Error(error?.message || 'Failed to create team');
    }
  },

  // Update team
  async update(teamId, teamData) {
    try {
      const payload = {
        name: teamData?.name,
        short_name: teamData?.shortName,
        founded_year: teamData?.foundedYear,
        home_venue: teamData?.homeVenue,
        venue_address: teamData?.venueAddress,
        category: teamData?.category,
        division: teamData?.division,
        logo_url: teamData?.logoUrl,
        primary_color: teamData?.primaryColor,
        secondary_color: teamData?.secondaryColor,
        contact_email: teamData?.contactEmail,
        contact_phone: teamData?.contactPhone || teamData?.primaryPhone,
        primary_phone: teamData?.primaryPhone || teamData?.contactPhone,
        secondary_phone: teamData?.secondaryPhone,
        website: teamData?.website,
        address: teamData?.address,
        city: teamData?.city,
        region: teamData?.region,
        postal_code: teamData?.postalCode,
        // Organizational structure
        president_name: teamData?.presidentName,
        president_phone: teamData?.presidentPhone,
        president_email: teamData?.presidentEmail,
        president_id: teamData?.presidentId,
        secretary_name: teamData?.secretaryName,
        secretary_phone: teamData?.secretaryPhone,
        secretary_email: teamData?.secretaryEmail,
        secretary_id: teamData?.secretaryId,
        coach_name: teamData?.coachName,
        coach_phone: teamData?.coachPhone,
        coach_email: teamData?.coachEmail,
        coach_license: teamData?.coachLicense,
        // Banking information
        account_holder_name: teamData?.accountHolderName,
        bank_name: teamData?.bankName,
        account_number: teamData?.accountNumber,
        account_type: teamData?.accountType,
        branch_name: teamData?.branchName,
        branch_code: teamData?.branchCode,
        swift_code: teamData?.swiftCode,
        team_manager_id: teamData?.teamManagerId !== undefined ? teamData?.teamManagerId : null,
        updated_at: new Date()?.toISOString(),
      };

      const { data, error } = await supabase
        ?.from('teams')
        ?.update(payload)
        ?.eq('id', teamId)
        ?.select(
          `
          *,
          team_manager:user_profiles!teams_team_manager_id_fkey(id, full_name, email, phone)
        `
        )
        ?.single();

      if (error) throw error;

      return normalizeTeam(data);
    } catch (error) {
      throw new Error(error?.message || 'Failed to update team');
    }
  },

  // Delete team
  async delete(teamId) {
    try {
      const { error } = await supabase?.from('teams')?.delete()?.eq('id', teamId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error?.message || 'Failed to delete team');
    }
  },

  // Get teams managed by current user
  async getManagedTeams() {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('teams')
        ?.select('*')
        ?.eq('team_manager_id', user?.id)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(normalizeTeam) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch managed teams');
    }
  },

  // Update team status (admin only)
  async updateStatus(teamId, status) {
    try {
      const { data, error } = await supabase
        ?.from('teams')
        ?.update({
          team_status: status,
          updated_at: new Date()?.toISOString(),
        })
        ?.eq('id', teamId)
        ?.select(
          `
          *,
          team_manager:user_profiles!teams_team_manager_id_fkey(id, full_name, email, phone)
        `
        )
        ?.single();

      if (error) throw error;
      return normalizeTeam(data);
    } catch (error) {
      throw new Error(error?.message || 'Failed to update team status');
    }
  },

  // Get team standings/statistics
  async getTeamStandings(teamId, leagueId = null) {
    try {
      let query = supabase
        ?.from('league_standings')
        ?.select(
          `
          *,
          league:leagues(id, name, season),
          team:teams(id, name, short_name, logo_url)
        `
        )
        ?.eq('team_id', teamId);

      if (leagueId) {
        query = query?.eq('league_id', leagueId);
      }

      const { data, error } = await query;

      if (error) throw error;

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
        league: standing?.league ? {
          id: standing?.league?.id,
          name: standing?.league?.name,
          season: standing?.league?.season,
        } : null,
        team: standing?.team ? {
          id: standing?.team?.id,
          name: standing?.team?.name,
          shortName: standing?.team?.short_name,
          logoUrl: normalizeUrl(standing?.team?.logo_url),
        } : null,
      })) || [];
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch team standings');
    }
  },

  // Get team matches
  async getTeamMatches(teamId, limit = null) {
    try {
      const { data, error } = await supabase
        ?.from('matches')
        ?.select(
          `
          *,
          league:leagues(id, name, season),
          home_team:teams!matches_home_team_id_fkey(id, name, short_name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_name, logo_url)
        `
        )
        ?.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        ?.order('scheduled_date', { ascending: false });

      if (error) throw error;

      let matches = data?.map(match => ({
        id: match?.id,
        leagueId: match?.league_id,
        homeTeamId: match?.home_team_id,
        awayTeamId: match?.away_team_id,
        scheduledDate: match?.scheduled_date,
        venue: match?.venue,
        matchStatus: match?.match_status,
        homeScore: match?.home_score,
        awayScore: match?.away_score,
        quarter: match?.quarter,
        timeRemaining: match?.time_remaining,
        createdAt: match?.created_at,
        updatedAt: match?.updated_at,
        league: match?.league ? {
          id: match?.league?.id,
          name: match?.league?.name,
          season: match?.league?.season,
        } : null,
        homeTeam: match?.home_team ? {
          id: match?.home_team?.id,
          name: match?.home_team?.name,
          shortName: match?.home_team?.short_name,
          logoUrl: normalizeUrl(match?.home_team?.logo_url),
        } : null,
        awayTeam: match?.away_team ? {
          id: match?.away_team?.id,
          name: match?.away_team?.name,
          shortName: match?.away_team?.short_name,
          logoUrl: normalizeUrl(match?.away_team?.logo_url),
        } : null,
        isHome: match?.home_team_id === teamId,
        opponent: match?.home_team_id === teamId 
          ? match?.away_team 
          : match?.home_team,
        teamScore: match?.home_team_id === teamId 
          ? match?.home_score 
          : match?.away_score,
        opponentScore: match?.home_team_id === teamId 
          ? match?.away_score 
          : match?.home_score,
        result: match?.match_status === 'completed' 
          ? (match?.home_team_id === teamId 
              ? (match?.home_score > match?.away_score ? 'Win' : 'Loss')
              : (match?.away_score > match?.home_score ? 'Win' : 'Loss'))
          : null,
      })) || [];

      if (limit) {
        matches = matches?.slice(0, limit);
      }

      return matches;
    } catch (error) {
      throw new Error(error?.message || 'Failed to fetch team matches');
    }
  },

  // Upload file to Supabase Storage
  async uploadFile(file, teamId, fileType = 'document') {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!teamId) {
        throw new Error('Team ID is required for file upload');
      }

      // Validate file type and size
      if (fileType === 'logo') {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimes.includes(file.type)) {
          throw new Error('Logo must be an image file (JPEG, PNG, GIF, or WebP)');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Logo file size must be less than 5MB');
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

      // Construct file path: teams/{teamId}/logo/{filename} or teams/{teamId}/documents/{filename}
      const folder = fileType === 'logo' ? 'logo' : 'documents';
      const filePath = `teams/${teamId}/${folder}/${filename}`;

      // Upload to Supabase Storage
      const bucketName = 'team-documents';
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket "team-documents" not found. Please create it in Supabase Storage.');
        }
        throw new Error(uploadError.message || 'Failed to upload file to storage');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        path: filePath, // Supabase Storage path: teams/{teamId}/logo/{filename}
        url: publicUrl,  // Public URL from Supabase Storage
        fileName: file.name,
        fileSize: file.size,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(error?.message || `Failed to upload file: ${error?.toString() || 'Unknown error'}`);
    }
  },

  // Save team document with path and URL
  async saveTeamDocument(teamId, documentData) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Build insert payload
      // file_path: Local file path (e.g., teams/{teamId}/logo/{filename}) - PRIMARY storage
      // file_url: Full URL to access file (e.g., https://api.tanzaniabasketball.com/files/teams/{teamId}/logo/{filename}) - for backward compatibility
      const insertPayload = {
        team_id: teamId,
        document_type: documentData?.documentType || 'other',
        file_name: documentData?.fileName,
        file_size: documentData?.fileSize,
        uploaded_by: user?.id,
      };

      // Store file_path (local path) - this is the primary storage method
      // Format: teams/{teamId}/logo/{filename} or teams/{teamId}/documents/{filename}
      if (documentData?.filePath) {
        insertPayload.file_path = documentData.filePath;
      }

      // Store file_url (full URL) - for backward compatibility and direct access
      if (documentData?.fileUrl) {
        insertPayload.file_url = documentData.fileUrl;
      }

      const { data, error } = await supabase
        ?.from('team_documents')
        ?.insert(insertPayload)
        ?.select()
        ?.single();

      if (error) {
        // If error is about missing column, provide helpful message
        if (error?.message?.includes('file_path') || error?.message?.includes('column')) {
          throw new Error(`Database schema needs update. Please run migration: supabase/migrations/20250116000000_add_file_path_to_team_documents.sql\n\nOriginal error: ${error.message}`);
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to save team document');
    }
  },

  // Get file URL from path (helper function)
  // filePath format: teams/{teamId}/logo/{filename} or teams/{teamId}/documents/{filename}
  getFileUrl(filePath) {
    if (!filePath) return null;
    try {
      // If path already contains http:// or https://, normalize it
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return normalizeUrl(filePath);
      }
      
      // Get public URL from Supabase Storage
      // filePath is stored as: teams/{teamId}/logo/{filename}
      const bucketName = 'team-documents';
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  },

  // Delete file from Supabase Storage
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

      const bucketName = 'team-documents';
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([storagePath]);

      if (error) {
        console.error('Error deleting file from storage:', error);
        // Don't throw - file might already be deleted
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw - file might already be deleted
    }
  },

  // Complete team registration with all data
  async registerTeam(registrationData) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prepare logo placeholders so we can reference them before optional uploads
      let logoUrl =
        typeof registrationData?.teamLogo === 'string' ? registrationData?.teamLogo : null;
      let logoPath = null;

      // Create team record first to get team ID for file organization
      const teamPayload = {
        name: registrationData?.teamName,
        short_name: registrationData?.abbreviation,
        founded_year: registrationData?.foundingYear ? parseInt(registrationData?.foundingYear) : null,
        category: registrationData?.category,
        division: registrationData?.division,
        home_venue: registrationData?.homeVenue,
        venue_address: registrationData?.venueAddress,
        team_manager_id: user?.id,
        logo_url: logoUrl,
        primary_color: registrationData?.primaryColor,
        secondary_color: registrationData?.secondaryColor,
        contact_email: registrationData?.officialEmail,
        contact_phone: registrationData?.primaryPhone,
        primary_phone: registrationData?.primaryPhone,
        secondary_phone: registrationData?.secondaryPhone,
        website: registrationData?.website,
        address: registrationData?.streetAddress,
        city: registrationData?.city,
        region: registrationData?.region,
        postal_code: registrationData?.postalCode,
        // Organizational structure
        president_name: registrationData?.presidentName,
        president_phone: registrationData?.presidentPhone,
        president_email: registrationData?.presidentEmail,
        president_id: registrationData?.presidentId,
        secretary_name: registrationData?.secretaryName,
        secretary_phone: registrationData?.secretaryPhone,
        secretary_email: registrationData?.secretaryEmail,
        secretary_id: registrationData?.secretaryId,
        coach_name: registrationData?.coachName,
        coach_phone: registrationData?.coachPhone,
        coach_email: registrationData?.coachEmail,
        coach_license: registrationData?.coachLicense,
        // Banking information
        account_holder_name: registrationData?.accountHolderName,
        bank_name: registrationData?.bankName,
        account_number: registrationData?.accountNumber,
        account_type: registrationData?.accountType,
        branch_name: registrationData?.branchName,
        branch_code: registrationData?.branchCode,
        swift_code: registrationData?.swiftCode,
        team_status: 'pending_approval',
        registration_status: 'submitted',
      };

      const { data: teamData, error: teamError } = await supabase
        ?.from('teams')
        ?.insert(teamPayload)
        ?.select()
        ?.single();

      if (teamError) throw teamError;

      const teamId = teamData?.id;

      // Upload logo if provided (now that we have team ID)
      if (registrationData?.teamLogo && typeof registrationData?.teamLogo === 'object') {
        try {
          const logoUpload = await this.uploadFile(registrationData?.teamLogo, teamId, 'logo');
          logoUrl = logoUpload?.url;
          logoPath = logoUpload?.path;
          
          // Update team with logo URL
          await supabase
            ?.from('teams')
            ?.update({ logo_url: logoUrl })
            ?.eq('id', teamId);
          
          // Save logo as document record
          await this.saveTeamDocument(teamId, {
            documentType: 'team_logo',
            fileName: logoUpload?.fileName,
            filePath: logoPath,
            fileUrl: logoUrl,
            fileSize: logoUpload?.fileSize,
          });
        } catch (uploadError) {
          console.warn('Logo upload failed:', uploadError?.message);
          // Continue without logo - team can be created without it
        }
      }

      // Upload and save documents (gracefully handle failures)
      const uploadErrors = [];
      
      const uploadDocument = async (file, documentType) => {
        if (!file || !(file instanceof File)) return;
        
        try {
          const upload = await this.uploadFile(file, teamId, 'document');
          await this.saveTeamDocument(teamId, {
            documentType: documentType === 'registrationCertificate' || documentType === 'taxClearance' ? 'id_document' : 'other',
            fileName: upload?.fileName,
            filePath: upload?.path, // Store the storage path
            fileUrl: upload?.url,   // Store the public URL
            fileSize: upload?.fileSize,
          });
        } catch (error) {
          console.warn(`Document upload failed for ${documentType}:`, error?.message);
          uploadErrors.push({ documentType, error: error?.message });
        }
      };

      // Upload all documents (non-blocking)
      await Promise.allSettled([
        uploadDocument(registrationData?.registrationCertificate, 'registrationCertificate'),
        uploadDocument(registrationData?.taxClearance, 'taxClearance'),
        uploadDocument(registrationData?.constitutionDocument, 'constitutionDocument'),
        uploadDocument(registrationData?.officialLetter, 'officialLetter'),
      ]);

      // Return the created team (even if some uploads failed)
      const team = await this.getById(teamId);
      
      // Attach upload warnings if any
      if (uploadErrors.length > 0) {
        team.uploadWarnings = uploadErrors;
      }
      
      return team;
    } catch (error) {
      throw new Error(error?.message || 'Failed to register team');
    }
  },
};
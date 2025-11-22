import { supabase } from '../lib/supabase';
import { sendInvitationEmail } from './emailService';

const apiUrl = import.meta.env.VITE_API_URL || 'https://api.tanzaniabasketball.com';

// Helper function to get file URL from file path
const getFileUrlHelper = (filePath) => {
  if (!filePath) return null;
  try {
    // If already a full URL, normalize old localhost URLs
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // Replace old localhost:3001 URLs with new API URL
      if (filePath.includes('localhost:3001')) {
        return filePath.replace(/https?:\/\/localhost:3001/, apiUrl);
      }
      return filePath;
    }
    // Otherwise, construct API URL
    return `${apiUrl}/files/${filePath}`;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

// Helper function to resolve official photo URL with fallbacks
const getOfficialPhotoUrl = (official) => {
  // First check userProfile avatarUrl
  if (official?.userProfile?.avatarUrl) {
    const avatarUrl = official.userProfile.avatarUrl;
    // If already a full URL, use it directly
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    // Otherwise, convert relative path to full API URL
    const url = getFileUrlHelper(avatarUrl);
    if (url) return url;
  }
  
  // Fallback to photoUrl if available
  if (official?.photoUrl) {
    const photoUrl = official.photoUrl;
    // If already a full URL, use it directly
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    // Otherwise, convert relative path to full API URL
    const url = getFileUrlHelper(photoUrl);
    if (url) return url;
  }
  
  // Default fallback to no_image.png
  return '/assets/images/no_image.png';
};

export const officialService = {
  // Get all officials
  async getAll() {
    try {
      const { data, error } = await supabase
        ?.from('officials')
        ?.select(`
          *,
          user_profile:user_profiles!officials_user_profile_id_fkey(
            id,
            full_name,
            email,
            phone,
            avatar_url,
            role
          )
        `)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch documents separately for each official (if table exists)
      const officialsWithDocuments = await Promise.all(
        (data || []).map(async (official) => {
          let officialDocuments = [];
          
          try {
            const { data: documents, error: docError } = await supabase
              ?.from('official_documents')
              ?.select('document_type, file_url, file_path')
              ?.eq('official_id', official.id);
            
            if (!docError && documents) {
              officialDocuments = documents;
            }
          } catch (err) {
            // Table doesn't exist yet - that's okay, just continue without documents
            console.warn('official_documents table not found. Please run migration to enable document storage.');
          }
          
          const photoDocument = officialDocuments?.find(
            (doc) => doc?.document_type === 'official_photo'
          );
          
          const photoPath = photoDocument?.file_path || null;
          const photoUrl = photoPath ? getFileUrlHelper(photoPath) : null;
          
          const officialData = {
            id: official.id,
            userProfileId: official.user_profile_id,
            licenseNumber: official.license_number,
            certificationLevel: official.certification_level,
            experienceYears: official.experience_years,
            specialization: official.specialization,
            isAvailable: official.is_available,
            rating: official.rating,
            createdAt: official.created_at,
            updatedAt: official.updated_at,
            photoPath: photoPath,
            photoUrl: photoUrl,
            userProfile: official.user_profile ? {
              id: official.user_profile.id,
              fullName: official.user_profile.full_name,
              email: official.user_profile.email,
              phone: official.user_profile.phone,
              avatarUrl: official.user_profile.avatar_url,
              role: official.user_profile.role
            } : null
          };
          
          // Resolve photo URL with fallbacks
          officialData.photoUrl = getOfficialPhotoUrl(officialData);
          
          return officialData;
        })
      );

      return officialsWithDocuments;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch officials');
    }
  },

  // Get official by ID
  async getById(officialId) {
    try {
      const { data, error } = await supabase
        ?.from('officials')
        ?.select(`
          *,
          user_profile:user_profiles!officials_user_profile_id_fkey(
            id,
            full_name,
            email,
            phone,
            avatar_url,
            role
          )
        `)
        ?.eq('id', officialId)
        ?.single();

      if (error) throw error;

      // Fetch documents separately (if table exists)
      let officialDocuments = [];
      try {
        const { data: documents, error: docError } = await supabase
          ?.from('official_documents')
          ?.select('id, document_type, file_name, file_url, file_path, file_size, description, created_at')
          ?.eq('official_id', officialId);
        
        if (!docError && documents) {
          officialDocuments = documents;
        }
      } catch (err) {
        // Table doesn't exist yet - that's okay, just continue without documents
        console.warn('official_documents table not found. Please run migration to enable document storage.');
      }
      
      const photoDocument = officialDocuments?.find(
        (doc) => doc?.document_type === 'official_photo'
      );
      
      const photoPath = photoDocument?.file_path || null;
      const photoUrl = photoPath ? getFileUrlHelper(photoPath) : null;

      const officialData = {
        id: data.id,
        userProfileId: data.user_profile_id,
        licenseNumber: data.license_number,
        certificationLevel: data.certification_level,
        experienceYears: data.experience_years,
        specialization: data.specialization,
        isAvailable: data.is_available,
        rating: data.rating,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        photoPath: photoPath,
        photoUrl: photoUrl,
        documents: officialDocuments?.map(doc => ({
          id: doc.id,
          documentType: doc.document_type,
          fileName: doc.file_name,
          fileUrl: doc.file_url,
          filePath: doc.file_path,
          fileSize: doc.file_size,
          description: doc.description,
          createdAt: doc.created_at,
        })) || [],
        userProfile: data.user_profile ? {
          id: data.user_profile.id,
          fullName: data.user_profile.full_name,
          email: data.user_profile.email,
          phone: data.user_profile.phone,
          avatarUrl: data.user_profile.avatar_url,
          role: data.user_profile.role
        } : null
      };
      
      // Resolve photo URL with fallbacks
      officialData.photoUrl = getOfficialPhotoUrl(officialData);
      
      return officialData;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch official');
    }
  },

  // Upload official photo file
  async uploadFile(file, officialId, fileType = 'photo') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('officialId', officialId);
      formData.append('fileType', fileType);

      const response = await fetch(`${apiUrl}/upload-official-file`, {
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
      console.error('Official file upload error:', error);
      throw new Error(error.message || 'Failed to upload file');
    }
  },

  // Delete file from local storage
  async deleteFile(filePath) {
    try {
      if (!filePath) return;

      const response = await fetch(`${apiUrl}/delete-file`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete file (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(error.message || 'Failed to delete file');
    }
  },

  // Save official document with path and URL
  async saveOfficialDocument(officialId, documentData) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Build insert payload
      // file_path: Local file path (e.g., officials/{officialId}/photo/{filename}) - PRIMARY storage
      // file_url: Full URL to access file (e.g., https://api.tanzaniabasketball.com/files/officials/{officialId}/photo/{filename}) - for backward compatibility
      const insertPayload = {
        official_id: officialId,
        document_type: documentData?.documentType || 'other',
        file_name: documentData?.fileName,
        file_size: documentData?.fileSize,
        uploaded_by: user?.id,
      };

      // Store file_path (local path) - this is the primary storage method
      // Format: officials/{officialId}/photo/{filename} or officials/{officialId}/documents/{filename}
      if (documentData?.filePath) {
        insertPayload.file_path = documentData.filePath;
      }

      // Store file_url (full URL) - for backward compatibility and direct access
      if (documentData?.fileUrl) {
        insertPayload.file_url = documentData.fileUrl;
      }

      // Add description if provided
      if (documentData?.description) {
        insertPayload.description = documentData.description;
      }

      const { data, error } = await supabase
        ?.from('official_documents')
        ?.insert(insertPayload)
        ?.select()
        ?.single();

      if (error) {
        // If error is about missing table, provide helpful message
        if (error?.message?.includes('official_documents') || error?.message?.includes('does not exist')) {
          throw new Error(`Database schema needs update. Please run migration to create official_documents table.\n\nOriginal error: ${error.message}`);
        }
        // If error is about missing column, provide helpful message
        if (error?.message?.includes('file_path') || error?.message?.includes('column')) {
          throw new Error(`Database schema needs update. Please run migration to add file_path column to official_documents table.\n\nOriginal error: ${error.message}`);
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw new Error(error?.message || 'Failed to save official document');
    }
  },

  // Register a new official
  async registerOfficial(officialData) {
    try {
      // Step 1: Create auth user via secure backend endpoint
      const response = await fetch(`${apiUrl}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: officialData.email,
          password: officialData.password,
          fullName: officialData.fullName,
          role: 'official',
          phone: officialData.phone || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create official user');
      }

      const result = await response.json();
      const newUserId = result?.user?.id;
      if (!newUserId) {
        throw new Error('Failed to retrieve newly created official ID');
      }

      // Give database trigger a moment (optional) - usually not needed but safe
      // Step 2: Create official record linked to new user profile
      const { data, error } = await supabase
        ?.from('officials')
        ?.insert({
          user_profile_id: newUserId,
          license_number: officialData.licenseNumber,
          certification_level: officialData.certificationLevel,
          experience_years: officialData.experienceYears || 0,
          specialization: officialData.specialization,
          is_available: officialData.isAvailable !== false
        })
        ?.select()
        ?.single();

      if (error) throw error;

      // Upload and save photo if provided (after official record is created so we have the ID)
      if (officialData.officialPhotoFile) {
        try {
          const uploadResult = await this.uploadFile(
            officialData.officialPhotoFile,
            data.id,
            'photo'
          );
          
          // Save photo document to database
          await this.saveOfficialDocument(data.id, {
            documentType: 'official_photo',
            fileName: uploadResult.fileName,
            filePath: uploadResult.filePath,
            fileUrl: uploadResult.fileUrl,
            fileSize: uploadResult.fileSize,
          });
          
          // Update user profile with photo URL
          await supabase
            ?.from('user_profiles')
            ?.update({ avatar_url: uploadResult.fileUrl })
            ?.eq('id', newUserId);
        } catch (uploadError) {
          console.error('Error uploading official photo:', uploadError);
          // Don't fail registration if photo upload fails
        }
      }

      // Upload and save passport/ID if provided (optional)
      if (officialData.passportFile) {
        try {
          const uploadResult = await this.uploadFile(
            officialData.passportFile,
            data.id,
            'document'
          );
          
          // Save passport document to database
          await this.saveOfficialDocument(data.id, {
            documentType: 'passport',
            fileName: uploadResult.fileName,
            filePath: uploadResult.filePath,
            fileUrl: uploadResult.fileUrl,
            fileSize: uploadResult.fileSize,
            description: 'Passport or ID document',
          });
        } catch (uploadError) {
          console.error('Error uploading passport:', uploadError);
          // Don't fail registration if passport upload fails
        }
      }

      // Send invitation email (non-blocking - don't fail registration if email fails)
      try {
        const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
        await sendInvitationEmail({
          to: officialData.email,
          fullName: officialData.fullName,
          email: officialData.email,
          password: officialData.password,
          role: 'official',
          loginUrl,
        });
      } catch (emailError) {
        // Log error but don't fail registration
        console.error('Failed to send invitation email to official:', emailError);
        // In production, you might want to queue this for retry
      }

      return {
        id: data.id,
        userProfileId: data.user_profile_id,
        licenseNumber: data.license_number,
        certificationLevel: data.certification_level,
        experienceYears: data.experience_years,
        specialization: data.specialization,
        isAvailable: data.is_available,
        rating: data.rating,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to register official');
    }
  },

  // Update official
  async update(officialId, officialData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, get the official to find their user_profile_id
      const { data: official, error: fetchError } = await supabase
        ?.from('officials')
        ?.select('user_profile_id')
        ?.eq('id', officialId)
        ?.single();

      if (fetchError) throw fetchError;
      if (!official?.user_profile_id) throw new Error('Official user profile not found');

      // Update user profile if provided (use the official's user_profile_id, not the admin's)
      if (officialData.fullName || officialData.phone || officialData.email) {
        const profileUpdate = {};
        if (officialData.fullName) profileUpdate.full_name = officialData.fullName;
        if (officialData.phone) profileUpdate.phone = officialData.phone;
        if (officialData.email) profileUpdate.email = officialData.email;

        const { error: profileError } = await supabase
          ?.from('user_profiles')
          ?.update(profileUpdate)
          ?.eq('id', official.user_profile_id);

        if (profileError) throw profileError;
      }

      // Update official record
      const updateData = {};
      if (officialData.licenseNumber !== undefined) updateData.license_number = officialData.licenseNumber;
      if (officialData.certificationLevel !== undefined) updateData.certification_level = officialData.certificationLevel;
      if (officialData.experienceYears !== undefined) updateData.experience_years = officialData.experienceYears;
      if (officialData.specialization !== undefined) updateData.specialization = officialData.specialization;
      if (officialData.isAvailable !== undefined) updateData.is_available = officialData.isAvailable;
      if (officialData.rating !== undefined) updateData.rating = officialData.rating;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        ?.from('officials')
        ?.update(updateData)
        ?.eq('id', officialId)
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data.id,
        userProfileId: data.user_profile_id,
        licenseNumber: data.license_number,
        certificationLevel: data.certification_level,
        experienceYears: data.experience_years,
        specialization: data.specialization,
        isAvailable: data.is_available,
        rating: data.rating,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to update official');
    }
  },

  // Delete official
  async delete(officialId) {
    try {
      const { error } = await supabase
        ?.from('officials')
        ?.delete()
        ?.eq('id', officialId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete official');
    }
  },

  // Get officials by specialization
  async getBySpecialization(specialization) {
    try {
      const { data, error } = await supabase
        ?.from('officials')
        ?.select(`
          *,
          user_profile:user_profiles!officials_user_profile_id_fkey(
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        ?.eq('specialization', specialization)
        ?.eq('is_available', true)
        ?.order('rating', { ascending: false });

      if (error) throw error;

      return data?.map(official => {
        const officialData = {
          id: official.id,
          userProfileId: official.user_profile_id,
          licenseNumber: official.license_number,
          certificationLevel: official.certification_level,
          experienceYears: official.experience_years,
          specialization: official.specialization,
          isAvailable: official.is_available,
          rating: official.rating,
          userProfile: official.user_profile ? {
            id: official.user_profile.id,
            fullName: official.user_profile.full_name,
            email: official.user_profile.email,
            phone: official.user_profile.phone,
            avatarUrl: official.user_profile.avatar_url
          } : null
        };
        
        // Resolve photo URL with fallbacks
        officialData.photoUrl = getOfficialPhotoUrl(officialData);
        
        return officialData;
      }) || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch officials by specialization');
    }
  },

  // Get official photo URL with fallback to no_image.png
  // Returns API path for stored photos or frontend asset path for missing photos
  getOfficialPhotoUrl(official) {
    return getOfficialPhotoUrl(official);
  },

  // Get file URL from file path
  getFileUrl(filePath) {
    return getFileUrlHelper(filePath);
  },

  // Get documents for an official
  async getDocuments(officialId) {
    try {
      const { data, error } = await supabase
        ?.from('official_documents')
        ?.select('*')
        ?.eq('official_id', officialId)
        ?.order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error?.message?.includes('does not exist') || error?.message?.includes('official_documents')) {
          console.warn('official_documents table not found. Please run migration to enable document storage.');
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching official documents:', error);
      return [];
    }
  }
};


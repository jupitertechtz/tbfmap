import { supabase } from '../lib/supabase';
import { sendInvitationEmail } from './emailService';

const normalizeProfile = (profile) => ({
  id: profile?.id,
  email: profile?.email || '',
  fullName: profile?.full_name || '',
  phone: profile?.phone || '',
  role: profile?.role || '',
  avatarUrl: profile?.avatar_url || '',
  isActive: profile?.is_active ?? true,
  createdAt: profile?.created_at,
  updatedAt: profile?.updated_at,
});

export const userService = {
  async listUsers({ searchTerm, role } = {}) {
    let query = supabase
      ?.from('user_profiles')
      ?.select('*')
      ?.order('created_at', { ascending: false });

    if (searchTerm) {
      const sanitized = searchTerm?.replace(/[%]/g, '');
      query = query?.or(
        `full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%`
      );
    }

    if (role && role !== 'all') {
      query = query?.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error?.message || 'Failed to load users');
    }

    return data?.map(normalizeProfile) ?? [];
  },

  async createUser({ email, password, fullName, role, phone }) {
    try {
      // Use backend API for secure user creation (service role key stays server-side)
      const apiUrl = import.meta.env.VITE_API_URL || 
        'https://api.tanzaniabasketball.com';
      
      const response = await fetch(`${apiUrl}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          phone: phone || null,
        }),
      });

      if (!response.ok) {
        let errorData;
        let errorText;
        try {
          errorText = await response.text();
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('User creation API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || errorData.error || `Failed to create user (${response.status})`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create user');
      }

      // Convert API response to profile format
      const profile = {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.fullName,
        role: result.user.role,
        phone: result.user.phone,
        avatar_url: null,
        is_active: true,
        created_at: result.user.createdAt,
        updated_at: result.user.createdAt,
      };

      // Send invitation email (non-blocking - don't fail user creation if email fails)
      try {
        const loginUrl = `${window.location.origin}/login`;
        await sendInvitationEmail({
          to: email,
          fullName,
          email,
          password,
          role,
          loginUrl,
        });
      } catch (emailError) {
        // Log error but don't fail user creation
        console.error('Failed to send invitation email:', emailError);
        // In production, you might want to queue this for retry
      }

      return normalizeProfile(profile);
    } catch (error) {
      throw new Error(error?.message || 'Failed to create user');
    }
  },

  async updateUserProfile(userId, { fullName, phone, role, isActive }) {
    const payload = {};

    if (fullName !== undefined) payload.full_name = fullName;
    if (phone !== undefined) payload.phone = phone;
    if (role !== undefined) payload.role = role;
    if (isActive !== undefined) payload.is_active = isActive;

    payload.updated_at = new Date()?.toISOString();

    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.update(payload)
      ?.eq('id', userId)
      ?.select()
      ?.single();

    if (error) {
      throw new Error(error?.message || 'Failed to update user profile');
    }

    return normalizeProfile(data);
  },

  async toggleUserActive(userId, isActive) {
    return this.updateUserProfile(userId, { isActive });
  },

  async deleteUser(userId) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.tanzaniabasketball.com';
      const response = await fetch(`${apiUrl}/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to delete user');
      }

      return true;
    } catch (error) {
      throw new Error(error?.message || 'Failed to delete user');
    }
  },

  async uploadAvatar(userId, file) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Not authorized to upload avatar');
      }

      const fileExt = file?.name?.split('.').pop();
      const fileName = `avatars/${userId}/${Date.now()}-${Math.random()?.toString(36)?.substr(2, 9)}.${fileExt}`;

      // Upload to user-avatars bucket (or create a general avatars bucket)
      const { data, error } = await supabase?.storage
        ?.from('user-avatars')
        ?.upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        // If bucket doesn't exist, try a fallback bucket
        if (error?.message?.includes('Bucket not found') || error?.message?.includes('bucket')) {
          // Try uploading to a general storage bucket
          const { data: fallbackData, error: fallbackError } = await supabase?.storage
            ?.from('avatars')
            ?.upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (fallbackError) {
            throw new Error('Storage bucket not configured. Please create a bucket named "user-avatars" or "avatars" in Supabase Storage.');
          }

          const {
            data: { publicUrl },
          } = supabase?.storage?.from('avatars')?.getPublicUrl(fallbackData?.path);
          return publicUrl;
        }
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase?.storage?.from('user-avatars')?.getPublicUrl(data?.path);

      return publicUrl;
    } catch (error) {
      throw new Error(error?.message || 'Failed to upload avatar');
    }
  },

  async updatePassword(currentPassword, newPassword) {
    try {
      const {
        data: { user },
      } = await supabase?.auth?.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Verify current password
      const { error: signInError } = await supabase?.auth?.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase?.auth?.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update password');
      }

      return { success: true };
    } catch (error) {
      throw new Error(error?.message || 'Failed to update password');
    }
  },
};


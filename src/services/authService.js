import { supabase } from '../lib/supabase';

export const authService = {
  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Sign up with profile data
  async signUp(email, password, profileData) {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData?.fullName || '',
            role: profileData?.role || 'player',
            phone: profileData?.phone || '',
            avatar_url: profileData?.avatarUrl || ''
          }
        }
      });
      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase?.auth?.signOut();
      return { error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase?.auth?.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error: { message: 'Network error. Please try again.' } };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      });
      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase?.auth?.updateUser({
        password: newPassword
      });
      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  }
};
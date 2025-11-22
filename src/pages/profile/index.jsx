import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { userService } from '../../services/userService';
import { sendProfileUpdateEmail } from '../../services/emailService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, updateProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [banner, setBanner] = useState(null);
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password form errors
  const [passwordErrors, setPasswordErrors] = useState({});

  // Initialize form with user profile data
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullName: userProfile?.full_name || '',
        email: userProfile?.email || '',
        phone: userProfile?.phone || '',
      });
    }
  }, [userProfile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setBanner(null);

    try {
      // Track changes for email notification
      const changes = {};
      const newFullName = profileForm.fullName.trim();
      const newPhone = profileForm.phone.trim() || null;

      if (userProfile?.full_name !== newFullName) {
        changes.full_name = {
          old: userProfile?.full_name || 'Not set',
          new: newFullName,
        };
      }

      if (userProfile?.phone !== newPhone) {
        changes.phone = {
          old: userProfile?.phone || 'Not set',
          new: newPhone || 'Not set',
        };
      }

      const updates = {
        full_name: newFullName,
        phone: newPhone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await updateProfile(updates);

      if (error) {
        throw new Error(error.message || 'Failed to update profile');
      }

      // Send email notification if there are changes (non-blocking)
      if (Object.keys(changes).length > 0) {
        try {
          await sendProfileUpdateEmail({
            to: userProfile?.email,
            fullName: newFullName || userProfile?.full_name,
            changes,
          });
        } catch (emailError) {
          // Log error but don't fail profile update
          console.error('Failed to send profile update email:', emailError);
          // Optionally show a warning that email wasn't sent
        }
      }

      setBanner({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (error) {
      setBanner({
        type: 'error',
        message: error.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setBanner(null);

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userProfile?.email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update password');
      }

      // Clear password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setBanner({
        type: 'success',
        message: 'Password changed successfully!',
      });
    } catch (error) {
      setBanner({
        type: 'error',
        message: error.message || 'Failed to change password. Please try again.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setBanner({
        type: 'error',
        message: 'Please select an image file',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setBanner({
        type: 'error',
        message: 'Image size must be less than 5MB',
      });
      return;
    }

    if (!user?.id) {
      setBanner({
        type: 'error',
        message: 'User not authenticated',
      });
      return;
    }

    setIsUploadingAvatar(true);
    setBanner(null);

    try {
      const avatarUrl = await userService.uploadAvatar(user.id, file);

      // Update profile with new avatar URL
      const { error } = await updateProfile({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message || 'Failed to update avatar');
      }

      setBanner({
        type: 'success',
        message: 'Avatar updated successfully!',
      });
    } catch (error) {
      setBanner({
        type: 'error',
        message: error.message || 'Failed to upload avatar. Please try again.',
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Profile Settings', path: '/profile' },
  ];

  // Show loading state
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

  // Show access denied if not authenticated
  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} mt-16`}>
          <div className="p-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Banner */}
            {banner && (
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  banner.type === 'success'
                    ? 'bg-success/10 border-success/20 text-success'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name={banner.type === 'success' ? 'CheckCircle' : 'AlertCircle'}
                      size={20}
                    />
                    <p>{banner.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBanner(null)}
                    iconName="X"
                  />
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Profile Information Card */}
              <div className="bg-card rounded-lg border border-border p-6 card-shadow">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <Icon name="User" size={20} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                    <p className="text-sm text-muted-foreground">Update your personal information</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6 pb-6 border-b border-border">
                    <div className="relative">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt={userProfile.full_name || 'User'}
                          className="w-24 h-24 rounded-full object-cover border-4 border-border"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-border flex items-center justify-center">
                          <Icon name="User" size={48} className="text-primary" />
                        </div>
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
                          <Icon name="Loader2" size={24} className="text-primary animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-foreground mb-1">Profile Picture</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        JPG, PNG or GIF. Max size 5MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        iconName="Upload"
                        iconPosition="left"
                      >
                        {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={profileForm.fullName}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                      required
                      disabled={isLoading}
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={profileForm.email}
                      disabled
                      helperText="Email cannot be changed"
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      disabled={isLoading}
                      placeholder="+255 123 456 789"
                    />

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Role
                      </label>
                      <div className="px-3 py-2 bg-muted rounded-md border border-border">
                        <span className="text-sm text-foreground capitalize">
                          {userProfile?.role?.replace(/_/g, ' ') || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Role cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      loading={isLoading}
                      iconName="Save"
                      iconPosition="left"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>

              {/* Change Password Card */}
              <div className="bg-card rounded-lg border border-border p-6 card-shadow">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/60 rounded-lg flex items-center justify-center">
                    <Icon name="Lock" size={20} className="text-warning-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    required
                    disabled={isChangingPassword}
                    error={passwordErrors.currentPassword}
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    required
                    disabled={isChangingPassword}
                    error={passwordErrors.newPassword}
                    helperText="Must be at least 6 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    required
                    disabled={isChangingPassword}
                    error={passwordErrors.confirmPassword}
                  />

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      loading={isChangingPassword}
                      iconName="Key"
                      iconPosition="left"
                    >
                      Change Password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;


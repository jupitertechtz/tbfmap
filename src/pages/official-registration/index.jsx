import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { officialService } from '../../services/officialService';
import { useAuth } from '../../contexts/AuthContext';
import AppImage from '../../components/AppImage';

const OfficialRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const editOfficialId = searchParams.get('edit');
  const isEditMode = !!editOfficialId;
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: userProfile?.fullName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    password: '',
    confirmPassword: '',
    
    // Official Information
    specialization: '', // Referee, Table Official, Commissioner
    licenseNumber: '',
    certificationLevel: '',
    experienceYears: '',
    isAvailable: true,
    // Photo
    officialPhoto: null,
    officialPhotoFile: null,
    // Passport (optional)
    passportFile: null
  });

  const [errors, setErrors] = useState({});
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [officialPhotoDocument, setOfficialPhotoDocument] = useState(null);
  const [passportDocument, setPassportDocument] = useState(null);
  
  // File upload state (similar to player form)
  const [editFiles, setEditFiles] = useState({
    officialPhoto: null,
    officialPhotoPreview: null,
    passportDocument: null,
    removeExistingPhoto: false,
  });
  
  // File input refs
  const photoInputRef = React.useRef(null);
  const passportInputRef = React.useRef(null);

  // Helper function to get photo URL with fallbacks
  const getPhotoUrl = (document) => {
    if (!document) return '/assets/images/no_image.png';
    
    if (document?.file_path) {
      const url = officialService.getFileUrl(document.file_path);
      if (url && typeof url === 'string') {
        return url;
      }
    }
    
    if (document?.file_url && typeof document.file_url === 'string') {
      return officialService.getFileUrl(document.file_url);
    }
    
    return '/assets/images/no_image.png';
  };

  // Helper function to get document URL
  const getDocumentUrl = (document) => {
    if (!document) return null;
    
    if (document?.file_path) {
      return officialService.getFileUrl(document.file_path);
    }
    
    return document?.file_url ? officialService.getFileUrl(document.file_url) : null;
  };

  // Handle file upload
  const handleFileUpload = (file, fieldName) => {
    if (!file) {
      // Clear the file
      if (fieldName === 'officialPhoto') {
        // If clearing a newly selected photo, revert to stored photo
        if (officialPhotoDocument) {
          const storedPhotoUrl = getPhotoUrl(officialPhotoDocument);
          setEditFiles(prev => ({
            ...prev,
            officialPhoto: null,
            officialPhotoPreview: storedPhotoUrl,
            removeExistingPhoto: false,
          }));
        } else {
          setEditFiles(prev => ({
            ...prev,
            officialPhoto: null,
            officialPhotoPreview: null,
            removeExistingPhoto: false,
          }));
        }
      } else {
        setEditFiles(prev => ({
          ...prev,
          [fieldName]: null,
        }));
      }
      return;
    }

    // Validate file type for photo
    if (fieldName === 'officialPhoto') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file?.type)) {
        setErrors(prev => ({
          ...prev,
          officialPhoto: 'Please select a valid image file (JPEG, PNG, or WebP)',
        }));
        return;
      }
      // Create preview for photo
      const previewUrl = URL.createObjectURL(file);
      setEditFiles(prev => ({
        ...prev,
        officialPhoto: file,
        officialPhotoPreview: previewUrl,
        removeExistingPhoto: false,
      }));
    } else {
      // For documents, just store the file
      setEditFiles(prev => ({
        ...prev,
        [fieldName]: file,
      }));
    }

    // Clear error
    if (errors?.[fieldName]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  // Open file dialog
  const openFileDialog = (fieldName) => {
    const ref = fieldName === 'officialPhoto' ? photoInputRef : passportInputRef;
    if (ref?.current) {
      ref.current.click();
    }
  };

  // Handle photo remove click
  const handlePhotoRemoveClick = () => {
    if (editFiles.officialPhoto) {
      // Remove newly selected photo, revert to stored
      if (officialPhotoDocument) {
        const storedPhotoUrl = getPhotoUrl(officialPhotoDocument);
        setEditFiles(prev => ({
          ...prev,
          officialPhoto: null,
          officialPhotoPreview: storedPhotoUrl,
          removeExistingPhoto: false,
        }));
      } else {
        setEditFiles(prev => ({
          ...prev,
          officialPhoto: null,
          officialPhotoPreview: null,
          removeExistingPhoto: false,
        }));
      }
    } else if (officialPhotoDocument) {
      // Flag existing photo for removal
      setEditFiles(prev => ({
        ...prev,
        officialPhotoPreview: null,
        removeExistingPhoto: true,
      }));
    }
  };

  // Load official data if in edit mode
  useEffect(() => {
    if (isEditMode && editOfficialId) {
      const loadOfficial = async () => {
        setIsLoading(true);
        try {
          const official = await officialService.getById(editOfficialId);
          setFormData({
            fullName: official?.userProfile?.fullName || '',
            email: official?.userProfile?.email || '',
            phone: official?.userProfile?.phone || '',
            password: '', // Not required in edit mode
            confirmPassword: '', // Not required in edit mode
            specialization: official?.specialization || '',
            licenseNumber: official?.licenseNumber || '',
            certificationLevel: official?.certificationLevel || '',
            experienceYears: official?.experienceYears?.toString() || '',
            isAvailable: official?.isAvailable !== false,
            officialPhoto: official?.photoUrl || official?.userProfile?.avatarUrl || null,
            officialPhotoFile: null,
            passportFile: null
          });
          
          // Load existing documents
          setIsLoadingDocuments(true);
          try {
            const { supabase } = await import('../../lib/supabase');
            const { data: documents, error: docError } = await supabase
              ?.from('official_documents')
              ?.select('*')
              ?.eq('official_id', editOfficialId)
              ?.order('created_at', { ascending: false });
            
            if (!docError && documents) {
              setExistingDocuments(documents || []);
              
              const photoDoc = documents?.find((doc) => doc?.document_type === 'official_photo');
              const passportDoc = documents?.find((doc) => doc?.document_type === 'passport');
              
              setOfficialPhotoDocument(photoDoc || null);
              setPassportDocument(passportDoc || null);
              
              // Set initial photo preview if available
              if (photoDoc) {
                const photoUrl = getPhotoUrl(photoDoc);
                setEditFiles(prev => ({
                  ...prev,
                  officialPhotoPreview: photoUrl,
                }));
              } else {
                setEditFiles(prev => ({
                  ...prev,
                  officialPhotoPreview: '/assets/images/no_image.png',
                }));
              }
            }
          } catch (docErr) {
            console.warn('Error loading official documents:', docErr);
            // Don't fail if documents table doesn't exist yet
          } finally {
            setIsLoadingDocuments(false);
          }
        } catch (err) {
          console.error('Error loading official:', err);
          setError(err.message || 'Failed to load official data');
        } finally {
          setIsLoading(false);
        }
      };
      loadOfficial();
    }
  }, [isEditMode, editOfficialId]);

  const specializationOptions = [
    { value: 'Referee', label: 'Referee' },
    { value: 'Table Official', label: 'Table Official' },
    { value: 'Commissioner', label: 'Commissioner' }
  ];

  const certificationLevelOptions = [
    { value: 'Level 1', label: 'Level 1 - Entry Level' },
    { value: 'Level 2', label: 'Level 2 - Intermediate' },
    { value: 'Level 3', label: 'Level 3 - Advanced' },
    { value: 'Level 4', label: 'Level 4 - Expert' },
    { value: 'FIBA Certified', label: 'FIBA Certified' },
    { value: 'National', label: 'National Level' },
    { value: 'International', label: 'International Level' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear messages
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Please select your specialization';
    }

    if (!formData.licenseNumber?.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.certificationLevel) {
      newErrors.certificationLevel = 'Please select your certification level';
    }

    if (formData.experienceYears && (isNaN(formData.experienceYears) || parseInt(formData.experienceYears) < 0)) {
      newErrors.experienceYears = 'Experience years must be a valid number';
    }

    // Password validation only required for new registrations
    if (!isEditMode) {
      if (!formData.password?.trim()) {
        newErrors.password = 'Temporary password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword?.trim()) {
        newErrors.confirmPassword = 'Please confirm the password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password || formData.confirmPassword) {
      // If password is provided in edit mode, validate it
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditMode) {
        // Update existing official
        const updateData = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber.trim(),
          certificationLevel: formData.certificationLevel,
          experienceYears: parseInt(formData.experienceYears) || 0,
          isAvailable: formData.isAvailable,
        };

        await officialService.update(editOfficialId, updateData);
        
        // Handle photo removal if requested
        if (editFiles.removeExistingPhoto && officialPhotoDocument) {
          try {
            // Delete the photo file
            if (officialPhotoDocument.file_path) {
              await officialService.deleteFile(officialPhotoDocument.file_path);
            }
            // Delete the document record
            const { supabase } = await import('../../lib/supabase');
            await supabase
              ?.from('official_documents')
              ?.delete()
              ?.eq('id', officialPhotoDocument.id);
            // Clear avatar URL
            const official = await officialService.getById(editOfficialId);
            if (official?.userProfileId) {
              await supabase
                ?.from('user_profiles')
                ?.update({ avatar_url: null })
                ?.eq('id', official.userProfileId);
            }
          } catch (deleteError) {
            console.error('Error removing official photo:', deleteError);
            // Don't fail the update if photo removal fails
          }
        }
        
        // Handle photo upload if new photo is provided
        if (editFiles.officialPhoto) {
          try {
            const uploadResult = await officialService.uploadFile(
              editFiles.officialPhoto,
              editOfficialId,
              'photo'
            );
            
            // Delete old photo if exists
            if (officialPhotoDocument && !editFiles.removeExistingPhoto) {
              if (officialPhotoDocument.file_path) {
                await officialService.deleteFile(officialPhotoDocument.file_path);
              }
              const { supabase } = await import('../../lib/supabase');
              await supabase
                ?.from('official_documents')
                ?.delete()
                ?.eq('id', officialPhotoDocument.id);
            }
            
            // Save photo document to database
            await officialService.saveOfficialDocument(editOfficialId, {
              documentType: 'official_photo',
              fileName: uploadResult.fileName,
              filePath: uploadResult.filePath,
              fileUrl: uploadResult.fileUrl,
              fileSize: uploadResult.fileSize,
            });
            
            // Update user profile with new photo URL
            const official = await officialService.getById(editOfficialId);
            if (official?.userProfileId) {
              const { supabase } = await import('../../lib/supabase');
              await supabase
                ?.from('user_profiles')
                ?.update({ avatar_url: uploadResult.fileUrl })
                ?.eq('id', official.userProfileId);
            }
          } catch (uploadError) {
            console.error('Error uploading official photo:', uploadError);
            // Don't fail the update if photo upload fails
          }
        }
        
        // Handle passport document upload if provided
        if (editFiles.passportDocument) {
          try {
            const uploadResult = await officialService.uploadFile(
              editFiles.passportDocument,
              editOfficialId,
              'document'
            );
            
            // Delete old passport if exists
            if (passportDocument) {
              if (passportDocument.file_path) {
                await officialService.deleteFile(passportDocument.file_path);
              }
              const { supabase } = await import('../../lib/supabase');
              await supabase
                ?.from('official_documents')
                ?.delete()
                ?.eq('id', passportDocument.id);
            }
            
            // Save passport document to database
            await officialService.saveOfficialDocument(editOfficialId, {
              documentType: 'passport',
              fileName: uploadResult.fileName,
              filePath: uploadResult.filePath,
              fileUrl: uploadResult.fileUrl,
              fileSize: uploadResult.fileSize,
            });
          } catch (uploadError) {
            console.error('Error uploading passport document:', uploadError);
            // Don't fail the update if document upload fails
          }
        }
        
        setSuccess('Official profile updated successfully!');
        
        // Redirect after a delay
        setTimeout(() => {
          navigate('/league-officials');
        }, 2000);
      } else {
        // Register new official
        const registrationData = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password.trim(),
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber.trim(),
          certificationLevel: formData.certificationLevel,
          experienceYears: parseInt(formData.experienceYears) || 0,
          isAvailable: formData.isAvailable,
          officialPhotoFile: editFiles.officialPhoto || formData.officialPhotoFile, // File object for upload
          passportFile: editFiles.passportDocument || formData.passportFile // File object for upload (optional)
        };

        await officialService.registerOfficial(registrationData);
        
        setSuccess('Official registration submitted successfully!');
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          specialization: '',
          licenseNumber: '',
          certificationLevel: '',
          experienceYears: '',
          isAvailable: true,
          password: '',
          confirmPassword: '',
          officialPhoto: null,
          officialPhotoFile: null,
          passportFile: null
        });
        setEditFiles({
          officialPhoto: null,
          officialPhotoPreview: null,
          passportDocument: null,
          removeExistingPhoto: false,
        });

        // Redirect after a delay
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'registering'} official:`, err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'register'} official. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/admin-dashboard' },
    { label: 'League Officials', path: '/league-officials' },
    { label: isEditMode ? 'Edit Official' : 'Official Registration' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="UserCheck" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {isEditMode ? 'Edit Official Profile' : 'Official Registration'}
                    </h1>
                    <p className="text-muted-foreground">
                      {isEditMode 
                        ? 'Update official information and profile details'
                        : 'Register as a game official (Referee, Table Official, or Commissioner)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-lg border bg-success/10 border-success/20 text-success">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={18} />
                <p className="font-medium">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={18} />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          )}

          {/* Registration Form */}
          {!isLoading && (
            <div className="bg-card border border-border rounded-lg card-shadow">
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="User" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={errors.fullName}
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    required
                  />
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+255 XXX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  required
                />

                {!isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Temporary Password"
                      type="password"
                      placeholder="Enter temporary password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      error={errors.password}
                      required
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter temporary password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      error={errors.confirmPassword}
                      required
                    />
                  </div>
                )}
                
                {isEditMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="New Password (Optional)"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      error={errors.password}
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      error={errors.confirmPassword}
                    />
                  </div>
                )}
              </div>

              {/* Official Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Award" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Official Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Specialization"
                    options={specializationOptions}
                    value={formData.specialization}
                    onChange={(value) => handleInputChange('specialization', value)}
                    error={errors.specialization}
                    placeholder="Select your specialization"
                    required
                  />
                  
                  <Input
                    label="License Number"
                    type="text"
                    placeholder="e.g., TBF-REF-2024-001"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    error={errors.licenseNumber}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Certification Level"
                    options={certificationLevelOptions}
                    value={formData.certificationLevel}
                    onChange={(value) => handleInputChange('certificationLevel', value)}
                    error={errors.certificationLevel}
                    placeholder="Select certification level"
                    required
                  />
                  
                  <Input
                    label="Years of Experience"
                    type="number"
                    placeholder="0"
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                    error={errors.experienceYears}
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-medium text-foreground cursor-pointer">
                    I am currently available for assignments
                  </label>
                </div>
              </div>

              {/* Documents & Photos Card */}
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="FileImage" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Documents & Photos</h3>
                </div>

                {/* Official Photo */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Official Photo</label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload a clear, recent photo. Formats: JPEG, PNG, WebP (Max 5MB)
                    </p>
                    {editFiles.officialPhotoPreview ? (
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <AppImage
                            src={editFiles.officialPhotoPreview}
                            alt="Official photo preview"
                            className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                          />
                          <button
                            type="button"
                            onClick={handlePhotoRemoveClick}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 transition-colors"
                            title={editFiles.officialPhoto ? 'Remove selected photo' : 'Remove current photo'}
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                        <div className="flex-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openFileDialog('officialPhoto')}
                            disabled={isSubmitting || isLoading}
                            iconName="RefreshCw"
                            iconPosition="left"
                          >
                            Change Photo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openFileDialog('officialPhoto')}
                          disabled={isSubmitting || isLoading}
                          iconName="Upload"
                          iconPosition="left"
                        >
                          Upload Photo
                        </Button>
                      </div>
                    )}
                    {errors.officialPhoto && (
                      <p className="text-sm text-destructive mt-2">{errors.officialPhoto}</p>
                    )}
                    {editFiles.removeExistingPhoto && !editFiles.officialPhotoPreview && (
                      <p className="text-xs text-warning mt-2">
                        Photo will be removed after saving.
                      </p>
                    )}
                  </div>
                </div>

                {/* Passport/ID Document */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Passport/ID Document (Optional)</label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload passport, national ID, or other identification document (Max 10MB)
                    </p>
                    {editFiles.passportDocument ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                          <Icon name="FileText" size={16} className="text-primary" />
                          <span className="text-sm text-foreground">{editFiles.passportDocument.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileUpload(null, 'passportDocument')}
                          disabled={isSubmitting || isLoading}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openFileDialog('passportDocument')}
                        disabled={isSubmitting || isLoading}
                        iconName="Upload"
                        iconPosition="left"
                      >
                        Upload Passport/ID Document
                      </Button>
                    )}
                    {errors.passportDocument && (
                      <p className="text-sm text-destructive mt-2">{errors.passportDocument}</p>
                    )}
                  </div>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'officialPhoto')}
                />
                <input
                  ref={passportInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'passportDocument')}
                />

                {/* Existing Documents */}
                {isLoadingDocuments ? (
                  <div className="flex items-center justify-center py-4">
                    <Icon name="Loader2" size={20} className="text-primary animate-spin" />
                  </div>
                ) : existingDocuments.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <label className="text-sm font-medium text-foreground">Existing Documents</label>
                    <div className="space-y-2">
                      {existingDocuments.map((doc) => {
                        const docUrl = getDocumentUrl(doc);
                        const docTypeLabels = {
                          official_photo: 'Official Photo',
                          passport: 'Passport/ID Document',
                          certificate: 'Certificate',
                          other: 'Other Document',
                        };
                        
                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-background border border-border rounded-md"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Icon
                                name={doc.document_type === 'official_photo' ? 'Image' : 'FileText'}
                                size={18}
                                className="text-primary flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {doc.file_name || docTypeLabels[doc.document_type] || 'Document'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {docTypeLabels[doc.document_type] || doc.document_type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                  {doc.created_at && ` • ${new Date(doc.created_at).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {docUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(docUrl, '_blank')}
                                  title="View document"
                                >
                                  <Icon name="Eye" size={16} />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin-dashboard')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={isSubmitting || isLoading}
                  iconName={isEditMode ? "Save" : "UserCheck"}
                  iconPosition="left"
                  disabled={isLoading}
                >
                  {isEditMode ? 'Update Official' : 'Register as Official'}
                </Button>
              </div>
            </form>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OfficialRegistration;


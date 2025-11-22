import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { officialService } from '../../../services/officialService';

const OfficialPhotoUpload = ({ formData, onChange, errors, existingPhoto }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(() => {
    // Initialize with formData photo or existing photo
    if (formData?.officialPhoto && typeof formData.officialPhoto === 'string') {
      return formData.officialPhoto;
    }
    if (existingPhoto) {
      const url = existingPhoto?.file_path
        ? officialService.getFileUrl(existingPhoto.file_path)
        : existingPhoto?.file_url || null;
      return url && typeof url === 'string' ? url : null;
    }
    return null;
  });
  const fileInputRef = useRef(null);
  
  // Update preview when existingPhoto changes
  useEffect(() => {
    if (existingPhoto && !formData?.officialPhotoFile) {
      const photoUrl = existingPhoto?.file_path
        ? officialService.getFileUrl(existingPhoto.file_path)
        : existingPhoto?.file_url || null;
      if (photoUrl && typeof photoUrl === 'string') {
        setPreviewUrl(photoUrl);
      } else {
        setPreviewUrl(null);
      }
    } else if (formData?.officialPhoto && typeof formData.officialPhoto === 'string') {
      setPreviewUrl(formData.officialPhoto);
    }
  }, [existingPhoto, formData?.officialPhotoFile, formData?.officialPhoto]);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileSelect(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes?.includes(file?.type)) {
      onChange('photoError', 'Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file?.size > maxSize) {
      onChange('photoError', 'File size must be less than 5MB');
      return;
    }

    // Clear any previous errors
    onChange('photoError', '');

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e?.target?.result);
      onChange('officialPhoto', e?.target?.result);
      onChange('officialPhotoFile', file);
    };
    reader?.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileSelect(e?.target?.files?.[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onChange('officialPhoto', '');
    onChange('officialPhotoFile', null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef?.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Official Photo</h4>
        <p className="text-xs text-muted-foreground">
          Upload a clear, recent photo. Photo will be used for identification and official assignments.
        </p>
        
        {/* Photo Requirements */}
        <div className="bg-muted rounded-lg p-4">
          <h5 className="text-sm font-medium text-foreground mb-2">Photo Requirements:</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Clear, high-quality image</li>
            <li>• Face clearly visible and centered</li>
            <li>• Professional or semi-professional appearance</li>
            <li>• File formats: JPEG, PNG, or WebP</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Recommended dimensions: 400x400 pixels or higher</li>
          </ul>
        </div>
      </div>
      {/* Upload Area */}
      <div className="space-y-4">
        {!previewUrl ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Icon name="Camera" size={24} className="text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground">Upload Official Photo</h5>
                <p className="text-xs text-muted-foreground">
                  Drag and drop your photo here, or click to browse
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={openFileDialog}
                iconName="Upload"
                iconPosition="left"
              >
                Choose File
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-lg overflow-hidden border border-border bg-muted">
                  {previewUrl && typeof previewUrl === 'string' ? (
                    <Image
                      src={previewUrl}
                      alt="Official photo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Camera" size={48} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-error text-error-foreground rounded-full flex items-center justify-center hover:bg-error/90 transition-colors"
                  title="Remove photo"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
            
            {/* Photo Actions */}
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={openFileDialog}
                iconName="RefreshCw"
                iconPosition="left"
                size="sm"
              >
                Replace Photo
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleRemovePhoto}
                iconName="Trash2"
                iconPosition="left"
                size="sm"
                className="text-error hover:text-error"
              >
                Remove
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}
        
        {/* Error Message */}
        {(errors?.officialPhoto || formData?.photoError) && (
          <div className="flex items-center space-x-2 text-error text-sm">
            <Icon name="AlertCircle" size={16} />
            <span>{errors?.officialPhoto || formData?.photoError}</span>
          </div>
        )}
      </div>
      {/* Photo Guidelines */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h5 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span>Photo Guidelines</span>
        </h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-2">
            <h6 className="font-medium text-foreground">Do:</h6>
            <ul className="space-y-1">
              <li>• Use good lighting</li>
              <li>• Face the camera directly</li>
              <li>• Keep a neutral expression</li>
              <li>• Wear appropriate attire</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h6 className="font-medium text-foreground">Don't:</h6>
            <ul className="space-y-1">
              <li>• Use blurry or pixelated images</li>
              <li>• Include multiple people</li>
              <li>• Use heavily filtered photos</li>
              <li>• Submit inappropriate content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialPhotoUpload;


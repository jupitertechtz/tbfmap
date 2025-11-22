import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { officialService } from '../../../services/officialService';

const PassportUpload = ({ formData, onChange, errors, existingPassport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewFileName, setPreviewFileName] = useState(
    existingPassport?.file_name || null
  );
  const fileInputRef = useRef(null);
  
  // Update preview when existingPassport changes
  useEffect(() => {
    if (existingPassport && !formData?.passportFile) {
      setPreviewFileName(existingPassport?.file_name || null);
    }
  }, [existingPassport, formData?.passportFile]);

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
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes?.includes(file?.type)) {
      onChange('passportError', 'Please select a valid file (PDF, Word, or Image)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file?.size > maxSize) {
      onChange('passportError', 'File size must be less than 10MB');
      return;
    }

    // Clear any previous errors
    onChange('passportError', '');

    // Store file and show filename
    setPreviewFileName(file.name);
    onChange('passportFile', file);
  };

  const handleFileInputChange = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileSelect(e?.target?.files?.[0]);
    }
  };

  const handleRemovePassport = () => {
    setPreviewFileName(null);
    onChange('passportFile', null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef?.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Passport or ID Document <span className="text-muted-foreground">(Optional)</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Upload a copy of your passport or national ID document for verification purposes.
        </p>
      </div>
      
      {/* Upload Area */}
      <div className="space-y-4">
        {!previewFileName ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h5 className="text-sm font-medium text-foreground">Upload Passport/ID Document</h5>
                <p className="text-xs text-muted-foreground">
                  Drag and drop your document here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, Word, JPEG, PNG (Max 10MB)
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={openFileDialog}
                iconName="Upload"
                iconPosition="left"
                size="sm"
              >
                Choose File
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* File Preview */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {previewFileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {existingPassport ? 'Current Passport/ID Document' : 'Passport/ID Document'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {existingPassport && (existingPassport?.file_path || existingPassport?.file_url) && (
                  <a
                    href={existingPassport?.file_path
                      ? officialService.getFileUrl(existingPassport.file_path)
                      : existingPassport?.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                    title="View document"
                  >
                    <Icon name="ExternalLink" size={18} />
                  </a>
                )}
                <button
                  onClick={handleRemovePassport}
                  className="text-error hover:text-error/80 transition-colors flex-shrink-0"
                  title="Remove document"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
            </div>
            
            {/* File Actions */}
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={openFileDialog}
                iconName="RefreshCw"
                iconPosition="left"
                size="sm"
              >
                Replace Document
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleRemovePassport}
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}
        
        {/* Error Message */}
        {(errors?.passport || formData?.passportError) && (
          <div className="flex items-center space-x-2 text-error text-sm">
            <Icon name="AlertCircle" size={16} />
            <span>{errors?.passport || formData?.passportError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassportUpload;


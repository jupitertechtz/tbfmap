import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentUpload = ({ 
  label, 
  description, 
  formData, 
  fieldName, 
  onChange, 
  errors,
  acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSizeMB = 10,
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewFileName, setPreviewFileName] = useState(null);
  const fileInputRef = useRef(null);

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
      'image/jpeg', 'image/jpg', 'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file?.type)) {
      onChange(`${fieldName}Error`, `Please select a valid file (PDF, image, or Word document)`);
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file?.size > maxSize) {
      onChange(`${fieldName}Error`, `File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Clear any previous errors
    onChange(`${fieldName}Error`, '');

    // Store file
    setPreviewFileName(file?.name);
    onChange(fieldName, file);
  };

  const handleFileInputChange = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileSelect(e?.target?.files?.[0]);
    }
  };

  const handleRemoveFile = () => {
    setPreviewFileName(null);
    onChange(fieldName, null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef?.current?.click();
  };

  const hasFile = formData?.[fieldName] || previewFileName;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {!hasFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Icon name="Upload" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-foreground mb-2">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Accepted formats: {acceptedTypes} (Max {maxSizeMB}MB)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            iconName="File"
            iconPosition="left"
          >
            Select File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Icon name="FileText" size={24} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {previewFileName || formData?.[fieldName]?.name || 'File selected'}
                </p>
                {formData?.[fieldName] && (
                  <p className="text-xs text-muted-foreground">
                    {(formData[fieldName].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                iconName="Trash2"
                className="text-error hover:text-error"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {(errors?.[fieldName] || formData?.[`${fieldName}Error`]) && (
        <p className="text-xs text-error">
          {errors?.[fieldName] || formData?.[`${fieldName}Error`]}
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;


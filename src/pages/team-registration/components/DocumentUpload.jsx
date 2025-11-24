import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentUpload = ({ formData, handleFileUpload, errors }) => {
  const [dragActive, setDragActive] = useState({});
  const fileInputRefs = {
    registrationCertificate: useRef(null),
    taxClearance: useRef(null),
    constitutionDocument: useRef(null),
    officialLetter: useRef(null)
  };

  const documentTypes = [
    {
      key: 'registrationCertificate',
      label: 'Team Registration Certificate (Optional)',
      description: 'Official team registration document (optional)',
      required: false,
      acceptedFormats: '.pdf,.jpg,.jpeg,.png'
    },
    {
      key: 'taxClearance',
      label: 'Tax Clearance Certificate (Optional)',
      description: 'Valid tax clearance from TRA (optional)',
      required: false,
      acceptedFormats: '.pdf,.jpg,.jpeg,.png'
    },
    {
      key: 'constitutionDocument',
      label: 'Team Constitution (Optional)',
      description: 'Team constitution and bylaws (optional)',
      required: false,
      acceptedFormats: '.pdf,.doc,.docx'
    },
    {
      key: 'officialLetter',
      label: 'Official Letter of Intent (Optional)',
      description: 'Letter expressing intent to participate (optional)',
      required: false,
      acceptedFormats: '.pdf,.doc,.docx'
    }
  ];

  const handleDrag = (e, docType) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [docType]: true }));
    } else if (e?.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleDrop = (e, docType) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(prev => ({ ...prev, [docType]: false }));
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileUpload(e?.dataTransfer?.files?.[0], docType);
    }
  };

  const handleFileSelect = (e, docType) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileUpload(e?.target?.files?.[0], docType);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.')?.pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'FileText';
      case 'doc': case'docx':
        return 'FileText';
      case 'jpg': case'jpeg': case'png':
        return 'Image';
      default:
        return 'File';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Upload" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Document Upload</h3>
            <p className="text-sm text-muted-foreground">Upload supporting team registration documents (optional)</p>
          </div>
        </div>
      </div>
      <div className="p-6">
      <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <Icon name="AlertCircle" size={16} className="text-warning mt-0.5" />
          <div className="text-sm text-warning">
            <p className="font-medium">Document Guidelines</p>
            <p className="mt-1">
              Documents are optional but recommended to speed up verification. 
              Ensure uploads are clear, legible, and under 10MB per document.
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {documentTypes?.map((docType) => (
          <div key={docType?.key} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  {docType?.label}
                  {docType?.required && <span className="text-error ml-1">*</span>}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{docType?.description}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {docType?.acceptedFormats?.replace(/\./g, '')?.toUpperCase()}
              </div>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive?.[docType?.key]
                  ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
              onDragEnter={(e) => handleDrag(e, docType?.key)}
              onDragLeave={(e) => handleDrag(e, docType?.key)}
              onDragOver={(e) => handleDrag(e, docType?.key)}
              onDrop={(e) => handleDrop(e, docType?.key)}
            >
              <input
                ref={fileInputRefs?.[docType?.key]}
                type="file"
                accept={docType?.acceptedFormats}
                onChange={(e) => handleFileSelect(e, docType?.key)}
                className="hidden"
              />

              {formData?.[docType?.key] ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Icon 
                      name={getFileIcon(formData?.[docType?.key]?.name)} 
                      size={24} 
                      className="text-success" 
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {formData?.[docType?.key]?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(formData?.[docType?.key]?.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs?.[docType?.key]?.current?.click()}
                      iconName="Upload"
                      iconPosition="left"
                    >
                      Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileUpload(null, docType?.key)}
                      iconName="Trash2"
                      iconPosition="left"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Icon name="Upload" size={32} className="mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">Drop file here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {docType?.acceptedFormats?.replace(/\./g, '')?.toUpperCase()} up to 10MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRefs?.[docType?.key]?.current?.click()}
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>

            {errors?.[docType?.key] && (
              <p className="text-sm text-error mt-2">{errors?.[docType?.key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default DocumentUpload;
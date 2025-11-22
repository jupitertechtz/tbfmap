import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const VisualIdentity = ({ formData, handleInputChange, handleFileUpload, errors }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const colorOptions = [
    { name: 'Red', value: '#DC2626', hex: '#DC2626' },
    { name: 'Blue', value: '#2563EB', hex: '#2563EB' },
    { name: 'Green', value: '#16A34A', hex: '#16A34A' },
    { name: 'Yellow', value: '#EAB308', hex: '#EAB308' },
    { name: 'Purple', value: '#9333EA', hex: '#9333EA' },
    { name: 'Orange', value: '#EA580C', hex: '#EA580C' },
    { name: 'Black', value: '#000000', hex: '#000000' },
    { name: 'White', value: '#FFFFFF', hex: '#FFFFFF' },
    { name: 'Navy', value: '#1E3A8A', hex: '#1E3A8A' },
    { name: 'Maroon', value: '#7F1D1D', hex: '#7F1D1D' }
  ];

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileUpload(e?.dataTransfer?.files?.[0], 'teamLogo');
    }
  };

  const handleFileSelect = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileUpload(e?.target?.files?.[0], 'teamLogo');
    }
  };

  const ColorSelector = ({ label, selectedColor, onColorChange, name }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-3">{label}</label>
      <div className="grid grid-cols-5 gap-3">
        {colorOptions?.map((color) => (
          <button
            key={color?.value}
            type="button"
            onClick={() => onColorChange({ target: { name, value: color?.value } })}
            className={`w-12 h-12 rounded-lg border-2 transition-all micro-interaction ${
              selectedColor === color?.value
                ? 'border-primary ring-2 ring-primary/20 scale-110' :'border-border hover:border-muted-foreground'
            }`}
            style={{ backgroundColor: color?.hex }}
            title={color?.name}
          >
            {selectedColor === color?.value && (
              <Icon 
                name="Check" 
                size={16} 
                color={color?.value === '#FFFFFF' ? '#000000' : '#FFFFFF'} 
              />
            )}
          </button>
        ))}
      </div>
      {selectedColor && (
        <div className="mt-2 flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded border border-border"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-sm text-muted-foreground">
            Selected: {colorOptions?.find(c => c?.value === selectedColor)?.name || selectedColor}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Palette" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Visual Identity</h3>
            <p className="text-sm text-muted-foreground">Upload your team logo and select kit colors</p>
          </div>
        </div>
      </div>
      <div className="p-6">
      <div className="space-y-8">
        {/* Team Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Team Logo <span className="text-error">*</span>
          </label>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {formData?.teamLogo || formData?.teamLogoPreview ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Image
                    src={formData?.teamLogoPreview || (formData?.teamLogo instanceof File ? URL.createObjectURL(formData?.teamLogo) : formData?.teamLogo)}
                    alt="Team logo preview showing uploaded team emblem"
                    className="w-24 h-24 object-contain rounded-lg border border-border"
                  />
                </div>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef?.current?.click()}
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Change Logo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileUpload(null, 'teamLogo')}
                    iconName="Trash2"
                    iconPosition="left"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Icon name="Upload" size={48} className="mx-auto text-muted-foreground" />
                <div>
                  <p className="text-foreground font-medium">Upload team logo</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop your logo here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG up to 5MB. Recommended: 512x512px
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef?.current?.click()}
                  iconName="Upload"
                  iconPosition="left"
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
          
          {errors?.teamLogo && (
            <p className="text-sm text-error mt-2">{errors?.teamLogo}</p>
          )}
        </div>

        {/* Kit Colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ColorSelector
            label="Primary Kit Color"
            selectedColor={formData?.primaryColor}
            onColorChange={handleInputChange}
            name="primaryColor"
          />
          
          <ColorSelector
            label="Secondary Kit Color"
            selectedColor={formData?.secondaryColor}
            onColorChange={handleInputChange}
            name="secondaryColor"
          />
        </div>

        {/* Color Conflict Warning */}
        {formData?.primaryColor && formData?.secondaryColor && formData?.primaryColor === formData?.secondaryColor && (
          <div className="flex items-center space-x-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <p className="text-sm text-warning">
              Primary and secondary colors should be different for better visibility
            </p>
          </div>
        )}

        {errors?.primaryColor && (
          <p className="text-sm text-error">{errors?.primaryColor}</p>
        )}
        {errors?.secondaryColor && (
          <p className="text-sm text-error">{errors?.secondaryColor}</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default VisualIdentity;
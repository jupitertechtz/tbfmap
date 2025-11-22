import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreateLeagueModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    division: '',
    format: '',
    startDate: '',
    endDate: '',
    maxTeams: '',
    description: '',
    scoringSystem: '',
    playoffFormat: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const divisionOptions = [
    { value: 'premier', label: 'Premier Division' },
    { value: 'first', label: 'First Division' },
    { value: 'second', label: 'Second Division' },
    { value: 'youth', label: 'Youth Division' },
    { value: 'women', label: 'Women\'s Division' }
  ];

  const formatOptions = [
    { value: 'round-robin', label: 'Round Robin' },
    { value: 'knockout', label: 'Knockout' },
    { value: 'round-robin-playoff', label: 'Round Robin + Playoffs' },
    { value: 'swiss', label: 'Swiss System' }
  ];

  const scoringOptions = [
    { value: 'standard', label: 'Standard (2-3 Points)' },
    { value: 'fiba', label: 'FIBA Rules' },
    { value: 'custom', label: 'Custom Scoring' }
  ];

  const playoffOptions = [
    { value: 'top-4', label: 'Top 4 Teams' },
    { value: 'top-8', label: 'Top 8 Teams' },
    { value: 'top-half', label: 'Top Half' },
    { value: 'none', label: 'No Playoffs' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'League name is required';
    }

    if (!formData?.season?.trim()) {
      newErrors.season = 'Season is required';
    }

    if (!formData?.division) {
      newErrors.division = 'Division is required';
    }

    if (!formData?.format) {
      newErrors.format = 'Format is required';
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData?.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData?.startDate && formData?.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData?.maxTeams || formData?.maxTeams < 2) {
      newErrors.maxTeams = 'Minimum 2 teams required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        season: '',
        division: '',
        format: '',
        startDate: '',
        endDate: '',
        maxTeams: '',
        description: '',
        scoringSystem: '',
        playoffFormat: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Plus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create New League</h2>
              <p className="text-sm text-muted-foreground">Set up a new basketball league</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="League Name"
                type="text"
                placeholder="e.g., Tanzania Premier League"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                error={errors?.name}
                required
              />
              
              <Input
                label="Season"
                type="text"
                placeholder="e.g., 2024-2025"
                value={formData?.season}
                onChange={(e) => handleInputChange('season', e?.target?.value)}
                error={errors?.season}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Division"
                options={divisionOptions}
                value={formData?.division}
                onChange={(value) => handleInputChange('division', value)}
                error={errors?.division}
                placeholder="Select division"
                required
              />
              
              <Select
                label="League Format"
                options={formatOptions}
                value={formData?.format}
                onChange={(value) => handleInputChange('format', value)}
                error={errors?.format}
                placeholder="Select format"
                required
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData?.startDate}
                onChange={(e) => handleInputChange('startDate', e?.target?.value)}
                error={errors?.startDate}
                required
              />
              
              <Input
                label="End Date"
                type="date"
                value={formData?.endDate}
                onChange={(e) => handleInputChange('endDate', e?.target?.value)}
                error={errors?.endDate}
                required
              />
            </div>

            <Input
              label="Maximum Teams"
              type="number"
              placeholder="e.g., 12"
              value={formData?.maxTeams}
              onChange={(e) => handleInputChange('maxTeams', e?.target?.value)}
              error={errors?.maxTeams}
              min="2"
              max="32"
              required
            />
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Scoring System"
                options={scoringOptions}
                value={formData?.scoringSystem}
                onChange={(value) => handleInputChange('scoringSystem', value)}
                placeholder="Select scoring system"
              />
              
              <Select
                label="Playoff Format"
                options={playoffOptions}
                value={formData?.playoffFormat}
                onChange={(value) => handleInputChange('playoffFormat', value)}
                placeholder="Select playoff format"
              />
            </div>

            <Input
              label="Description"
              type="text"
              placeholder="Brief description of the league"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName="Plus"
              iconPosition="left"
            >
              Create League
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeagueModal;
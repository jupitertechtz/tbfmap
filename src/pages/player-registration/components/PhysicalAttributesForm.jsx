import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PhysicalAttributesForm = ({ formData, onChange, errors, teams = [], isLoadingTeams = false, teamsError = null }) => {
  const positionOptions = [
    { value: 'point_guard', label: 'Point Guard (PG)' },
    { value: 'shooting_guard', label: 'Shooting Guard (SG)' },
    { value: 'small_forward', label: 'Small Forward (SF)' },
    { value: 'power_forward', label: 'Power Forward (PF)' },
    { value: 'center', label: 'Center (C)' }
  ];

  // Convert teams to options format
  const teamOptions = teams?.map(team => ({
    value: team?.id,
    label: team?.name
  })) || [];

  const dominantHandOptions = [
    { value: 'right', label: 'Right Hand' },
    { value: 'left', label: 'Left Hand' },
    { value: 'ambidextrous', label: 'Ambidextrous' }
  ];

  const experienceLevelOptions = [
    { value: 'beginner', label: 'Beginner (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (3-5 years)' },
    { value: 'advanced', label: 'Advanced (6-10 years)' },
    { value: 'professional', label: 'Professional (10+ years)' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Height (cm)"
          type="number"
          placeholder="Enter height in centimeters"
          value={formData?.height || ''}
          onChange={(e) => onChange('height', e?.target?.value)}
          error={errors?.height}
          min="140"
          max="250"
          required
        />
        
        <Input
          label="Weight (kg)"
          type="number"
          placeholder="Enter weight in kilograms"
          value={formData?.weight || ''}
          onChange={(e) => onChange('weight', e?.target?.value)}
          error={errors?.weight}
          min="40"
          max="200"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Primary Position"
          options={positionOptions}
          value={formData?.primaryPosition || ''}
          onChange={(value) => onChange('primaryPosition', value)}
          error={errors?.primaryPosition}
          required
        />
        
        <Select
          label="Secondary Position"
          options={positionOptions}
          value={formData?.secondaryPosition || ''}
          onChange={(value) => onChange('secondaryPosition', value)}
          placeholder="Select secondary position (optional)"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Team"
          options={teamOptions}
          value={formData?.teamId || ''}
          onChange={(value) => onChange('teamId', value)}
          placeholder={isLoadingTeams ? 'Loading teams...' : 'Select team'}
          loading={isLoadingTeams}
          description={teamsError ? <span className="text-destructive text-xs">{teamsError}</span> : undefined}
          searchable
        />
        
        <Input
          label="Preferred Jersey Number"
          type="number"
          placeholder="Enter preferred number (1-99)"
          value={formData?.jerseyNumber || ''}
          onChange={(e) => onChange('jerseyNumber', e?.target?.value)}
          error={errors?.jerseyNumber}
          min="1"
          max="99"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Dominant Hand"
          options={dominantHandOptions}
          value={formData?.dominantHand || ''}
          onChange={(value) => onChange('dominantHand', value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Wingspan (cm)"
          type="number"
          placeholder="Enter wingspan in centimeters"
          value={formData?.wingspan || ''}
          onChange={(e) => onChange('wingspan', e?.target?.value)}
          min="140"
          max="280"
        />
        
        <Input
          label="Vertical Jump (cm)"
          type="number"
          placeholder="Enter vertical jump height"
          value={formData?.verticalJump || ''}
          onChange={(e) => onChange('verticalJump', e?.target?.value)}
          min="10"
          max="150"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Experience Level"
          options={experienceLevelOptions}
          value={formData?.experienceLevel || ''}
          onChange={(value) => onChange('experienceLevel', value)}
          required
        />
        
        <Input
          label="Years Playing Basketball"
          type="number"
          placeholder="Enter years of experience"
          value={formData?.yearsPlaying || ''}
          onChange={(e) => onChange('yearsPlaying', e?.target?.value)}
          min="0"
          max="30"
          required
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Previous Teams</h4>
        <Input
          label="Previous Team Name"
          type="text"
          placeholder="Enter previous team name (if any)"
          value={formData?.previousTeam || ''}
          onChange={(e) => onChange('previousTeam', e?.target?.value)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Years with Previous Team"
            type="number"
            placeholder="Enter years played"
            value={formData?.yearsWithPreviousTeam || ''}
            onChange={(e) => onChange('yearsWithPreviousTeam', e?.target?.value)}
            min="0"
            max="20"
          />
          
          <Input
            label="Reason for Leaving"
            type="text"
            placeholder="Enter reason for leaving (optional)"
            value={formData?.reasonForLeaving || ''}
            onChange={(e) => onChange('reasonForLeaving', e?.target?.value)}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Skills Assessment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Shooting Rating (1-10)"
            type="number"
            placeholder="Rate shooting skills"
            value={formData?.shootingRating || ''}
            onChange={(e) => onChange('shootingRating', e?.target?.value)}
            min="1"
            max="10"
          />
          
          <Input
            label="Dribbling Rating (1-10)"
            type="number"
            placeholder="Rate dribbling skills"
            value={formData?.dribblingRating || ''}
            onChange={(e) => onChange('dribblingRating', e?.target?.value)}
            min="1"
            max="10"
          />
          
          <Input
            label="Defense Rating (1-10)"
            type="number"
            placeholder="Rate defensive skills"
            value={formData?.defenseRating || ''}
            onChange={(e) => onChange('defenseRating', e?.target?.value)}
            min="1"
            max="10"
          />
        </div>
      </div>
    </div>
  );
};

export default PhysicalAttributesForm;
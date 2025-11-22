import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const EmploymentInformationForm = ({ formData, onChange, errors }) => {
  const employmentStatusOptions = [
    { value: 'employed', label: 'Employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'student', label: 'Student' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'retired', label: 'Retired' }
  ];

  const employmentTypeOptions = [
    { value: 'full_time', label: 'Full-Time' },
    { value: 'part_time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'internship', label: 'Internship' }
  ];

  const industryOptions = [
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'banking', label: 'Banking & Finance' },
    { value: 'construction', label: 'Construction' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'mining', label: 'Mining' },
    { value: 'retail', label: 'Retail & Trade' },
    { value: 'technology', label: 'Technology' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'other', label: 'Other' }
  ];

  const professionalLevelOptions = [
    { value: 'amateur', label: 'Amateur' },
    { value: 'semi_professional', label: 'Semi-Professional' },
    { value: 'professional', label: 'Professional' },
    { value: 'retired_professional', label: 'Retired Professional' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Employment Status"
          options={employmentStatusOptions}
          value={formData?.employmentStatus || ''}
          onChange={(value) => onChange('employmentStatus', value)}
          error={errors?.employmentStatus}
          required
        />
        
        {formData?.employmentStatus === 'employed' && (
          <Select
            label="Employment Type"
            options={employmentTypeOptions}
            value={formData?.employmentType || ''}
            onChange={(value) => onChange('employmentType', value)}
            required
          />
        )}
      </div>
      {(formData?.employmentStatus === 'employed' || formData?.employmentStatus === 'self_employed') && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Current Employment Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Employer/Company Name"
              type="text"
              placeholder="Enter employer or company name"
              value={formData?.employerName || ''}
              onChange={(e) => onChange('employerName', e?.target?.value)}
              required
            />
            
            <Input
              label="Job Title/Position"
              type="text"
              placeholder="Enter your job title"
              value={formData?.jobTitle || ''}
              onChange={(e) => onChange('jobTitle', e?.target?.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Industry"
              options={industryOptions}
              value={formData?.industry || ''}
              onChange={(value) => onChange('industry', value)}
              searchable
              required
            />
            
            <Input
              label="Years in Current Position"
              type="number"
              placeholder="Enter years in position"
              value={formData?.yearsInPosition || ''}
              onChange={(e) => onChange('yearsInPosition', e?.target?.value)}
              min="0"
              max="50"
            />
          </div>
          
          <div className="space-y-4">
            <Input
              label="Work Address"
              type="text"
              placeholder="Enter workplace address"
              value={formData?.workAddress || ''}
              onChange={(e) => onChange('workAddress', e?.target?.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Work Phone Number"
                type="tel"
                placeholder="+255 XXX XXX XXX"
                value={formData?.workPhone || ''}
                onChange={(e) => onChange('workPhone', e?.target?.value)}
              />
              
              <Input
                label="Work Email"
                type="email"
                placeholder="Enter work email address"
                value={formData?.workEmail || ''}
                onChange={(e) => onChange('workEmail', e?.target?.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Supervisor Name"
              type="text"
              placeholder="Enter supervisor's name"
              value={formData?.supervisorName || ''}
              onChange={(e) => onChange('supervisorName', e?.target?.value)}
            />
            
            <Input
              label="Supervisor Contact"
              type="text"
              placeholder="Enter supervisor's phone or email"
              value={formData?.supervisorContact || ''}
              onChange={(e) => onChange('supervisorContact', e?.target?.value)}
            />
          </div>
        </div>
      )}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Basketball Professional Status</h4>
        <Select
          label="Professional Basketball Level"
          options={professionalLevelOptions}
          value={formData?.professionalLevel || ''}
          onChange={(value) => onChange('professionalLevel', value)}
          error={errors?.professionalLevel}
          required
        />
        
        {(formData?.professionalLevel === 'professional' || formData?.professionalLevel === 'semi_professional') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Current Basketball Team"
                type="text"
                placeholder="Enter current professional team"
                value={formData?.currentBasketballTeam || ''}
                onChange={(e) => onChange('currentBasketballTeam', e?.target?.value)}
                required
              />
              
              <Input
                label="Contract Duration"
                type="text"
                placeholder="e.g., 2 years, 1 season"
                value={formData?.contractDuration || ''}
                onChange={(e) => onChange('contractDuration', e?.target?.value)}
              />
            </div>
            
            <Input
              label="Agent/Representative Name"
              type="text"
              placeholder="Enter agent or representative name"
              value={formData?.agentName || ''}
              onChange={(e) => onChange('agentName', e?.target?.value)}
            />
            
            <Input
              label="Agent Contact Information"
              type="text"
              placeholder="Enter agent's phone or email"
              value={formData?.agentContact || ''}
              onChange={(e) => onChange('agentContact', e?.target?.value)}
            />
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Basketball Experience</h4>
        <Input
          label="Professional Basketball Experience (Years)"
          type="number"
          placeholder="Enter years of professional experience"
          value={formData?.professionalExperience || ''}
          onChange={(e) => onChange('professionalExperience', e?.target?.value)}
          min="0"
          max="30"
        />
        
        <Input
          label="Previous Professional Teams"
          type="text"
          placeholder="List previous professional teams"
          value={formData?.previousProfessionalTeams || ''}
          onChange={(e) => onChange('previousProfessionalTeams', e?.target?.value)}
        />
        
        <Input
          label="Notable Achievements"
          type="text"
          placeholder="List professional basketball achievements"
          value={formData?.professionalAchievements || ''}
          onChange={(e) => onChange('professionalAchievements', e?.target?.value)}
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Availability & Commitment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Checkbox
            label="Available for Full Season"
            checked={formData?.availableFullSeason || false}
            onChange={(e) => onChange('availableFullSeason', e?.target?.checked)}
          />
          
          <Checkbox
            label="Available for Travel"
            checked={formData?.availableForTravel || false}
            onChange={(e) => onChange('availableForTravel', e?.target?.checked)}
          />
        </div>
        
        <Input
          label="Training Schedule Availability"
          type="text"
          placeholder="Describe your availability for training"
          value={formData?.trainingAvailability || ''}
          onChange={(e) => onChange('trainingAvailability', e?.target?.value)}
        />
        
        <Input
          label="Work Schedule Conflicts"
          type="text"
          placeholder="Describe any potential schedule conflicts"
          value={formData?.scheduleConflicts || ''}
          onChange={(e) => onChange('scheduleConflicts', e?.target?.value)}
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Financial Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Checkbox
            label="Requires Financial Assistance"
            checked={formData?.requiresFinancialAssistance || false}
            onChange={(e) => onChange('requiresFinancialAssistance', e?.target?.checked)}
          />
          
          <Checkbox
            label="Can Cover Registration Fees"
            checked={formData?.canCoverFees || false}
            onChange={(e) => onChange('canCoverFees', e?.target?.checked)}
          />
        </div>
        
        {formData?.requiresFinancialAssistance && (
          <Input
            label="Financial Assistance Details"
            type="text"
            placeholder="Describe financial assistance needed"
            value={formData?.financialAssistanceDetails || ''}
            onChange={(e) => onChange('financialAssistanceDetails', e?.target?.value)}
          />
        )}
      </div>
    </div>
  );
};

export default EmploymentInformationForm;
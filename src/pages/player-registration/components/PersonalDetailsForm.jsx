import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PersonalDetailsForm = ({ formData, onChange, errors }) => {
  const nationalityOptions = [
    { value: 'TZ', label: 'Tanzania' },
    { value: 'KE', label: 'Kenya' },
    { value: 'UG', label: 'Uganda' },
    { value: 'RW', label: 'Rwanda' },
    { value: 'BI', label: 'Burundi' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'ZA', label: 'South Africa' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          type="text"
          placeholder="Enter first name"
          value={formData?.firstName || ''}
          onChange={(e) => onChange('firstName', e?.target?.value)}
          error={errors?.firstName}
          required
        />
        
        <Input
          label="Last Name"
          type="text"
          placeholder="Enter last name"
          value={formData?.lastName || ''}
          onChange={(e) => onChange('lastName', e?.target?.value)}
          error={errors?.lastName}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Middle Name"
          type="text"
          placeholder="Enter middle name (optional)"
          value={formData?.middleName || ''}
          onChange={(e) => onChange('middleName', e?.target?.value)}
        />
        
        <Input
          label="Date of Birth"
          type="date"
          value={formData?.dateOfBirth || ''}
          onChange={(e) => onChange('dateOfBirth', e?.target?.value)}
          error={errors?.dateOfBirth}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Gender"
          options={genderOptions}
          value={formData?.gender || ''}
          onChange={(value) => onChange('gender', value)}
          error={errors?.gender}
          required
        />
        
        <Select
          label="Nationality"
          options={nationalityOptions}
          value={formData?.nationality || ''}
          onChange={(value) => onChange('nationality', value)}
          error={errors?.nationality}
          searchable
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="National ID Number"
          type="text"
          placeholder="Enter national ID number"
          value={formData?.nationalId || ''}
          onChange={(e) => onChange('nationalId', e?.target?.value)}
          error={errors?.nationalId}
          required
        />
        
        <Input
          label="Passport Number"
          type="text"
          placeholder="Enter passport number (if applicable)"
          value={formData?.passportNumber || ''}
          onChange={(e) => onChange('passportNumber', e?.target?.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Marital Status"
          options={maritalStatusOptions}
          value={formData?.maritalStatus || ''}
          onChange={(value) => onChange('maritalStatus', value)}
          required
        />
        
        <Input
          label="Place of Birth"
          type="text"
          placeholder="Enter place of birth"
          value={formData?.placeOfBirth || ''}
          onChange={(e) => onChange('placeOfBirth', e?.target?.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+255 XXX XXX XXX"
          value={formData?.phoneNumber || ''}
          onChange={(e) => onChange('phoneNumber', e?.target?.value)}
          error={errors?.phoneNumber}
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter email address"
          value={formData?.email || ''}
          onChange={(e) => onChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Residential Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Street Address"
            type="text"
            placeholder="Enter street address"
            value={formData?.streetAddress || ''}
            onChange={(e) => onChange('streetAddress', e?.target?.value)}
            required
          />
          
          <Input
            label="City"
            type="text"
            placeholder="Enter city"
            value={formData?.city || ''}
            onChange={(e) => onChange('city', e?.target?.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Region/State"
            type="text"
            placeholder="Enter region or state"
            value={formData?.region || ''}
            onChange={(e) => onChange('region', e?.target?.value)}
            required
          />
          
          <Input
            label="Postal Code"
            type="text"
            placeholder="Enter postal code"
            value={formData?.postalCode || ''}
            onChange={(e) => onChange('postalCode', e?.target?.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
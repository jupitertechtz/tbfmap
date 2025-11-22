import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BasicTeamInfo = ({ formData, handleInputChange, errors }) => {
  const foundingYearOptions = [];
  const currentYear = new Date()?.getFullYear();
  for (let year = currentYear; year >= 1950; year--) {
    foundingYearOptions?.push({ value: year?.toString(), label: year?.toString() });
  }

  const categoryOptions = [
    { value: 'men', label: 'Men\'s Team' },
    { value: 'women', label: 'Women\'s Team' },
    { value: 'youth', label: 'Youth Team' },
    { value: 'mixed', label: 'Mixed Team' }
  ];

  const divisionOptions = [
    { value: 'premier', label: 'Premier Division' },
    { value: 'first', label: 'First Division' },
    { value: 'second', label: 'Second Division' },
    { value: 'regional', label: 'Regional Division' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Users" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Basic Team Information</h3>
            <p className="text-sm text-muted-foreground">Enter your team's basic details and classification</p>
          </div>
        </div>
      </div>
      <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Team Name"
          type="text"
          name="teamName"
          placeholder="Enter full team name"
          value={formData?.teamName}
          onChange={handleInputChange}
          error={errors?.teamName}
          required
          className="col-span-1 md:col-span-2"
        />

        <Input
          label="Team Abbreviation"
          type="text"
          name="abbreviation"
          placeholder="e.g., TBF, ABC"
          value={formData?.abbreviation}
          onChange={handleInputChange}
          error={errors?.abbreviation}
          description="Maximum 5 characters"
          maxLength={5}
          required
        />

        <Select
          label="Founding Year"
          name="foundingYear"
          options={foundingYearOptions}
          value={formData?.foundingYear}
          onChange={(value) => handleInputChange({ target: { name: 'foundingYear', value } })}
          error={errors?.foundingYear}
          placeholder="Select founding year"
          searchable
          required
        />

        <Select
          label="Team Category"
          name="category"
          options={categoryOptions}
          value={formData?.category}
          onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
          error={errors?.category}
          placeholder="Select team category"
          required
        />

        <Select
          label="Division"
          name="division"
          options={divisionOptions}
          value={formData?.division}
          onChange={(value) => handleInputChange({ target: { name: 'division', value } })}
          error={errors?.division}
          placeholder="Select division"
          required
        />

        <Input
          label="Home Venue"
          type="text"
          name="homeVenue"
          placeholder="Enter home venue name"
          value={formData?.homeVenue}
          onChange={handleInputChange}
          error={errors?.homeVenue}
          required
        />

        <Input
          label="Venue Address"
          type="text"
          name="venueAddress"
          placeholder="Enter venue address"
          value={formData?.venueAddress}
          onChange={handleInputChange}
          error={errors?.venueAddress}
          className="col-span-1 md:col-span-2"
        />
      </div>
      </div>
    </div>
  );
};

export default BasicTeamInfo;
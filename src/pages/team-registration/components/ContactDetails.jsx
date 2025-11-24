import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ContactDetails = ({ formData, handleInputChange, errors }) => {
  const regionOptions = [
    { value: 'arusha', label: 'Arusha' },
    { value: 'dar-es-salaam', label: 'Dar es Salaam' },
    { value: 'dodoma', label: 'Dodoma' },
    { value: 'geita', label: 'Geita' },
    { value: 'iringa', label: 'Iringa' },
    { value: 'kagera', label: 'Kagera' },
    { value: 'katavi', label: 'Katavi' },
    { value: 'kigoma', label: 'Kigoma' },
    { value: 'kilimanjaro', label: 'Kilimanjaro' },
    { value: 'lindi', label: 'Lindi' },
    { value: 'manyara', label: 'Manyara' },
    { value: 'mara', label: 'Mara' },
    { value: 'mbeya', label: 'Mbeya' },
    { value: 'morogoro', label: 'Morogoro' },
    { value: 'mtwara', label: 'Mtwara' },
    { value: 'mwanza', label: 'Mwanza' },
    { value: 'njombe', label: 'Njombe' },
    { value: 'pemba-north', label: 'Pemba North' },
    { value: 'pemba-south', label: 'Pemba South' },
    { value: 'pwani', label: 'Pwani' },
    { value: 'rukwa', label: 'Rukwa' },
    { value: 'ruvuma', label: 'Ruvuma' },
    { value: 'shinyanga', label: 'Shinyanga' },
    { value: 'simiyu', label: 'Simiyu' },
    { value: 'singida', label: 'Singida' },
    { value: 'songwe', label: 'Songwe' },
    { value: 'tabora', label: 'Tabora' },
    { value: 'tanga', label: 'Tanga' },
    { value: 'unguja-north', label: 'Unguja North' },
    { value: 'unguja-south', label: 'Unguja South' },
    { value: 'unguja-urban-west', label: 'Unguja Urban/West' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="Mail" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Contact Details</h3>
            <p className="text-sm text-muted-foreground">Provide your team's contact information and location</p>
          </div>
        </div>
      </div>
      <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Street Address"
          type="text"
          name="streetAddress"
          placeholder="Enter street address"
          value={formData?.streetAddress}
          onChange={handleInputChange}
          error={errors?.streetAddress}
          required
          className="col-span-1 md:col-span-2"
        />

        <Input
          label="City/District"
          type="text"
          name="city"
          placeholder="Enter city or district"
          value={formData?.city}
          onChange={handleInputChange}
          error={errors?.city}
          required
        />

        <Select
          label="Region"
          name="region"
          options={regionOptions}
          value={formData?.region}
          onChange={(value) => handleInputChange({ target: { name: 'region', value } })}
          error={errors?.region}
          placeholder="Select region"
          searchable
          required
        />

        <Input
          label="Postal Code"
          type="text"
          name="postalCode"
          placeholder="Enter postal code"
          value={formData?.postalCode}
          onChange={handleInputChange}
          error={errors?.postalCode}
        />

        <Input
          label="Primary Phone"
          type="tel"
          name="primaryPhone"
          placeholder="+255 XXX XXX XXX"
          value={formData?.primaryPhone}
          onChange={handleInputChange}
          error={errors?.primaryPhone}
          required
        />

        <Input
          label="Secondary Phone"
          type="tel"
          name="secondaryPhone"
          placeholder="+255 XXX XXX XXX"
          value={formData?.secondaryPhone}
          onChange={handleInputChange}
          error={errors?.secondaryPhone}
        />

        <Input
          label="Official Email"
          type="email"
          name="officialEmail"
          placeholder="team@example.com"
          value={formData?.officialEmail}
          onChange={handleInputChange}
          error={errors?.officialEmail}
          required
        />

        <Input
          label="Website"
          type="url"
          name="website"
          placeholder="https://www.teamwebsite.com"
          value={formData?.website}
          onChange={handleInputChange}
          error={errors?.website}
        />
      </div>
      </div>
    </div>
  );
};

export default ContactDetails;
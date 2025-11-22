import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const OrganizationalStructure = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="UserCog" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Organizational Structure</h3>
            <p className="text-sm text-muted-foreground">Enter details for team leadership and coaching staff</p>
          </div>
        </div>
      </div>
      <div className="p-6">
      <div className="space-y-8">
        {/* President Information */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 pb-2 border-b border-border">
            Team President
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="President Full Name"
              type="text"
              name="presidentName"
              placeholder="Enter president's full name"
              value={formData?.presidentName}
              onChange={handleInputChange}
              error={errors?.presidentName}
              required
            />

            <Input
              label="President Phone"
              type="tel"
              name="presidentPhone"
              placeholder="+255 XXX XXX XXX"
              value={formData?.presidentPhone}
              onChange={handleInputChange}
              error={errors?.presidentPhone}
              required
            />

            <Input
              label="President Email"
              type="email"
              name="presidentEmail"
              placeholder="president@example.com"
              value={formData?.presidentEmail}
              onChange={handleInputChange}
              error={errors?.presidentEmail}
              required
            />

            <Input
              label="President ID Number"
              type="text"
              name="presidentId"
              placeholder="Enter national ID number"
              value={formData?.presidentId}
              onChange={handleInputChange}
              error={errors?.presidentId}
              required
            />
          </div>
        </div>

        {/* Secretary Information */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 pb-2 border-b border-border">
            Team Secretary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Secretary Full Name"
              type="text"
              name="secretaryName"
              placeholder="Enter secretary's full name"
              value={formData?.secretaryName}
              onChange={handleInputChange}
              error={errors?.secretaryName}
              required
            />

            <Input
              label="Secretary Phone"
              type="tel"
              name="secretaryPhone"
              placeholder="+255 XXX XXX XXX"
              value={formData?.secretaryPhone}
              onChange={handleInputChange}
              error={errors?.secretaryPhone}
              required
            />

            <Input
              label="Secretary Email"
              type="email"
              name="secretaryEmail"
              placeholder="secretary@example.com"
              value={formData?.secretaryEmail}
              onChange={handleInputChange}
              error={errors?.secretaryEmail}
              required
            />

            <Input
              label="Secretary ID Number"
              type="text"
              name="secretaryId"
              placeholder="Enter national ID number"
              value={formData?.secretaryId}
              onChange={handleInputChange}
              error={errors?.secretaryId}
              required
            />
          </div>
        </div>

        {/* Head Coach Information */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 pb-2 border-b border-border">
            Head Coach
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Coach Full Name"
              type="text"
              name="coachName"
              placeholder="Enter coach's full name"
              value={formData?.coachName}
              onChange={handleInputChange}
              error={errors?.coachName}
              required
            />

            <Input
              label="Coach Phone"
              type="tel"
              name="coachPhone"
              placeholder="+255 XXX XXX XXX"
              value={formData?.coachPhone}
              onChange={handleInputChange}
              error={errors?.coachPhone}
              required
            />

            <Input
              label="Coach Email"
              type="email"
              name="coachEmail"
              placeholder="coach@example.com"
              value={formData?.coachEmail}
              onChange={handleInputChange}
              error={errors?.coachEmail}
            />

            <Input
              label="Coaching License Number"
              type="text"
              name="coachLicense"
              placeholder="Enter license number"
              value={formData?.coachLicense}
              onChange={handleInputChange}
              error={errors?.coachLicense}
              description="TBF coaching license required"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default OrganizationalStructure;
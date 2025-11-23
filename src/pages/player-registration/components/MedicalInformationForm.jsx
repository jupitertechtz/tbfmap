import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import DocumentUpload from './DocumentUpload';

const MedicalInformationForm = ({ formData, onChange, errors }) => {
  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const medicalClearanceOptions = [
    { value: 'cleared', label: 'Medically Cleared' },
    { value: 'conditional', label: 'Conditional Clearance' },
    { value: 'pending', label: 'Pending Medical Review' },
    { value: 'restricted', label: 'Restricted Activity' }
  ];

  const handleMedicalConditionChange = (condition, checked) => {
    const currentConditions = formData?.medicalConditions || [];
    if (checked) {
      onChange('medicalConditions', [...currentConditions, condition]);
    } else {
      onChange('medicalConditions', currentConditions?.filter(c => c !== condition));
    }
  };

  const medicalConditions = [
    'Asthma',
    'Diabetes',
    'Heart Condition',
    'High Blood Pressure',
    'Epilepsy',
    'Allergies',
    'Previous Injuries',
    'None'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Blood Type"
          options={bloodTypeOptions}
          value={formData?.bloodType || ''}
          onChange={(value) => onChange('bloodType', value)}
          error={errors?.bloodType}
          required
        />
        
        <Input
          label="Emergency Contact Name"
          type="text"
          placeholder="Enter emergency contact name"
          value={formData?.emergencyContactName || ''}
          onChange={(e) => onChange('emergencyContactName', e?.target?.value)}
          error={errors?.emergencyContactName}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Emergency Contact Phone"
          type="tel"
          placeholder="+255 XXX XXX XXX"
          value={formData?.emergencyContactPhone || ''}
          onChange={(e) => onChange('emergencyContactPhone', e?.target?.value)}
          error={errors?.emergencyContactPhone}
          required
        />
        
        <Input
          label="Relationship to Player"
          type="text"
          placeholder="e.g., Parent, Spouse, Sibling"
          value={formData?.emergencyContactRelationship || ''}
          onChange={(e) => onChange('emergencyContactRelationship', e?.target?.value)}
          required
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Medical Conditions</h4>
        <p className="text-xs text-muted-foreground">Select all that apply to the player</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {medicalConditions?.map((condition) => (
            <Checkbox
              key={condition}
              label={condition}
              checked={(formData?.medicalConditions || [])?.includes(condition)}
              onChange={(e) => handleMedicalConditionChange(condition, e?.target?.checked)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Input
          label="Medical Condition Details"
          type="text"
          placeholder="Provide details about any medical conditions"
          value={formData?.medicalConditionDetails || ''}
          onChange={(e) => onChange('medicalConditionDetails', e?.target?.value)}
          description="Please specify any medical conditions that may affect basketball participation"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Current Medications"
          type="text"
          placeholder="List current medications (if any)"
          value={formData?.currentMedications || ''}
          onChange={(e) => onChange('currentMedications', e?.target?.value)}
        />
        
        <Input
          label="Allergies"
          type="text"
          placeholder="List known allergies"
          value={formData?.allergies || ''}
          onChange={(e) => onChange('allergies', e?.target?.value)}
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Medical Clearance</h4>
        <Select
          label="Medical Clearance Status"
          options={medicalClearanceOptions}
          value={formData?.medicalClearanceStatus || ''}
          onChange={(value) => onChange('medicalClearanceStatus', value)}
          error={errors?.medicalClearanceStatus}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Medical Certificate Issue Date"
            type="date"
            value={formData?.medicalCertificateDate || ''}
            onChange={(e) => onChange('medicalCertificateDate', e?.target?.value)}
            error={errors?.medicalCertificateDate}
            required
          />
          
          <Input
            label="Medical Certificate Expiry Date"
            type="date"
            value={formData?.medicalCertificateExpiry || ''}
            onChange={(e) => onChange('medicalCertificateExpiry', e?.target?.value)}
            error={errors?.medicalCertificateExpiry}
            required
          />
        </div>
      </div>
      <div className="space-y-4">
        <Input
          label="Examining Doctor Name"
          type="text"
          placeholder="Enter examining doctor's name"
          value={formData?.examiningDoctor || ''}
          onChange={(e) => onChange('examiningDoctor', e?.target?.value)}
          required
        />
        
        <Input
          label="Medical Facility"
          type="text"
          placeholder="Enter medical facility name"
          value={formData?.medicalFacility || ''}
          onChange={(e) => onChange('medicalFacility', e?.target?.value)}
          required
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Injury History</h4>
        <Input
          label="Previous Injuries"
          type="text"
          placeholder="Describe any previous basketball-related injuries"
          value={formData?.previousInjuries || ''}
          onChange={(e) => onChange('previousInjuries', e?.target?.value)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Recovery Status"
            type="text"
            placeholder="Current recovery status"
            value={formData?.recoveryStatus || ''}
            onChange={(e) => onChange('recoveryStatus', e?.target?.value)}
          />
          
          <Checkbox
            label="Cleared for Full Activity"
            checked={formData?.clearedForActivity || false}
            onChange={(e) => onChange('clearedForActivity', e?.target?.checked)}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Insurance Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Insurance Provider"
            type="text"
            placeholder="Enter insurance company name"
            value={formData?.insuranceProvider || ''}
            onChange={(e) => onChange('insuranceProvider', e?.target?.value)}
          />
          
          <Input
            label="Policy Number"
            type="text"
            placeholder="Enter insurance policy number"
            value={formData?.insurancePolicyNumber || ''}
            onChange={(e) => onChange('insurancePolicyNumber', e?.target?.value)}
          />
        </div>
      </div>

      {/* Medical Certificate Upload */}
      <div className="space-y-4">
        <DocumentUpload
          label="Medical Certificate"
          description="Upload a scanned copy of your medical clearance certificate"
          formData={formData}
          fieldName="medicalCertificateFile"
          onChange={onChange}
          errors={errors}
          acceptedTypes=".pdf,.jpg,.jpeg,.png"
          maxSizeMB={10}
          required={false}
        />
      </div>
    </div>
  );
};

export default MedicalInformationForm;
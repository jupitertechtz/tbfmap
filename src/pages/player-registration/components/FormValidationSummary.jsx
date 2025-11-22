import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FormValidationSummary = ({ errors, onNavigateToSection }) => {
  const errorSections = {
    0: 'Personal Details',
    1: 'Physical Attributes',
    2: 'Medical Information',
    3: 'Academic Background',
    4: 'Employment Information',
    5: 'Player Photo'
  };

  const sectionErrors = {};
  
  // Group errors by section
  Object.keys(errors)?.forEach(field => {
    let sectionIndex = 0;
    
    // Determine section based on field name
    if (['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'nationalId', 'phoneNumber', 'email']?.includes(field)) {
      sectionIndex = 0;
    } else if (['height', 'weight', 'primaryPosition', 'jerseyNumber']?.includes(field)) {
      sectionIndex = 1;
    } else if (['bloodType', 'emergencyContactName', 'emergencyContactPhone', 'medicalClearanceStatus', 'medicalCertificateDate', 'medicalCertificateExpiry']?.includes(field)) {
      sectionIndex = 2;
    } else if (['educationLevel', 'studentStatus', 'institutionName', 'academicEligibility']?.includes(field)) {
      sectionIndex = 3;
    } else if (['employmentStatus', 'professionalLevel']?.includes(field)) {
      sectionIndex = 4;
    } else if (['playerPhoto']?.includes(field)) {
      sectionIndex = 5;
    }
    
    if (!sectionErrors?.[sectionIndex]) {
      sectionErrors[sectionIndex] = [];
    }
    sectionErrors?.[sectionIndex]?.push({ field, message: errors?.[field] });
  });

  const totalErrors = Object.keys(errors)?.length;

  if (totalErrors === 0) {
    return (
      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Icon name="CheckCircle" size={20} className="text-success" />
          <span className="text-sm font-medium text-success">
            All required fields are completed correctly!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-error/10 border border-error/20 rounded-lg p-4 space-y-4">
      {/* Error Summary Header */}
      <div className="flex items-center space-x-2">
        <Icon name="AlertCircle" size={20} className="text-error" />
        <div>
          <h4 className="text-sm font-medium text-error">
            {totalErrors} error{totalErrors > 1 ? 's' : ''} found
          </h4>
          <p className="text-xs text-error/80">
            Please review and correct the following issues before submitting:
          </p>
        </div>
      </div>
      {/* Error Details by Section */}
      <div className="space-y-3">
        {Object.entries(sectionErrors)?.map(([sectionIndex, sectionErrorList]) => (
          <div key={sectionIndex} className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-foreground flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-warning" />
                <span>{errorSections?.[sectionIndex]}</span>
                <span className="text-xs text-muted-foreground">
                  ({sectionErrorList?.length} error{sectionErrorList?.length > 1 ? 's' : ''})
                </span>
              </h5>
              
              <Button
                variant="outline"
                size="xs"
                onClick={() => onNavigateToSection(parseInt(sectionIndex))}
                iconName="ArrowRight"
                iconPosition="right"
              >
                Go to Section
              </Button>
            </div>
            
            <div className="ml-6 space-y-1">
              {sectionErrorList?.map(({ field, message }, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Icon name="Dot" size={12} className="text-error mt-1" />
                  <span className="text-xs text-error">{message}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Quick Fix Suggestions */}
      <div className="bg-card border border-border rounded-lg p-3">
        <h5 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
          <Icon name="Lightbulb" size={16} className="text-warning" />
          <span>Quick Fix Tips</span>
        </h5>
        
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Required fields are marked with an asterisk (*)</li>
          <li>• Check date formats (DD/MM/YYYY)</li>
          <li>• Ensure phone numbers include country code (+255)</li>
          <li>• Email addresses must be valid format</li>
          <li>• Photo must be under 5MB and in JPEG/PNG format</li>
        </ul>
      </div>
    </div>
  );
};

export default FormValidationSummary;
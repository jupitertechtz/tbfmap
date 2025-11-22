import React from 'react';
import Icon from '../../../components/AppIcon';

const FormProgress = ({ currentStep, totalSteps, completedSections }) => {
  const steps = [
    { id: 1, label: 'Basic Info', key: 'basicInfo' },
    { id: 2, label: 'Contact', key: 'contact' },
    { id: 3, label: 'Organization', key: 'organization' },
    { id: 4, label: 'Visual Identity', key: 'visual' },
    { id: 5, label: 'Banking', key: 'banking' },
    { id: 6, label: 'Documents', key: 'documents' }
  ];

  const getStepStatus = (step) => {
    if (completedSections?.[step?.key]) return 'completed';
    if (step?.id === currentStep) return 'current';
    if (step?.id < currentStep) return 'visited';
    return 'pending';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'Check';
      case 'current':
        return 'Circle';
      default:
        return 'Circle';
    }
  };

  const completionPercentage = Math.round((Object.values(completedSections)?.filter(Boolean)?.length / steps?.length) * 100);

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Registration Progress</h3>
        <div className="text-sm text-muted-foreground">
          {completionPercentage}% Complete
        </div>
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      {/* Steps */}
      <div className="space-y-4">
        {steps?.map((step, index) => {
          const status = getStepStatus(step);
          const isLast = index === steps?.length - 1;

          return (
            <div key={step?.id} className="relative">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  status === 'completed' 
                    ? 'bg-success border-success text-success-foreground'
                    : status === 'current' ?'bg-primary border-primary text-primary-foreground'
                    : status === 'visited' ?'bg-muted border-muted-foreground text-muted-foreground' :'bg-background border-border text-muted-foreground'
                }`}>
                  <Icon 
                    name={getStepIcon(status)} 
                    size={16} 
                    className={status === 'completed' ? 'text-success-foreground' : ''}
                  />
                </div>
                
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    status === 'current' ?'text-primary' 
                      : status === 'completed' ?'text-success' :'text-muted-foreground'
                  }`}>
                    {step?.label}
                  </p>
                </div>

                {status === 'completed' && (
                  <Icon name="CheckCircle" size={16} className="text-success" />
                )}
              </div>
              {/* Connector Line */}
              {!isLast && (
                <div className={`absolute left-4 top-8 w-0.5 h-4 ${
                  status === 'completed' || (index + 1 < currentStep)
                    ? 'bg-success' :'bg-border'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {Object.values(completedSections)?.filter(Boolean)?.length} of {steps?.length} sections completed
          </span>
          {completionPercentage === 100 && (
            <div className="flex items-center space-x-1 text-success">
              <Icon name="CheckCircle" size={16} />
              <span className="font-medium">Ready to submit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormProgress;
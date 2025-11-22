import React from 'react';
import Icon from '../../../components/AppIcon';

const FormProgressIndicator = ({ currentStep, completedSteps, totalSteps, stepLabels }) => {
  const getStepStatus = (stepIndex) => {
    if (completedSteps?.includes(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepIndex, status) => {
    if (status === 'completed') return 'Check';
    if (status === 'current') return 'Circle';
    return 'Circle';
  };

  const calculateProgress = () => {
    return Math.round((completedSteps?.length / totalSteps) * 100);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Registration Progress</h3>
          <span className="text-sm text-muted-foreground">
            {completedSteps?.length} of {totalSteps} sections completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stepLabels?.map((label, index) => {
            const status = getStepStatus(index);
            const iconName = getStepIcon(index, status);
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
                  status === 'completed'
                    ? 'bg-success/10 text-success'
                    : status === 'current' ?'bg-primary/10 text-primary' :'bg-muted text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'completed'
                      ? 'bg-success text-success-foreground'
                      : status === 'current' ?'bg-primary text-primary-foreground' :'bg-muted-foreground/20'
                  }`}
                >
                  <Icon name={iconName} size={16} />
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Completion Status */}
        {completedSteps?.length === totalSteps && (
          <div className="flex items-center space-x-2 p-3 bg-success/10 rounded-lg">
            <Icon name="CheckCircle" size={20} className="text-success" />
            <span className="text-sm font-medium text-success">
              All sections completed! Ready to submit registration.
            </span>
          </div>
        )}

        {/* Current Step Info */}
        {completedSteps?.length < totalSteps && (
          <div className="flex items-center space-x-2 p-3 bg-primary/10 rounded-lg">
            <Icon name="Info" size={20} className="text-primary" />
            <span className="text-sm text-primary">
              Currently completing: <strong>{stepLabels?.[currentStep]}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormProgressIndicator;
import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustBadges = [
    {
      id: 1,
      icon: 'Shield',
      label: 'SSL Secured',
      description: 'Your data is encrypted and protected'
    },
    {
      id: 2,
      icon: 'CheckCircle',
      label: 'Government Approved',
      description: 'Officially recognized by Tanzania Sports Authority'
    },
    {
      id: 3,
      icon: 'Lock',
      label: 'Data Protected',
      description: 'Compliant with Tanzania Data Protection Act'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      {/* Official Branding */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Icon name="Trophy" size={32} color="white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Tanzania Basketball Federation
        </h1>
        <p className="text-sm text-muted-foreground">
          Official Registration & Management System
        </p>
      </div>
      {/* Trust Badges */}
      <div className="grid grid-cols-1 gap-3">
        {trustBadges?.map((badge) => (
          <div
            key={badge?.id}
            className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border/50"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-success/10 rounded-full">
              <Icon name={badge?.icon} size={16} className="text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{badge?.label}</p>
              <p className="text-xs text-muted-foreground">{badge?.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* System Status */}
      <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <p className="text-xs text-success font-medium">System Status: Online</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated: {new Date()?.toLocaleString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default TrustSignals;
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RegistrationLinks = () => {
  const registrationOptions = [
    {
      role: 'team-manager',
      title: 'Team Manager',
      description: 'Register your basketball team and manage players',
      route: '/team-registration',
      icon: 'Users',
      color: 'text-primary'
    },
    {
      role: 'player',
      title: 'Player',
      description: 'Join the federation as an individual player',
      route: '/player-registration',
      icon: 'User',
      color: 'text-accent'
    },
    {
      role: 'official',
      title: 'Game Official',
      description: 'Register as referee, commissioner, or table official',
      route: '/match-management',
      icon: 'Whistle',
      color: 'text-secondary'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          New to TBF?
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your registration type to get started
        </p>
      </div>
      <div className="space-y-3">
        {registrationOptions?.map((option) => (
          <Link
            key={option?.role}
            to={option?.route}
            className="block p-4 bg-card border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all micro-interaction"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                <Icon name={option?.icon} size={20} className={option?.color} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Register as {option?.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {option?.description}
                </p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
      {/* Public Portal Link */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Looking for league information?
          </p>
          <Link to="/public-league-portal">
            <Button
              variant="outline"
              size="sm"
              iconName="Globe"
              iconPosition="left"
              fullWidth
            >
              Visit Public League Portal
            </Button>
          </Link>
        </div>
      </div>
      {/* Contact Information */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-xs font-medium text-foreground mb-2">
            Need Help?
          </p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Email: support@tbf.co.tz
            </p>
            <p className="text-xs text-muted-foreground">
              Phone: +255 123 456 789
            </p>
            <p className="text-xs text-muted-foreground">
              Office Hours: Mon-Fri 8:00 AM - 5:00 PM EAT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationLinks;
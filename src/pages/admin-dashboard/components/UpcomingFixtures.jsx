import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingFixtures = ({ fixtures }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Fixtures</h3>
        <Button variant="ghost" size="sm" iconName="Calendar">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {fixtures?.map((fixture) => (
          <div key={fixture?.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium">{formatDate(fixture?.date)}</p>
                <p className="text-sm font-semibold text-foreground">{formatTime(fixture?.date)}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{fixture?.homeTeam}</p>
                  <p className="text-xs text-muted-foreground">{fixture?.homeRecord}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">VS</span>
                  </div>
                </div>
                
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{fixture?.awayTeam}</p>
                  <p className="text-xs text-muted-foreground">{fixture?.awayRecord}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{fixture?.venue}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Icon name="MapPin" size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{fixture?.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingFixtures;
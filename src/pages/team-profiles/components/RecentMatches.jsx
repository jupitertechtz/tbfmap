import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentMatches = ({ matches }) => {
  const getResultIcon = (result) => {
    switch (result) {
      case 'Win': return 'CheckCircle';
      case 'Loss': return 'XCircle';
      default: return 'Clock';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Win': return 'text-success';
      case 'Loss': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg card-shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Recent Matches</h2>
        <Button variant="outline" size="sm" iconName="Calendar">
          View Schedule
        </Button>
      </div>
      <div className="space-y-4">
        {matches?.map((match) => (
          <div key={match?.id} className="bg-muted rounded-lg p-4 micro-interaction hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Match Info */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  match?.result === 'Win' ? 'bg-success/10' : 
                  match?.result === 'Loss' ? 'bg-error/10' : 'bg-muted-foreground/10'
                }`}>
                  <Icon 
                    name={getResultIcon(match?.result)} 
                    size={20} 
                    className={getResultColor(match?.result)}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-foreground">
                      {match?.isHome ? 'vs' : '@'} {match?.opponent}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      match?.isHome ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                    }`}>
                      {match?.isHome ? 'Home' : 'Away'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>{match?.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={14} />
                      <span>{match?.venue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {match?.teamScore} - {match?.opponentScore}
                  </p>
                  <p className="text-sm text-muted-foreground">{match?.result}</p>
                </div>
                
                <Button variant="ghost" size="sm" iconName="ExternalLink">
                  Details
                </Button>
              </div>
            </div>

            {/* Match Highlights */}
            {match?.highlights && match?.highlights?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {match?.highlights?.map((highlight, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {matches?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recent matches available.</p>
        </div>
      )}
    </div>
  );
};

export default RecentMatches;
import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingFixtures = ({ fixtures }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date?.toLocaleDateString('en-GB', { weekday: 'short' }),
      date: date?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      time: date?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getMatchStatus = (status) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', color: 'text-primary bg-primary/10' },
      live: { label: 'Live', color: 'text-error bg-error/10' },
      postponed: { label: 'Postponed', color: 'text-warning bg-warning/10' },
      cancelled: { label: 'Cancelled', color: 'text-muted-foreground bg-muted' }
    };
    
    return statusConfig?.[status] || statusConfig?.scheduled;
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Upcoming Fixtures</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Next matches in the league
            </p>
          </div>
          <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left">
            View All
          </Button>
        </div>
      </div>
      {/* Desktop List View */}
      <div className="hidden md:block">
        <div className="divide-y divide-border">
          {fixtures?.map((fixture) => {
            const dateInfo = formatDate(fixture?.dateTime);
            const status = getMatchStatus(fixture?.status);
            
            return (
              <div key={fixture?.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Date & Time */}
                  <div className="flex flex-col items-center min-w-0 w-20">
                    <span className="text-xs text-muted-foreground uppercase">{dateInfo?.day}</span>
                    <span className="text-sm font-medium text-foreground">{dateInfo?.date}</span>
                    <span className="text-xs text-muted-foreground">{dateInfo?.time}</span>
                  </div>

                  {/* Teams */}
                  <div className="flex-1 flex items-center justify-center space-x-8 mx-8">
                    {/* Home Team */}
                    <div className="flex items-center space-x-3 flex-1 justify-end">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{fixture?.homeTeam?.name}</p>
                        <p className="text-xs text-muted-foreground">{fixture?.homeTeam?.record}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image 
                          src={fixture?.homeTeam?.logo} 
                          alt={fixture?.homeTeam?.logoAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-muted-foreground">VS</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${status?.color}`}>
                        {status?.label}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image 
                          src={fixture?.awayTeam?.logo} 
                          alt={fixture?.awayTeam?.logoAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{fixture?.awayTeam?.name}</p>
                        <p className="text-xs text-muted-foreground">{fixture?.awayTeam?.record}</p>
                      </div>
                    </div>
                  </div>

                  {/* Venue & Actions */}
                  <div className="flex flex-col items-end min-w-0 w-32">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                      <Icon name="MapPin" size={12} />
                      <span className="truncate">{fixture?.venue}</span>
                    </div>
                    <Button variant="ghost" size="xs" iconName="ExternalLink" iconPosition="right">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4">
        {fixtures?.map((fixture) => {
          const dateInfo = formatDate(fixture?.dateTime);
          const status = getMatchStatus(fixture?.status);
          
          return (
            <div key={fixture?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
              {/* Date & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{dateInfo?.day}, {dateInfo?.date}</span>
                  <span className="text-sm text-muted-foreground">• {dateInfo?.time}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${status?.color}`}>
                  {status?.label}
                </span>
              </div>
              {/* Teams */}
              <div className="flex items-center justify-between mb-4">
                {/* Home Team */}
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <Image 
                      src={fixture?.homeTeam?.logo} 
                      alt={fixture?.homeTeam?.logoAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{fixture?.homeTeam?.name}</p>
                    <p className="text-xs text-muted-foreground">{fixture?.homeTeam?.record}</p>
                  </div>
                </div>

                {/* VS */}
                <div className="px-4">
                  <span className="text-sm font-medium text-muted-foreground">VS</span>
                </div>

                {/* Away Team */}
                <div className="flex items-center space-x-3 flex-1 justify-end">
                  <div className="text-right">
                    <p className="font-medium text-foreground text-sm">{fixture?.awayTeam?.name}</p>
                    <p className="text-xs text-muted-foreground">{fixture?.awayTeam?.record}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <Image 
                      src={fixture?.awayTeam?.logo} 
                      alt={fixture?.awayTeam?.logoAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Venue & Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="MapPin" size={12} />
                  <span>{fixture?.venue}</span>
                </div>
                <Button variant="ghost" size="xs" iconName="ExternalLink" iconPosition="right">
                  Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingFixtures;
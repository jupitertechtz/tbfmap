import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecentResults = ({ results }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const getWinnerStyle = (homeScore, awayScore, isHome) => {
    const isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;
    return isWinner ? 'text-foreground font-bold' : 'text-muted-foreground';
  };

  const getMatchHighlight = (highlight) => {
    const highlights = {
      'high-scoring': { icon: 'Zap', color: 'text-warning', label: 'High Scoring' },
      'overtime': { icon: 'Clock', color: 'text-error', label: 'Overtime' },
      'upset': { icon: 'TrendingUp', color: 'text-success', label: 'Upset Win' },
      'close': { icon: 'Target', color: 'text-accent', label: 'Close Game' }
    };
    
    return highlights?.[highlight] || null;
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recent Results</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {results?.length > 0 
                ? `Showing ${results.length} completed match${results.length !== 1 ? 'es' : ''}`
                : 'No completed matches yet'}
            </p>
          </div>
          {results?.length > 0 && (
            <Button variant="outline" size="sm" iconName="BarChart3" iconPosition="left">
              All Results
            </Button>
          )}
        </div>
      </div>
      {/* Desktop List View */}
      <div className="hidden md:block">
        {!results || results.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="CalendarX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No completed matches to display yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Results will appear here once matches are completed.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results?.map((result) => {
            const highlight = getMatchHighlight(result?.highlight);
            
            return (
              <div key={result?.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Date */}
                  <div className="flex flex-col items-center min-w-0 w-20">
                    <span className="text-sm font-medium text-foreground">{formatDate(result?.date)}</span>
                    <span className="text-xs text-muted-foreground">{result?.venue}</span>
                  </div>

                  {/* Match Result */}
                  <div className="flex-1 flex items-center justify-center space-x-8 mx-8">
                    {/* Home Team */}
                    <div className="flex items-center space-x-3 flex-1 justify-end">
                      <div className="text-right">
                        <p className={`font-medium ${getWinnerStyle(result?.homeScore, result?.awayScore, true)}`}>
                          {result?.homeTeam?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{result?.homeTeam?.shortName}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image 
                          src={result?.homeTeam?.logo} 
                          alt={result?.homeTeam?.logoAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xl font-bold ${getWinnerStyle(result?.homeScore, result?.awayScore, true)}`}>
                          {result?.homeScore}
                        </span>
                        <span className="text-muted-foreground">-</span>
                        <span className={`text-xl font-bold ${getWinnerStyle(result?.homeScore, result?.awayScore, false)}`}>
                          {result?.awayScore}
                        </span>
                      </div>
                      {result?.overtime && (
                        <span className="text-xs text-error font-medium">OT</span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image 
                          src={result?.awayTeam?.logo} 
                          alt={result?.awayTeam?.logoAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className={`font-medium ${getWinnerStyle(result?.homeScore, result?.awayScore, false)}`}>
                          {result?.awayTeam?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{result?.awayTeam?.shortName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights & Actions */}
                  <div className="flex flex-col items-end min-w-0 w-32">
                    {highlight && (
                      <div className={`flex items-center space-x-1 text-xs mb-1 ${highlight?.color}`}>
                        <Icon name={highlight?.icon} size={12} />
                        <span>{highlight?.label}</span>
                      </div>
                    )}
                    <Button variant="ghost" size="xs" iconName="Eye" iconPosition="right">
                      Match Report
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4">
        {!results || results.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="CalendarX" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No completed matches to display yet.</p>
          </div>
        ) : (
          results?.map((result) => {
          const highlight = getMatchHighlight(result?.highlight);
          
          return (
            <div key={result?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
              {/* Date & Venue */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{formatDate(result?.date)}</span>
                </div>
                {highlight && (
                  <div className={`flex items-center space-x-1 text-xs ${highlight?.color}`}>
                    <Icon name={highlight?.icon} size={12} />
                    <span>{highlight?.label}</span>
                  </div>
                )}
              </div>
              {/* Match Result */}
              <div className="flex items-center justify-between mb-4">
                {/* Home Team */}
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <Image 
                      src={result?.homeTeam?.logo} 
                      alt={result?.homeTeam?.logoAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${getWinnerStyle(result?.homeScore, result?.awayScore, true)}`}>
                      {result?.homeTeam?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{result?.homeTeam?.shortName}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center px-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getWinnerStyle(result?.homeScore, result?.awayScore, true)}`}>
                      {result?.homeScore}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className={`text-lg font-bold ${getWinnerStyle(result?.homeScore, result?.awayScore, false)}`}>
                      {result?.awayScore}
                    </span>
                  </div>
                  {result?.overtime && (
                    <span className="text-xs text-error font-medium">OT</span>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex items-center space-x-3 flex-1 justify-end">
                  <div className="text-right">
                    <p className={`font-medium text-sm ${getWinnerStyle(result?.homeScore, result?.awayScore, false)}`}>
                      {result?.awayTeam?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{result?.awayTeam?.shortName}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <Image 
                      src={result?.awayTeam?.logo} 
                      alt={result?.awayTeam?.logoAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Venue & Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="MapPin" size={12} />
                  <span>{result?.venue}</span>
                </div>
                <Button variant="ghost" size="xs" iconName="Eye" iconPosition="right">
                  Report
                </Button>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};

export default RecentResults;
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentResults = ({ results }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getResultStatus = (homeScore, awayScore) => {
    if (homeScore > awayScore) return 'home_win';
    if (awayScore > homeScore) return 'away_win';
    return 'draw';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Results</h3>
        <Button variant="ghost" size="sm" iconName="Trophy">
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {results?.map((result) => {
          const status = getResultStatus(result?.homeScore, result?.awayScore);
          
          return (
            <div key={result?.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="text-center min-w-[40px]">
                  <p className="text-xs text-muted-foreground font-medium">{formatDate(result?.date)}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right min-w-[100px]">
                    <p className={`text-sm font-medium ${status === 'home_win' ? 'text-success' : 'text-foreground'}`}>
                      {result?.homeTeam}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-muted rounded-md px-3 py-1">
                    <span className={`text-sm font-bold ${status === 'home_win' ? 'text-success' : 'text-foreground'}`}>
                      {result?.homeScore}
                    </span>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className={`text-sm font-bold ${status === 'away_win' ? 'text-success' : 'text-foreground'}`}>
                      {result?.awayScore}
                    </span>
                  </div>
                  
                  <div className="text-left min-w-[100px]">
                    <p className={`text-sm font-medium ${status === 'away_win' ? 'text-success' : 'text-foreground'}`}>
                      {result?.awayTeam}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">{result?.league}</span>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentResults;
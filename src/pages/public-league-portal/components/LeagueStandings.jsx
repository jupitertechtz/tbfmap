import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Select from '../../../components/ui/Select';

const LeagueStandings = ({ standings, selectedSeason, leagues, selectedLeagueId, onLeagueChange, isLoading }) => {
  const getFormIndicator = (form) => {
    return form?.split('')?.map((result, index) => (
      <span
        key={index}
        className={`w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center ${
          result === 'W' ?'bg-success text-success-foreground' 
            : result === 'L' ?'bg-error text-error-foreground' :'bg-muted text-muted-foreground'
        }`}
      >
        {result}
      </span>
    ));
  };

  const getPositionChange = (change) => {
    if (change > 0) {
      return <Icon name="TrendingUp" size={16} className="text-success" />;
    } else if (change < 0) {
      return <Icon name="TrendingDown" size={16} className="text-error" />;
    }
    return <Icon name="Minus" size={16} className="text-muted-foreground" />;
  };

  const selectedLeague = leagues?.find(l => l?.id === selectedLeagueId);
  const leagueOptions = leagues?.map(league => ({
    value: league?.id,
    label: `${league?.name} (${league?.season || 'N/A'})`
  })) || [];

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">League Standings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedSeason} Season {selectedLeague?.updatedAt ? `• Updated ${new Date(selectedLeague.updatedAt).toLocaleDateString()}` : ''}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {leagues && leagues.length > 0 && (
              <div className="w-full sm:w-64">
                <Select
                  options={leagueOptions}
                  value={selectedLeagueId}
                  onChange={onLeagueChange}
                  placeholder="Select League"
                />
              </div>
            )}
            {selectedLeague && (
              <div className="flex items-center space-x-2">
                <Icon name="Trophy" size={20} className="text-primary" />
                <span className="text-sm font-medium text-primary">{selectedLeague?.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-12 text-center">
          <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading standings...</p>
        </div>
      ) : standings?.length === 0 ? (
        <div className="p-12 text-center">
          <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No standings available for this league.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Position</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Team</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">GP</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">W</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">L</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">PTS</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">+/-</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-muted-foreground">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings?.map((team, index) => (
              <tr key={team?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    {getPositionChange(team?.positionChange)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                      <Image 
                        src={team?.logo} 
                        alt={team?.logoAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{team?.name}</p>
                      <p className="text-xs text-muted-foreground">{team?.shortName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-sm text-foreground">{team?.gamesPlayed ?? 0}</td>
                <td className="py-4 px-4 text-center text-sm font-medium text-success">{team?.wins ?? 0}</td>
                <td className="py-4 px-4 text-center text-sm font-medium text-error">{team?.losses ?? 0}</td>
                <td className="py-4 px-4 text-center text-sm font-bold text-foreground">{team?.points ?? 0}</td>
                <td className={`py-4 px-4 text-center text-sm font-medium ${
                  (team?.pointsDiff ?? 0) > 0 ? 'text-success' : (team?.pointsDiff ?? 0) < 0 ? 'text-error' : 'text-muted-foreground'
                }`}>
                  {(team?.pointsDiff ?? 0) > 0 ? '+' : ''}{team?.pointsDiff ?? 0}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center space-x-1">
                    {getFormIndicator(team?.form)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
          {/* Mobile Card View */}
          <div className="lg:hidden p-4 space-y-4">
        {standings?.map((team, index) => (
          <div key={team?.id} className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <Image 
                    src={team?.logo} 
                    alt={team?.logoAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{team?.name}</p>
                  <p className="text-xs text-muted-foreground">{team?.shortName}</p>
                </div>
              </div>
              {getPositionChange(team?.positionChange)}
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">GP</p>
                <p className="text-sm font-medium text-foreground">{team?.gamesPlayed ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">W-L</p>
                <p className="text-sm font-medium text-foreground">{team?.wins ?? 0}-{team?.losses ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PTS</p>
                <p className="text-sm font-bold text-foreground">{team?.points ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">+/-</p>
                <p className={`text-sm font-medium ${
                  (team?.pointsDiff ?? 0) > 0 ? 'text-success' : (team?.pointsDiff ?? 0) < 0 ? 'text-error' : 'text-muted-foreground'
                }`}>
                  {(team?.pointsDiff ?? 0) > 0 ? '+' : ''}{team?.pointsDiff ?? 0}
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-center space-x-1">
              {getFormIndicator(team?.form)}
            </div>
          </div>
        ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LeagueStandings;
import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const MatchCenterFilterHeader = ({ 
  selectedLeague,
  onLeagueChange,
  selectedSeason,
  onSeasonChange,
  selectedTeam,
  onTeamChange,
  dateRange,
  onDateRangeChange,
  onExport,
  leagues = [],
  teams = []
}) => {
  // Generate league options
  const leagueOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Leagues' }];
    
    if (leagues && leagues.length > 0) {
      leagues.forEach(league => {
        options.push({ 
          value: league.id, 
          label: `${league.name}${league.season ? ` - ${league.season}` : ''}` 
        });
      });
    }
    
    return options;
  }, [leagues]);

  // Generate season options from leagues
  const seasonOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Seasons' }];
    
    if (leagues && leagues.length > 0) {
      // Get unique seasons from leagues
      const uniqueSeasons = [...new Set(leagues.map(league => league.season).filter(Boolean))];
      uniqueSeasons.sort().reverse(); // Most recent first
      
      uniqueSeasons.forEach(season => {
        options.push({ value: season, label: `${season} Season` });
      });
    }
    
    return options;
  }, [leagues]);

  // Generate team options
  const teamOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Teams' }];
    
    if (teams && teams.length > 0) {
      teams.forEach(team => {
        options.push({ value: team.id, label: team.name || team.shortName });
      });
    }
    
    return options;
  }, [teams]);

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title and Description */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-2">Match Center</h1>
          <p className="text-muted-foreground">
            View match results, live scores, and detailed game statistics
          </p>
        </div>

        {/* Export Actions */}
        {onExport && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onExport('pdf')}
              iconName="Download"
              iconPosition="left"
            >
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Date Range - Start Date */}
        <Input
          label="Start Date"
          type="date"
          value={dateRange?.startDate || ''}
          onChange={(e) => onDateRangeChange({ 
            ...dateRange, 
            startDate: e?.target?.value 
          })}
          className="w-full"
        />
        
        {/* Date Range - End Date */}
        <Input
          label="End Date"
          type="date"
          value={dateRange?.endDate || ''}
          onChange={(e) => onDateRangeChange({ 
            ...dateRange, 
            endDate: e?.target?.value 
          })}
          className="w-full"
        />
        
        {/* League Filter */}
        <Select
          label="League"
          options={leagueOptions}
          value={selectedLeague || 'all'}
          onChange={onLeagueChange}
        />
        
        {/* Season Filter */}
        <Select
          label="Season"
          options={seasonOptions}
          value={selectedSeason || 'all'}
          onChange={onSeasonChange}
        />
      </div>

      {/* Team Filter - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Select
          label="Team"
          options={teamOptions}
          value={selectedTeam || 'all'}
          onChange={onTeamChange}
        />
      </div>
    </div>
  );
};

export default MatchCenterFilterHeader;

